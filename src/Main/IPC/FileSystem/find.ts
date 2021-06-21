import { ipcMain, IpcMainInvokeEvent } from 'electron'
import glob, { Options as GlobOptions } from 'fast-glob'
import normalize from 'normalize-path'

export async function handler(cwd: string, pattern: string|string[], option: GlobOptions = {}): Promise<
  Engine.FileSystem.FindSuccess|
  Engine.FileSystem.FindFail
> {
  let files: string[]
  try {
    const opt: GlobOptions = { ...option, cwd: normalize(cwd) }
    files = await glob(pattern, opt)
    files.sort()
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
    name: '',
    message: '',
    path: cwd,
    files
  }
}

export function ipc(): void {
  ipcMain.handle('find', async (e: IpcMainInvokeEvent, cwd: string, pattern: string|string[], option: GlobOptions): Promise<
    Engine.FileSystem.FindSuccess|
    Engine.FileSystem.FindFail
  > => {
    return await handler(cwd, pattern, option)
  })
}