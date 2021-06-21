import { ipcMain, IpcMainInvokeEvent } from 'electron'
import fs from 'fs-extra'

export async function handler(src: string, dist: string): Promise<Engine.FileSystem.RenameSuccess|Engine.FileSystem.RenameFail> {
  try {
    await fs.rename(src, dist)
  } catch (reason) {
    const { message } = reason as Error
    return {
      success: false,
      name: '파일 이동 실패',
      message
    }
  }

  return {
    success: true,
    name: '파일 이동',
    message: '파일을 이동했습니다',
    src,
    dist
  }
}

export function ipc(): void {
  ipcMain.handle('rename', async (e: IpcMainInvokeEvent, src: string, dist: string): Promise<Engine.FileSystem.RenameSuccess|Engine.FileSystem.RenameFail> => {
    return await handler(src, dist)
  })
}