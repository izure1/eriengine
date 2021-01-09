import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { PROJECT_CONFIG_NAME } from '@/Const'
import { handler as readJSON } from '../FileSystem/readJSON'
import { handler as checkValidProject } from './checkValidProject'

export async function handler(directoryPath: string): Promise<Engine.GameProject.ReadProjectSuccess|Engine.GameProject.ReadProjectFail> {
    const configPath: string = path.join(directoryPath, PROJECT_CONFIG_NAME)
    const raw = await readJSON(configPath)
    if (!raw.success) {
        return raw as Engine.GameProject.ReadProjectFail
    }

    const config: Engine.GameProject.Config = raw.content as Engine.GameProject.Config
    const validConfig: Engine.GameProject.CheckValidProjectSuccess|Engine.GameProject.CheckValidProjectFail = await checkValidProject(config)

    if (!validConfig.success) {
        return validConfig as Engine.GameProject.CheckValidProjectFail
    }

    return {
        success: true,
        name: '프로젝트 읽기 성공',
        message: '프로젝트를 성공적으로 읽었습니다',
        path: directoryPath,
        config
    }
}

export function ipc(): void {
    ipcMain.handle('read-project', async (e: IpcMainInvokeEvent, directoryPath: string): Promise<Engine.GameProject.ReadProjectSuccess|Engine.GameProject.ReadProjectFail> => {
        return await handler(directoryPath)
    })
}