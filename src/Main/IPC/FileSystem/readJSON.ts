import { ipcMain, IpcMainInvokeEvent } from 'electron'
import fs from 'fs-extra'

export async function handler(filePath: string): Promise<Engine.FileSystem.ReadJsonSuccess|Engine.FileSystem.ReadJsonFail> {
    let content: object
    try {
        content = await fs.readJSON(filePath)
    } catch(e) {
        const { message } = e as Error
        return {
            success: false,
            name: '파일 읽기 실패',
            message
        }
    }

    return {
        success: true,
        name: '파일 읽기',
        message: '파일을 읽었습니다',
        path: filePath,
        content
    }
}

export function ipc(): void {
    ipcMain.handle('read-json', async (e: IpcMainInvokeEvent, filePath: string): Promise<Engine.FileSystem.ReadJsonSuccess|Engine.FileSystem.ReadJsonFail> => {
        return await handler(filePath)
    })
}