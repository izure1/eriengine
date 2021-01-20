import path from 'path'
import fs from 'fs-extra'
import normalize from 'normalize-path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as readJson } from '../FileSystem/readJSON'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_STORAGE_DIRECTORY_NAME
} from '@/Const'

export async function handler(projectDirPath: string, key: string, dirname: string, filename: string): Promise<Engine.GameProject.ReadStorageJSONSuccess|Engine.GameProject.ReadStorageJSONFail> {
    const storageDirPath: string = normalize(
        path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_STORAGE_DIRECTORY_NAME, key, dirname)
    )

    if (!fs.existsSync(storageDirPath)) {
        return {
            success: false,
            name: '스토리지 파일 읽기 실패',
            message: '디렉토리가 존재하지 않습니다'
        }
    }

    const filePath: string = normalize(
        path.resolve(storageDirPath, filename)
    )

    const fileRead = await readJson(filePath)
    if (!fileRead.success) {
        return fileRead as Engine.GameProject.ReadStorageJSONFail
    }

    return {
        success: true,
        name: '스토리지 파일 읽기 성공',
        message: '스토리지 파일 읽기에 성공했습니다',
        path: fileRead.path,
        content: fileRead.content
    }
}

export function ipc(): void {
    ipcMain.handle('add-storage-json', async (e: IpcMainInvokeEvent, projectDirPath: string, key: string, dirname: string, filename: string): Promise<Engine.GameProject.ReadStorageJSONSuccess|Engine.GameProject.ReadStorageJSONFail> => {
        return await handler(projectDirPath, key, dirname, filename)
    })
}