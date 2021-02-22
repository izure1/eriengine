import { ipcMain, IpcMainInvokeEvent } from 'electron'
import fs from 'fs-extra'
import path from 'path'

export async function handler(filePath: string, fileContent: string, encoding: Engine.Type.TransferableEncoding = 'utf-8'): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    try {
        await fs.ensureDir(path.dirname(filePath))
        await fs.writeFile(filePath, fileContent, { encoding })
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
    ipcMain.handle('write-file', async (e: IpcMainInvokeEvent, filePath: string, fileContent: string, encoding?: Engine.Type.TransferableEncoding): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> => {
        return await handler(filePath, fileContent, encoding)
    })
}