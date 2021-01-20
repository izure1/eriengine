import path from 'path'
import normalize from 'normalize-path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_STORAGE_DIRECTORY_NAME
} from '@/Const'

export async function handler(projectDirPath: string, key: string, dirname: string): Promise<Engine.GameProject.AddStorageDirectorySuccess|Engine.GameProject.AddStorageDirectoryFail> {
    const storageDirPath: string = normalize(
        path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_STORAGE_DIRECTORY_NAME, key, dirname)
    )

    const directoryMake = await makeDirectory(storageDirPath)
    if (!directoryMake.success) {
        return directoryMake as Engine.GameProject.AddStorageDirectoryFail
    }

    return {
        success: true,
        name: '스토리지 디렉토리 생성 성공',
        message: '스토리지 디렉토리 생성에 성공했습니다',
        path: storageDirPath
    }
}

export function ipc(): void {
    ipcMain.handle('add-storage-directory', async (e: IpcMainInvokeEvent, projectDirPath: string, key: string, dirname: string): Promise<Engine.GameProject.AddStorageDirectorySuccess|Engine.GameProject.AddStorageDirectoryFail> => {
        return await handler(projectDirPath, key, dirname)
    })
}