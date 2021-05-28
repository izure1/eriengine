import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as addStorageJSON } from './addStorageJSON'
import {
    PROJECT_SRC_STORAGE_SCENE_MAP_DIRECTORY_NAME,
    PROJECT_SRC_STORAGE_SCENE_MAP_NAME
} from '@/Const'

export async function handler(projectDirPath: string, storageKey: string, content: Engine.GameProject.SceneMap = {
  side: 2000,
  walls: [],
  floors: [],
  audios: []
}): Promise<Engine.GameProject.WriteSceneMapSuccess|Engine.GameProject.WriteSceneMapFail> {
  const fileWrite = await addStorageJSON(projectDirPath, storageKey, PROJECT_SRC_STORAGE_SCENE_MAP_DIRECTORY_NAME, PROJECT_SRC_STORAGE_SCENE_MAP_NAME, content)
  if (!fileWrite.success) {
    return fileWrite as Engine.GameProject.WriteSceneMapFail
  }

  return {
    success: true,
    name: '',
    message: '',
    path: fileWrite.path
  }
}

export function ipc(): void {
  ipcMain.handle('write-scene-map', async (e: IpcMainInvokeEvent, projectDirPath: string, storageKey: string, content: Engine.GameProject.SceneMap): Promise<Engine.GameProject.WriteSceneMapSuccess|Engine.GameProject.WriteSceneMapFail> => {
    return await handler(projectDirPath, storageKey, content)
  })
}