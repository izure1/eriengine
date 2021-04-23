import path from 'path'
import normalize from 'normalize-path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_STORAGE_DIRECTORY_NAME
} from '@/Const'

export async function handler(projectDirPath: string, key: string, dirname: string, filename: string, content: string): Promise<Engine.GameProject.AddStorageFileSuccess|Engine.GameProject.AddStorageFileFail> {
    const storageDirPath = normalize(
        path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_STORAGE_DIRECTORY_NAME, key, dirname)
    )

    const directoryMake = await makeDirectory(storageDirPath)
    if (!directoryMake.success) {
        return directoryMake as Engine.GameProject.AddStorageFileFail
    }

    const filePath = normalize(
        path.resolve(storageDirPath, filename)
    )

    const fileWrite = await writeFile(filePath, content)
    if (!fileWrite.success) {
        return fileWrite as Engine.GameProject.AddStorageFileFail
    }

    return {
        success: true,
        name: '스토리지 파일 생성 성공',
        message: '스토리지 파일 생성에 성공했습니다',
        path: storageDirPath
    }
}

export function ipc(): void {
    ipcMain.handle('add-storage-file', async (e: IpcMainInvokeEvent, projectDirPath: string, key: string, dirname: string, filename: string, content: string): Promise<Engine.GameProject.AddStorageFileSuccess|Engine.GameProject.AddStorageFileFail> => {
        return await handler(projectDirPath, key, dirname, filename, content)
    })
}