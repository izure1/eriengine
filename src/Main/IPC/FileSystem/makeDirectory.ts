import { ipcMain, IpcMainInvokeEvent } from 'electron'
import fs from 'fs-extra'

export async function handler(directoryPath: string): Promise<Engine.FileSystem.MakeDirectorySuccess|Engine.FileSystem.MakeDirectoryFail> {
    try {
        await fs.ensureDir(directoryPath)
    } catch(e) {
        const { message } = e as Error
        return {
            success: false,
            name: '디렉토리 생성 실패',
            message
        }
    }

    return {
        success: true,
        name: '디렉토리 생성',
        message: '디렉토리를 생성했습니다',
        path: directoryPath
    }
}

export function ipc(): void {
    ipcMain.handle('make-directory', async (e: IpcMainInvokeEvent, directoryPath: string): Promise<Engine.FileSystem.MakeDirectorySuccess|Engine.FileSystem.MakeDirectoryFail> => {
        return await handler(directoryPath)
    })
}