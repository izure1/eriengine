import path from 'path'
import fs from 'fs-extra'
import normalize from 'normalize-path'
import glob from 'fast-glob'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as writeFile } from '../FileSystem/writeFile'
import { getModuleContentFromArray } from '@/Utils/getModuleContentFromArray'
import {
  PROJECT_SRC_DIRECTORY_NAME,
  PROJECT_SRC_STORAGE_DIRECTORY_NAME,
  PROJECT_SRC_STORAGELIST_NAME
} from '@/Const'


function mergeArray<T>(a: T[], b: T[]): T[] {
  const set: Set<T> = new Set([
    ...a,
    ...b
  ])
  return [ ...set ]
}

export async function handler(projectDirPath: string): Promise<Engine.GameProject.GenerateStorageListSuccess|Engine.GameProject.GenerateStorageListFail> {
  const cwd = normalize(path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_STORAGE_DIRECTORY_NAME))
  const declaredPath = normalize(path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_STORAGELIST_NAME))
  const aliasCwd = normalize(path.join('@', PROJECT_SRC_STORAGE_DIRECTORY_NAME))

  try {
    const convertToAlias = (itemPath: string): string => normalize(path.join(aliasCwd, itemPath))

    const items = await glob('**/*', { cwd, absolute: false, onlyFiles: false })
    const files = await glob([ '**/*.ts', '**/*.json' ], { cwd, absolute: false })

    const itemsAliases = items.map(convertToAlias)
    const filesAliases = files.map(convertToAlias)

    const jsonWrite = await writeFile(
      declaredPath,
      getModuleContentFromArray(
        filesAliases,
        '*',
        (maps) => {
          let content = 'export default {\n'
          const storages: Map<string, Map<string, ({ name: string, path: string })[]>> = new Map

          const getStorageDataFromPath = (itemPath: string): { relativePath: string, storage: string, subDirectory: string } => {
            const relativePath = normalize(path.relative(aliasCwd, itemPath))
            const paths = relativePath.split('/')
            const storage = paths[0]
            const subDirectory = paths[1]

            return {
              relativePath,
              storage,
              subDirectory
            }
          }

          const allAliases = mergeArray(filesAliases, itemsAliases).sort()
          for (const aliasPath of allAliases) {
            const { relativePath, storage, subDirectory } = getStorageDataFromPath(aliasPath)

            // 경로로부터 스토리지와 서브디렉토리를 등록
            if (!storage || !subDirectory) {
              continue
            }
            if (!storages.has(storage)) {
              storages.set(storage, new Map)
            }
            if (!storages.get(storage)!.has(subDirectory)) {
              storages.get(storage)!.set(subDirectory, [])
            }

            // 경로 중 모듈 파일이 아닐 경우를 필터링함
            try {
              const filePath = path.resolve(cwd, relativePath)
              // 경로가 파일이 아니라면 패스
              if (fs.statSync(filePath).isDirectory()) {
                continue
              }
              // 파일이지만 모듈이 지원하는 확장자가 아니라면 패스
              const extname = path.extname(filePath)
              if (extname !== '.ts' && extname !== '.json') {
                continue
              }
            } catch (reason) {
              continue
            }
          }

          // 모듈 파일 목록으로부터 스토리지 폴더 구성
          for (const map of maps) {
            const { storage, subDirectory } = getStorageDataFromPath(map.path)
            storages.get(storage)!.get(subDirectory)!.push(map)
          }

          for (const [ storage, directories ] of storages) {
            content += `    '${storage}': {\n`
            for (const [ directory, modules ] of directories) {
              content += `        '${directory}': {\n`
              for (const module of modules) {
                content += `            '${module.path}': ${module.name},\n`
              }
              content += `        },\n`
            }
            content += `    },\n`
          }
          content += '}'

          return content
        }
      )
    )
        
    if (!jsonWrite.success) {
      return jsonWrite as Engine.GameProject.GenerateStorageListFail
    }
  } catch (reason) {
    const { name, message } = reason as Error
    return {
      success: false,
      name,
      message
    }
  }

  return {
    success: true,
    name: '스토리지 리스트 생성 성공',
    message: '스토리지 리스트 생성에 성공했습니다',
    path: declaredPath
  }
}

export function ipc(): void {
  ipcMain.handle('generate-storage-list', async (e: IpcMainInvokeEvent, projectDirPath: string): Promise<Engine.GameProject.GenerateStorageListSuccess|Engine.GameProject.GenerateStorageListFail> => {
    return await handler(projectDirPath)
  })
}