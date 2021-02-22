import { ipcMain, IpcMainInvokeEvent } from 'electron'
import fs from 'fs-extra'
import path from 'path'

export async function handler(filePath: string, fileContent: object): Promise<Engine.FileSystem.WriteJsonSuccess|Engine.FileSystem.WriteJsonFail> {
    try {
        await fs.ensureDir(path.dirname(filePath))
        await fs.writeJSON(filePath, fileContent, { spaces: 2 })
    } catch(e) {
        const { message } = e as Error
        return {
            success: false,
            name: '파일 생성 실패',
            message
        }
    }

    return {
        success: true,
        name: '파일 생성',
        message: '파일을 생성했습니다',
        path: filePath
    }
}

export function ipc(): void {
    ipcMain.handle('write-json', async (e: IpcMainInvokeEvent, filePath: string, fileContent: object): Promise<Engine.FileSystem.WriteJsonSuccess|Engine.FileSystem.WriteJsonFail> => {
        return await handler(filePath, fileContent)
    })
}