import { ipcMain, IpcMainInvokeEvent } from 'electron'
import path from 'path'
import fs from 'fs-extra'
import normalize from 'normalize-path'

export async function handler(cwd: string, { includeDirectories = true, includeFiles = true, absolute = false, extensions = ['*']}: Engine.FileSystem.FileSearchFilter = {}): Promise<
    Engine.FileSystem.ReadDirectorySuccess|
    Engine.FileSystem.ReadDirectoryFail
> {
    let files: string[]
    try {
        files = await fs.readdir(cwd)

        const stats: Map<string, fs.Stats> = new Map
        for (const file of files) {
            const filePath = path.resolve(cwd, file)
            stats.set(file, await fs.lstat(filePath))
        }

        if (!includeDirectories) {
            files = files.filter((file) => !stats.get(file)!.isDirectory())
        }

        if (!includeFiles) {
            files = files.filter((file) => !stats.get(file)!.isFile())
        }

        if (!extensions.includes('*')) {
            files = files.filter((file: string): boolean => {
                if (stats.get(file)!.isDirectory()) {
                    return true
                }
                return extensions.includes(path.extname(file).substr(1))
            })
        }

        if (absolute) {
            files = files.map((file: string): string => normalize(path.resolve(cwd, file)))
        }

        files.sort((a: string, b: string): number => {
            if (stats.get(a)!.isDirectory() === stats.get(b)!.isDirectory()) {
                return a.localeCompare(b, 'en')
            }
            if (stats.get(a)!.isDirectory()) return -1
            if (stats.get(b)!.isFile()) return 1
            return 0
        })

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
        files
    }
}

export function ipc(): void {
    ipcMain.handle('read-directory', async (e: IpcMainInvokeEvent, cwd: string, options?: Engine.FileSystem.FileSearchFilter): Promise<
        Engine.FileSystem.ReadDirectorySuccess|
        Engine.FileSystem.ReadDirectoryFail
    > => {
        return await handler(cwd, options)
    })
}