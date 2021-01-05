import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { parseProperty } from '@/Utils/parseProperty'
import {
    PROJECT_CONFIG_NAME,
    PROJECT_SCENE_DIRECTORY_NAME,
    PROJECT_ACTOR_DIRECTORY_NAME,
    PROJECT_ASSET_DIRECTORY_NAME
} from '@/Const'
import RAW_PROJECT_CONFIG from 'raw-loader!@/Init/Project/CONFIG.txt'

export async function handler(directoryPath: string, config: Engine.GameProject.Config): Promise<Engine.GameProject.CreateProjectSuccess|Engine.GameProject.CreateProjectFail> {
    // 디렉토리 생성하기
    const dirs: string[] = [
        path.join(directoryPath, PROJECT_SCENE_DIRECTORY_NAME),
        path.join(directoryPath, PROJECT_ACTOR_DIRECTORY_NAME),
        path.join(directoryPath, PROJECT_ASSET_DIRECTORY_NAME),
    ]

    for (const dirPath of dirs) {
        const dirCreate = await makeDirectory(dirPath)
        if (!dirCreate.success) {
            return dirCreate as Engine.GameProject.CreateProjectFail
        }
    }

    // 설정 파일 만들기
    const configContent: string = parseProperty(RAW_PROJECT_CONFIG, config)
    const configPath: string = path.join(directoryPath, PROJECT_CONFIG_NAME)

    const fileCreated = await writeFile(configPath, configContent)
    if (!fileCreated.success) {
        return fileCreated as Engine.GameProject.CreateProjectFail
    }

    return {
        success: true,
        name: '프로젝트 생성 성공',
        message: '프로젝트 생성을 성공했습니다.',
        path: directoryPath,
        config
    }
}

export function ipc(): void {
    ipcMain.handle('ensure-project', async (e: IpcMainInvokeEvent, directoryPath: string, config: Engine.GameProject.Config): Promise<Engine.GameProject.CreateProjectSuccess|Engine.GameProject.CreateProjectFail> => {
        return await handler(directoryPath, config)
    })
}