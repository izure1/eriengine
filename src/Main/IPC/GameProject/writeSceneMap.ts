import path from 'path'
import normalize from 'normalize-path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as writeJson } from '../FileSystem/writeJSON'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_SCENE_DIRECTORY_NAME,
    PROJECT_SRC_SCENE_MAP_NAME
} from '@/Const'

function getMapFilePath(projectDirPath: string, sceneKey: string): string {
    return normalize(path.resolve(
        projectDirPath,
        PROJECT_SRC_DIRECTORY_NAME,
        PROJECT_SRC_SCENE_DIRECTORY_NAME,
        sceneKey,
        PROJECT_SRC_SCENE_MAP_NAME
    ))
}

export async function handler(projectDirPath: string, sceneKey: string, content: Engine.GameProject.SceneMap = {
    walls: [],
    floors: [],
    actors: []
}): Promise<Engine.GameProject.WriteSceneMapSuccess|Engine.GameProject.WriteSceneMapFail> {
    const filePath: string = getMapFilePath(projectDirPath, sceneKey)

    const fileWrite = await writeJson(filePath, content)
    if (!fileWrite.success) {
        return fileWrite as Engine.GameProject.WriteSceneMapFail
    }

    return {
        success: true,
        name: '',
        message: '',
        path: filePath
    }
}

export function ipc(): void {
    ipcMain.handle('write-scene-map', async (e: IpcMainInvokeEvent, projectDirPath: string, sceneKey: string, content: Engine.GameProject.SceneMap): Promise<Engine.GameProject.WriteSceneMapSuccess|Engine.GameProject.WriteSceneMapFail> => {
        return await handler(projectDirPath, sceneKey, content)
    })
}