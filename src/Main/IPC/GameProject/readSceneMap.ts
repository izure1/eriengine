import path from 'path'
import normalize from 'normalize-path'
import fs from 'fs-extra'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as readJson } from '../FileSystem/readJSON'
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

async function writeEmptySceneMap(filePath: string): Promise<Engine.FileSystem.WriteJsonSuccess|Engine.FileSystem.WriteJsonFail> {
    const map: Engine.GameProject.SceneMap = {
        walls: [],
        floors: [],
        actors: []
    }
    return await writeJson(filePath, map)
}

async function eusureSceneMap(filePath: string): Promise<Engine.FileSystem.WriteJsonSuccess|Engine.FileSystem.WriteJsonFail> {
    if (!fs.existsSync(filePath)) {
        const fileWrite = await writeEmptySceneMap(filePath)
        if (!fileWrite.success) {
            return fileWrite
        }
    }
    return {
        success: true,
        name: '씬 맵 생성 성공',
        message: '씬 맵을 성공적으로 생성했습니다',
        path: filePath
    }
}

export async function handler(projectDirPath: string, sceneKey: string): Promise<Engine.GameProject.ReadSceneMapSuccess|Engine.GameProject.ReadSceneMapFail> {
    const filePath: string = getMapFilePath(projectDirPath, sceneKey)

    const mapEnsure = await eusureSceneMap(filePath)
    if (!mapEnsure.success) {
        return mapEnsure as Engine.GameProject.ReadSceneMapFail
    }

    const fileRead = await readJson(filePath)
    if (!fileRead.success) {
        return fileRead as Engine.GameProject.ReadSceneMapFail
    }

    const content = fileRead.content as Engine.GameProject.SceneMap
    return {
        success: true,
        name: '',
        message: '',
        path: filePath,
        content
    }
}

export function ipc(): void {
    ipcMain.handle('read-scene-map', async (e: IpcMainInvokeEvent, projectDirPath: string, sceneKey: string): Promise<Engine.GameProject.ReadSceneMapSuccess|Engine.GameProject.ReadSceneMapFail> => {
        return await handler(projectDirPath, sceneKey)
    })
}