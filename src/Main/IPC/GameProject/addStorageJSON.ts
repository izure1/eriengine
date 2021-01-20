import path from 'path'
import normalize from 'normalize-path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeJSON } from '../FileSystem/writeJSON'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_STORAGE_DIRECTORY_NAME
} from '@/Const'

export async function handler(projectDirPath: string, key: string, dirname: string, filename: string, content: object): Promise<Engine.GameProject.AddStorageJSONSuccess|Engine.GameProject.AddStorageJSONFail> {
    const storageDirPath: string = normalize(
        path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_STORAGE_DIRECTORY_NAME, key, dirname)
    )

    const directoryMake = await makeDirectory(storageDirPath)
    if (!directoryMake.success) {
        return directoryMake as Engine.GameProject.AddStorageJSONFail
    }

    const filePath: string = normalize(
        path.resolve(storageDirPath, filename)
    )

    const fileWrite = await writeJSON(filePath, content)
    if (!fileWrite.success) {
        return fileWrite as Engine.GameProject.AddStorageJSONFail
    }

    return {
        success: true,
        name: '스토리지 파일 생성 성공',
        message: '스토리지 파일 생성에 성공했습니다',
        path: storageDirPath
    }
}

export function ipc(): void {
    ipcMain.handle('add-storage-json', async (e: IpcMainInvokeEvent, projectDirPath: string, key: string, dirname: string, filename: string, content: object): Promise<Engine.GameProject.AddStorageJSONSuccess|Engine.GameProject.AddStorageJSONFail> => {
        return await handler(projectDirPath, key, dirname, filename, content)
    })
}