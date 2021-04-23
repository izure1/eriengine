import path from 'path'
import normalize from 'normalize-path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { nanoid } from 'nanoid'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_STORAGE_DIRECTORY_NAME
} from '@/Const'

export async function handler(projectDirPath: string, key: string = nanoid(10)): Promise<Engine.GameProject.AddStorageSuccess|Engine.GameProject.AddStorageFail> {
    const storageDirPath = normalize(
        path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_STORAGE_DIRECTORY_NAME, key)
    )

    const directoryMake = await makeDirectory(storageDirPath)
    if (!directoryMake.success) {
        return directoryMake as Engine.GameProject.AddStorageFail
    }

    return {
        success: true,
        name: '스토리지 생성 성공',
        message: '스토리지 생성에 성공했습니다',
        path: storageDirPath,
        key
    }
}

export function ipc(): void {
    ipcMain.handle('add-storage', async (e: IpcMainInvokeEvent, projectDirPath: string, key: string): Promise<Engine.GameProject.AddStorageSuccess|Engine.GameProject.AddStorageFail> => {
        return await handler(projectDirPath, key)
    })
}