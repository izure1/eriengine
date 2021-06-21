import path from 'path'
import { ipcMain, shell, IpcMainInvokeEvent } from 'electron'

export async function handler(filePath: string): Promise<Engine.FileSystem.showItemSuccess|Engine.FileSystem.showItemFail> {
  try {
    shell.showItemInFolder(path.resolve(filePath))
  } catch (reason) {
    const { name, message } = reason as Error
    return {
      success: false,
      name,
      message
    }
  }

  return {
    success: true,
    name: '요소 선택 성공',
    message: '요소를 선택했습니다',
    path: filePath
  }
}

export function ipc(): void {
  ipcMain.handle('show-item', async (e: IpcMainInvokeEvent, path: string): Promise<Engine.FileSystem.showItemSuccess|Engine.FileSystem.showItemFail> => {
    return await handler(path)
  })
}