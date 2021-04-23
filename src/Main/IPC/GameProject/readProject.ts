import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as readJSON } from '../FileSystem/readJSON'
import { handler as checkValidProject } from './checkValidProject'
import {
    PROJECT_EXTEND_DIRECTORY_NAME,
    PROJECT_EXTEND_PACKAGE_NAME
} from '@/Const'

export async function handler(projectDirPath: string): Promise<Engine.GameProject.ReadProjectSuccess|Engine.GameProject.ReadProjectFail> {
    const pkgPath = path.resolve(projectDirPath, PROJECT_EXTEND_DIRECTORY_NAME, PROJECT_EXTEND_PACKAGE_NAME)
    const pkgContent = await readJSON(pkgPath)
    if (!pkgContent.success) {
        return pkgContent as Engine.GameProject.ReadProjectFail
    }

    const config: Engine.GameProject.Config = pkgContent.content as Engine.GameProject.Config
    const validConfig = await checkValidProject(config)

    if (
        !validConfig.success ||
        validConfig.success && !validConfig.valid
    ) {
        return validConfig as Engine.GameProject.CheckValidProjectFail
    }

    return {
        success: true,
        name: '프로젝트 읽기 성공',
        message: '프로젝트를 성공적으로 읽었습니다',
        path: projectDirPath,
        config
    }
}

export function ipc(): void {
    ipcMain.handle('read-project', async (e: IpcMainInvokeEvent, projectDirPath: string): Promise<Engine.GameProject.ReadProjectSuccess|Engine.GameProject.ReadProjectFail> => {
        return await handler(projectDirPath)
    })
}