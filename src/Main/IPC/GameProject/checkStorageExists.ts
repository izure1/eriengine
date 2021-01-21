import fs from 'fs-extra'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as getStoragePath } from './getStoragePath'

export async function handler(projectDirPath: string, key: string, dirname: string, filename: string): Promise<Engine.GameProject.CheckStorageExistsSuccess|Engine.GameProject.CheckStorageExistsFail> {
    const pathGet = await getStoragePath(projectDirPath, key, dirname, filename)
    if (!pathGet.success) {
        return pathGet as Engine.GameProject.CheckStorageExistsFail
    }

    if (!fs.existsSync(pathGet.path)) {
        return {
            success: true,
            name: '스토리지 확인',
            message: '스토리지 파일이 존재하지 않습니다',
            exists: false
        }
    }

    return {
        success: true,
        name: '스토리지 확인',
        message: '스토리지 확인에 성공했습니다',
        exists: true
    }
}

export function ipc(): void {
    ipcMain.handle('check-storage-exists', async (e: IpcMainInvokeEvent, projectDirPath: string, key: string, dirname: string, filename: string): Promise<Engine.GameProject.CheckStorageExistsSuccess|Engine.GameProject.CheckStorageExistsFail> => {
        return await handler(projectDirPath, key, dirname, filename)
    })
}