import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as ensureProject } from './ensureProject'
import { parseProperty } from '@/Utils/parseProperty'
import { PROJECT_DIRECTORY_NAME } from '@/Const'

export async function handler(directoryPath: string, config: Engine.GameProject.Config): Promise<Engine.GameProject.CreateProjectSuccess|Engine.GameProject.CreateProjectFail> {
    const projectDirName: string = parseProperty(PROJECT_DIRECTORY_NAME, config)
    const projectDirPath: string = path.join(directoryPath, projectDirName)

    const projectEnsure = await ensureProject(projectDirPath, config)
    if (!projectEnsure.success) {
        return projectEnsure as Engine.GameProject.CreateProjectFail
    }

    return {
        success: true,
        name: '프로젝트 생성 성공',
        message: '프로젝트 생성을 성공했습니다.',
        path: projectDirPath,
        config
    }
}

export function ipc(): void {
    ipcMain.handle('create-project', async (e: IpcMainInvokeEvent, directoryPath: string, config: Engine.GameProject.Config): Promise<Engine.GameProject.CreateProjectSuccess|Engine.GameProject.CreateProjectFail> => {
        return await handler(directoryPath, config)
    })
}