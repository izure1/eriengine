import { ipcMain, IpcMainInvokeEvent } from 'electron'
import fs from 'fs-extra'

export async function handler(src: string, dist: string): Promise<Engine.FileSystem.CopySuccess|Engine.FileSystem.CopyFail> {
    try {
        await fs.copy(src, dist)
    } catch(e) {
        const { message } = e as Error
        return {
            success: false,
            name: '파일 복사 실패',
            message
        }
    }

    return {
        success: true,
        name: '파일 복사',
        message: '파일을 복사했습니다',
        src,
        dist
    }
}

export function ipc(): void {
    ipcMain.handle('copy', async (e: IpcMainInvokeEvent, src: string, dist: string): Promise<Engine.FileSystem.CopySuccess|Engine.FileSystem.CopyFail> => {
        return await handler(src, dist)
    })
}