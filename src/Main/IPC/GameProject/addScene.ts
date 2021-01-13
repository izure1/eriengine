import path from 'path'
import fs from 'fs-extra'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as ensureScene } from './ensureScene'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_SCENE_DIRECTORY_NAME
} from '@/Const'

export async function handler(projectDirPath: string, sceneKey: string): Promise<Engine.GameProject.AddSceneSuccess|Engine.GameProject.AddSceneFail> {
    const sceneDirectory: string = path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_SCENE_DIRECTORY_NAME, sceneKey)

    if (fs.existsSync(sceneDirectory)) {
        return {
            success: false,
            name: '씬 생성 실패',
            message: '이미 동일한 키를 가진 씬이 존재합니다.'
        }
    }

    return await ensureScene(projectDirPath, sceneKey)
}

export function ipc(): void {
    ipcMain.handle('add-scene', async (e: IpcMainInvokeEvent, projectDirPath: string, key: string): Promise<Engine.GameProject.AddSceneSuccess|Engine.GameProject.AddSceneFail> => {
        return await handler(projectDirPath, key)
    })
}