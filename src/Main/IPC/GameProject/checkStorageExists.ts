import path from 'path'
import fs from 'fs-extra'
import normalize from 'normalize-path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_STORAGE_DIRECTORY_NAME
} from '@/Const'

export async function handler(projectDirPath: string, key: string, dirname: string, filename: string): Promise<Engine.GameProject.CheckStorageExistsSuccess|Engine.GameProject.CheckStorageExistsFail> {
    const storageDirPath: string = normalize(
        path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_STORAGE_DIRECTORY_NAME, key, dirname)
    )

    if (!fs.existsSync(storageDirPath)) {
        return {
            success: false,
            name: '스토리지 디렉토리 없음',
            message: '디렉토리가 존재하지 않습니다'
        }
    }

    const filePath: string = normalize(
        path.resolve(storageDirPath, filename)
    )

    if (!fs.existsSync(filePath)) {
        return {
            success: false,
            name: '스토리지 파일 없음',
            message: '파일이 존재하지 않습니다'
        }
    }

    return {
        success: true,
        name: '스토리지 확인 성공',
        message: '스토리지 확인에 성공했습니다',
        path: filePath
    }
}

export function ipc(): void {
    ipcMain.handle('check-storage-exists', async (e: IpcMainInvokeEvent, projectDirPath: string, key: string, dirname: string, filename: string): Promise<Engine.GameProject.CheckStorageExistsSuccess|Engine.GameProject.CheckStorageExistsFail> => {
        return await handler(projectDirPath, key, dirname, filename)
    })
}