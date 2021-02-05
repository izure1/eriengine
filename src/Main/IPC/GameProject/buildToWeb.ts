import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as buildProd } from './buildProd'

export async function handler(projectDirPath: string): Promise<Engine.GameProject.BuildToWebSuccess|Engine.GameProject.BuildToWebFail> {
    return await buildProd(projectDirPath)
}

export function ipc(): void {
    ipcMain.handle('build-to-web', async (e: IpcMainInvokeEvent, projectDirPath: string): Promise<Engine.GameProject.BuildToWebSuccess|Engine.GameProject.BuildToWebFail> => {
        return await handler(projectDirPath)
    })
}