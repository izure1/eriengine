import { ipcMain, IpcMainInvokeEvent } from 'electron'
import glob, { Options as GlobOptions } from 'fast-glob'
import slash from 'slash'

export async function handler(cwd: string, pattern: string|string[], option: GlobOptions = {}): Promise<
    Engine.FileSystem.ReadDirectorySuccess|
    Engine.FileSystem.ReadDirectoryFail
> {
    let files: string[]
    try {
        const opt: GlobOptions = { ...option, cwd: slash(cwd) }
        files = await glob(pattern, opt)
        files.sort()
    } catch(e) {
        const { name, message } = e as Error
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
        files: files
    }
}

export function ipc(): void {
    ipcMain.handle('read-directory', async (e: IpcMainInvokeEvent, cwd: string, pattern: string|string[], option: GlobOptions): Promise<
        Engine.FileSystem.ReadDirectorySuccess|
        Engine.FileSystem.ReadDirectoryFail
    > => {
        return await handler(cwd, pattern, option)
    })
}