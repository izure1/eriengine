import { ipcMain, IpcMainInvokeEvent } from 'electron'
import fs from 'fs-extra'
import extract from 'extract-zip'

async function unzip(src: string, dist: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(src)) {
      const err = new Error(`The '${src}' file not exists.`)
      reject(err)
    }
    extract(src, { dir: dist }).then(() => resolve(dist)).catch(reject)
  })
}

export async function handler(src: string, dist: string): Promise<Engine.FileSystem.UnzipSuccess|Engine.FileSystem.UnzipFail> {
  try {
    await unzip(src, dist)
  } catch (reason) {
    const { message } = reason as Error
    return {
      success: false,
      name: '압축 해제 실패',
      message
    }
  }

  return {
    success: true,
    name: '압축 해제',
    message: '압축을 해제했습니다',
    src,
    dist
  }
}

export function ipc(): void {
  ipcMain.handle('unzip', async (e: IpcMainInvokeEvent, src: string, dist: string): Promise<Engine.FileSystem.UnzipSuccess|Engine.FileSystem.UnzipFail> => {
    return await handler(src, dist)
  })
}