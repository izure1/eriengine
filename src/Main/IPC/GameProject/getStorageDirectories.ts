import path from 'path'
import normalize from 'normalize-path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as readDirectory } from '../FileSystem/readDirectory'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_STORAGE_DIRECTORY_NAME
} from '@/Const'

export async function handler(projectDirPath: string, key: string, absolute: boolean = false): Promise<Engine.GameProject.GetStorageDirectoriesSuccess|Engine.GameProject.GetStorageDirectoriesFail> {
    const cwd: string = normalize(path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_STORAGE_DIRECTORY_NAME, key))
    const directoryRead = await readDirectory(cwd, { includeDirectories: true, absolute })
    if (!directoryRead.success) {
        return directoryRead as Engine.GameProject.GetStorageDirectoriesFail
    }

    return {
        success: true,
        name: '스토리지 디렉토리 목록',
        message: '스토리지 디렉토리 목록을 찾는데 성공했습니다',
        path: normalize(cwd),
        files: directoryRead.files
    }
}

export function ipc(): void {
    ipcMain.handle('get-storage-directories', async (e: IpcMainInvokeEvent, projectDirPath: string, key: string, absolute: boolean): Promise<Engine.GameProject.GetStorageDirectoriesSuccess|Engine.GameProject.GetStorageDirectoriesFail> => {
        return await handler(projectDirPath, key, absolute)
    })
}