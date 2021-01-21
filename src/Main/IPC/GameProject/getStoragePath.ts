import path from 'path'
import normalize from 'normalize-path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_STORAGE_DIRECTORY_NAME
} from '@/Const'

export async function handler(projectDirPath: string, key: string, dirname: string, filename: string): Promise<Engine.GameProject.GetStoragePathSuccess|Engine.GameProject.GetStoragePathFail> {
    const filePath: string = normalize(
        path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_STORAGE_DIRECTORY_NAME, key, dirname, filename)
    )

    return {
        success: true,
        name: '스토리지 경로',
        message: '스토리지 파일 경로를 찾는데 성공했습니다',
        path: filePath
    }
}

export function ipc(): void {
    ipcMain.handle('get-storage-path', async (e: IpcMainInvokeEvent, projectDirPath: string, key: string, dirname: string, filename: string): Promise<Engine.GameProject.GetStoragePathSuccess|Engine.GameProject.GetStoragePathFail> => {
        return await handler(projectDirPath, key, dirname, filename)
    })
}