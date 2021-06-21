import path from 'path'
import normalize from 'normalize-path'
import sanitize from 'sanitize-filename'
import merge from 'deepmerge'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as readJson } from '../FileSystem/readJSON'
import { handler as writeJson } from '../FileSystem/writeJSON'
import { handler as writeFile } from '../FileSystem/writeFile'
import { handler as buildDev } from './buildDev'
import { handler as buildProd } from './buildProd'
import { parseProperty } from '@/Utils/parseProperty'
import { ProcessSpawner } from '@/Utils/ProcessSpawner'
import { writeToRenderer } from '@/Utils/stream'
import {
  PROJECT_EXTEND_DIRECTORY_NAME,
  PROJECT_EXTEND_PACKAGE_NAME,
  PROJECT_BUILD_APPLICATION_DIRECTORY_NAME,
  PROJECT_BUILD_SRC_MAIN_NAME,
  PROJECT_BUILD_SRC_INDEX_NAME,
  PROJECT_PACKAGE_NAME
} from '@/Const'

import RAW_PACKAGE from 'raw-loader!@/Template/Project/Build-App/PACKAGE.txt'
import RAW_MAIN from 'raw-loader!@/Template/Project/Build-App/MAIN.txt'

function writeError(error: string): void {
  const stream = writeToRenderer('build')
  stream.write(error)
  stream.destroy()
}

export async function handler(projectDirPath: string, buildMode: 'dev'|'prod'): Promise<Engine.GameProject.BuildToAppSuccess|Engine.GameProject.BuildToAppFail> {
  // 기본 빌드
  const built = await (buildMode === 'dev' ? buildDev : buildProd)(projectDirPath)
  if (!built.success) {
    return built as Engine.GameProject.BuildToAppFail
  }

  // 파일이 출력될 디렉토리 경로
  const output = normalize(path.resolve(built.path, '../', PROJECT_BUILD_APPLICATION_DIRECTORY_NAME, sanitize(new Date().toUTCString())))

  // 설정 불러오기
  const pkgPath = path.resolve(projectDirPath, PROJECT_EXTEND_DIRECTORY_NAME, PROJECT_EXTEND_PACKAGE_NAME)
  const pkgRead = await readJson(pkgPath)
  if (!pkgRead.success) {
    writeError(pkgRead.message)
    return pkgRead as Engine.GameProject.BuildToAppFail
  }
  const config = pkgRead.content as Engine.GameProject.Config

  // package.json 생성
  const appPkgPath = path.resolve(built.path, PROJECT_PACKAGE_NAME)
  const appPkgChunkContent = JSON.parse(
    parseProperty(RAW_PACKAGE, {
      ...config,
      OUTPUT: output
    })
  )
  const appPkgContent = merge(pkgRead.content, appPkgChunkContent) as object

  const appPkgWrite = await writeJson(appPkgPath, appPkgContent)
  if (!appPkgWrite.success) {
    writeError(appPkgWrite.message)
    return appPkgWrite as Engine.GameProject.BuildToAppFail
  }

  // main.js 생성
  const mainPath = path.resolve(built.path, PROJECT_BUILD_SRC_MAIN_NAME)
  const mainContent = parseProperty(RAW_MAIN, {
    BUILD_MODE: buildMode,
    INDEX: PROJECT_BUILD_SRC_INDEX_NAME,
    WIDTH: config.gameDisplaySize[0],
    HEIGHT: config.gameDisplaySize[1],
    RESIZABLE: config.gameDisplayResizable
  })

  const mainWrite = await writeFile(mainPath, mainContent)
  if (!mainWrite.success) {
    writeError(mainWrite.message)
    return mainWrite as Engine.GameProject.BuildToAppFail
  }


  const commands: string[] = [
    'npm i',
    'npm run electron:build'
  ]

  for (const command of commands) {
    try {
      const spawner = new ProcessSpawner({ shell: true, cwd: built.path })
      await spawner.spawn(command, { writeStream: writeToRenderer('build'), deadWord: 'build-to-app' })
    } catch (reason) {
      const { name, message } = reason as Error
      return {
        success: false,
        name,
        message
      }
    }
  }

  return {
    success: true,
    name: '앱으로 빌드',
    message: '성공적으로 앱으로 빌드했습니다',
    path: output
  }
}

export function ipc(): void {
  ipcMain.handle('build-to-app', async (e: IpcMainInvokeEvent, projectDirPath: string, buildMode: 'dev'|'prod'): Promise<Engine.GameProject.BuildToAppSuccess|Engine.GameProject.BuildToAppFail> => {
    return await handler(projectDirPath, buildMode)
  })
}