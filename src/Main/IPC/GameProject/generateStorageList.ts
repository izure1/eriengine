import path from 'path'
import normalize from 'normalize-path'
import glob from 'fast-glob'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as readDirectory } from '../FileSystem/readDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { getModuleContentFromArray } from '@/Utils/getModuleContentFromArray'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_STORAGE_DIRECTORY_NAME,
    PROJECT_SRC_STORAGELIST_NAME
} from '@/Const'

export async function handler(projectDirPath: string): Promise<Engine.GameProject.GenerateStorageListSuccess|Engine.GameProject.GenerateStorageListFail> {
    const cwd: string       = normalize(path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_STORAGE_DIRECTORY_NAME))
    const listPath: string  = normalize(path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_STORAGELIST_NAME))

    try {
        const aliasCwd: string          = normalize(path.join('@', PROJECT_SRC_STORAGE_DIRECTORY_NAME))
        const list: string[]            = await glob([ '**/*.ts', '**/*.json' ], { cwd, absolute: false })
        const jsonWrite                 = await writeFile(listPath,
            getModuleContentFromArray(
                list.map((filePath: string): string => {
                    return normalize(path.join(aliasCwd, filePath))
                }),
                '*',
                (maps): string => {
                    let content: string = 'export default {\n'
                    const storages: Map<string, Map<string, ({ name: string, path: string })[]>> = new Map
                    for (const map of maps) {
                        const paths: string[] = normalize(path.relative(aliasCwd, map.path)).split('/')
                        const storage: string|undefined     = paths[0]
                        const directory: string|undefined   = paths[1]
                        if (!storage || !directory) {
                            continue
                        }
                        if (!storages.has(storage)) {
                            storages.set(storage, new Map)
                        }
                        if (!storages.get(storage)!.has(directory)) {
                            storages.get(storage)!.set(directory, [])
                        }
                        const list = storages.get(storage)!.get(directory)!.push(map)
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
            ))
            
        if (!jsonWrite.success) {
            return jsonWrite as Engine.GameProject.GenerateStorageListFail
        }
    } catch(e) {
        const { name, message } = e as Error
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
        path: listPath
    }
}

export function ipc(): void {
    ipcMain.handle('generate-storage-list', async (e: IpcMainInvokeEvent, projectDirPath: string): Promise<Engine.GameProject.GenerateStorageListSuccess|Engine.GameProject.GenerateStorageListFail> => {
        return await handler(projectDirPath)
    })
}