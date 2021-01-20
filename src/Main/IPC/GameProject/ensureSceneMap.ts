import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as checkStorageExists } from './checkStorageExists'
import { handler as writeSceneMap } from './writeSceneMap'
import { handler as addStorageJSON } from './addStorageJSON'
import {
    PROJECT_SRC_STORAGE_SCENE_MAP_DIRECTORY_NAME,
    PROJECT_SRC_STORAGE_SCENE_MAP_NAME
} from '@/Const'

async function writeEmptySceneMap(projectDirPath: string, storageKey: string): Promise<Engine.GameProject.WriteSceneMapSuccess|Engine.GameProject.WriteSceneMapFail> {
    const map: Engine.GameProject.SceneMap = {
        walls: [],
        floors: [],
        actors: []
    }
    return await writeSceneMap(projectDirPath, storageKey, map)
}

export async function handler(projectDirPath: string, storageKey: string, content: Engine.GameProject.SceneMap = {
    walls: [],
    floors: [],
    actors: []
}): Promise<Engine.GameProject.WriteSceneMapSuccess|Engine.GameProject.WriteSceneMapFail> {
    const check = await checkStorageExists(projectDirPath, storageKey, PROJECT_SRC_STORAGE_SCENE_MAP_DIRECTORY_NAME, PROJECT_SRC_STORAGE_SCENE_MAP_NAME)
    if (!check.success) {
        const fileWrite = await writeEmptySceneMap(projectDirPath, storageKey)
        if (!fileWrite.success) {
            return fileWrite
        }
    }

    const checkAgain = await checkStorageExists(projectDirPath, storageKey, PROJECT_SRC_STORAGE_SCENE_MAP_DIRECTORY_NAME, PROJECT_SRC_STORAGE_SCENE_MAP_NAME)
    if (!checkAgain.success) {
        return checkAgain as Engine.GameProject.WriteSceneMapFail
    }

    return {
        success: true,
        name: '씬 맵 생성 성공',
        message: '씬 맵을 성공적으로 생성했습니다',
        path: checkAgain.path
    }
}

export function ipc(): void {
    ipcMain.handle('ensure-scene-map', async (e: IpcMainInvokeEvent, projectDirPath: string, storageKey: string, content: Engine.GameProject.SceneMap): Promise<Engine.GameProject.WriteSceneMapSuccess|Engine.GameProject.WriteSceneMapFail> => {
        return await handler(projectDirPath, storageKey, content)
    })
}