import path from 'path'
import normalize from 'normalize-path'
import glob from 'fast-glob'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_STORAGE_DIRECTORY_NAME
} from '@/Const'

export async function handler(projectDirPath: string, key: string, dirname: string, absolute: boolean = false): Promise<Engine.GameProject.GetStorageDirectoriesSuccess|Engine.GameProject.GetStorageDirectoriesFail> {
    const cwd: string = normalize(path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_STORAGE_DIRECTORY_NAME, key, dirname))

    try {
        const files: string[] = await glob([ '**/*.ts', '**/*.json' ], { cwd, absolute })
        const normalizeds: string[] = files.map((file: string): string => normalize(file))
        return {
            success: true,
            name: '스토리지 파일 목록',
            message: '스토리지 파일 목록을 찾는데 성공했습니다',
            path: cwd,
            files: normalizeds
        }
    } catch(e) {
        const { name, message } = e as Error
        return {
            success: false,
            name,
            message
        }
    }

}

export function ipc(): void {
    ipcMain.handle('get-storage-files', async (e: IpcMainInvokeEvent, projectDirPath: string, key: string, dirname: string, absolute: boolean): Promise<Engine.GameProject.GetStorageDirectoriesSuccess|Engine.GameProject.GetStorageDirectoriesFail> => {
        return await handler(projectDirPath, key, dirname, absolute)
    })
}