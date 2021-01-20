import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as ensureSceneMap } from './ensureSceneMap'
import { handler as readStorageJson } from './readStorageJSON'
import {
    PROJECT_SRC_STORAGE_SCENE_MAP_DIRECTORY_NAME,
    PROJECT_SRC_STORAGE_SCENE_MAP_NAME
} from '@/Const'

export async function handler(projectDirPath: string, storageKey: string): Promise<Engine.GameProject.ReadSceneMapSuccess|Engine.GameProject.ReadSceneMapFail> {
    const mapEnsure = await ensureSceneMap(projectDirPath, storageKey)
    if (!mapEnsure.success) {
        return mapEnsure as Engine.GameProject.ReadSceneMapFail
    }

    const storageRead = await readStorageJson(projectDirPath, storageKey, PROJECT_SRC_STORAGE_SCENE_MAP_DIRECTORY_NAME, PROJECT_SRC_STORAGE_SCENE_MAP_NAME)
    if (!storageRead.success) {
        return storageRead as Engine.GameProject.ReadSceneMapFail
    }

    const content = storageRead.content as Engine.GameProject.SceneMap
    return {
        success: true,
        name: '',
        message: '',
        path: storageRead.path,
        content
    }
}

export function ipc(): void {
    ipcMain.handle('read-scene-map', async (e: IpcMainInvokeEvent, projectDirPath: string, storageKey: string): Promise<Engine.GameProject.ReadSceneMapSuccess|Engine.GameProject.ReadSceneMapFail> => {
        return await handler(projectDirPath, storageKey)
    })
}