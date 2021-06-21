import { ipcMain, IpcMainInvokeEvent } from 'electron'
import fs from 'fs-extra'

export async function handler(filePath: string, encoding: Engine.Type.TransferableEncoding = 'utf-8'): Promise<Engine.FileSystem.ReadFileSuccess|Engine.FileSystem.ReadFileFail> {
  let content: string
  try {
    const raw = await fs.readFile(filePath)
    content = raw.toString(encoding)
  } catch (reason) {
    const { message } = reason as Error
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
    encoding,
    content
  }
}

export function ipc(): void {
  ipcMain.handle('read-file', async (e: IpcMainInvokeEvent, filePath: string, encoding?: Engine.Type.TransferableEncoding): Promise<Engine.FileSystem.ReadFileSuccess|Engine.FileSystem.ReadFileFail> => {
    return await handler(filePath, encoding)
  })
}