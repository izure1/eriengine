import path from 'path'
import fs from 'fs-extra'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { PROJECT_CONFIG_NAME } from '@/Const'
import { handler as readJSON } from '../FileSystem/readJSON'

export async function handler(directoryPath: string): Promise<Engine.GameProject.ReadProjectSuccess|Engine.GameProject.ReadProjectFail> {
    const configPath: string = path.join(directoryPath, PROJECT_CONFIG_NAME)
    const config = await readJSON(configPath)
    if (!config.success) {
        return config as Engine.GameProject.ReadProjectFail
    }

    return {
        success: true,
        name: '',
        message: '',
        path: directoryPath,
        config: config.content as Engine.GameProject.Config
    }
}

export function ipc(): void {
    ipcMain.handle('read-project', async (e: IpcMainInvokeEvent, directoryPath: string): Promise<Engine.GameProject.ReadProjectSuccess|Engine.GameProject.ReadProjectFail> => {
        return await handler(directoryPath)
    })
}