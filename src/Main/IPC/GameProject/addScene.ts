import path from 'path'
import fs from 'fs-extra'
import { nanoid } from 'nanoid'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { handler as addStorageDirectory } from './addStorageDirectory'
import { handler as writeSceneMap } from './writeSceneMap'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_STORAGE_SCENE_SCRIPT_DIRECTORY_NAME,
    PROJECT_LISTS
} from '@/Const'

import { parseProperty } from '@/Utils/parseProperty'
import { getStorageKeyFromFilename } from '@/Utils/getStorageKeyFromFilename'
import RAW_BASE_SCENE from 'raw-loader!@/Template/Scene/BASE_SCENE.txt'
import RAW_SCENE from 'raw-loader!@/Template/Scene/SCENE.txt'

interface FileWriteQueue {
    path: string
    content: string|((path: string) => Promise<void>)
}

async function writeSceneFile(projectDirPath: string, filePath: string): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    const KEY: string = nanoid()
    const files: FileWriteQueue[] = [
        {
            path: path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, 'BaseScene.ts'),
            content: RAW_BASE_SCENE
        },
        {
            path: filePath,
            content: parseProperty(RAW_SCENE, {
                KEY,
                PROJECT_LISTS
            })
        }
    ]

    for (const { path, content } of files) {
        if (fs.existsSync(path)) {
            continue
        }

        if (typeof content === 'function') {
            try {
                await content(path)
            } catch(e) {
                const { name, message } = e as Error
                return { success: false, name, message }
            }
        }
        else {
            const fileWrite = await writeFile(path, content)
            if (!fileWrite.success) {
                return fileWrite
            }
        }
    }

    return {
        success: true,
        name: '씬 생성 성공',
        message: '씬 생성에 성공했습니다',
        path: filePath
    }
}

export async function handler(projectDirPath: string, filePath: string): Promise<Engine.GameProject.AddSceneSuccess|Engine.GameProject.AddSceneFail> {
    const directoryEnsure = await makeDirectory(path.dirname(filePath))
    if (!directoryEnsure.success) {
        return directoryEnsure as Engine.GameProject.AddSceneFail
    }

    const fileWrite = await writeSceneFile(projectDirPath, filePath)
    if (!fileWrite.success) {
        return fileWrite as Engine.GameProject.AddSceneFail
    }

    const storageKey: string = getStorageKeyFromFilename(filePath)
    if (!storageKey) {
        return {
            success: false,
            name: '씬 생성 실패',
            message: '스토리지 키 정보가 없습니다'
        }
    }

    const storageDirAdd = await addStorageDirectory(projectDirPath, storageKey, PROJECT_SRC_STORAGE_SCENE_SCRIPT_DIRECTORY_NAME)
    if (!storageDirAdd.success) {
        return storageDirAdd as Engine.GameProject.AddSceneFail
    }
    
    const sceneMapWrite = await writeSceneMap(projectDirPath, storageKey)
    if (!sceneMapWrite.success) {
        return sceneMapWrite as Engine.GameProject.AddSceneFail
    }

    return {
        success: true,
        name: '씬 파일 생성 성공',
        message: '씬 파일 생성에 성공했습니다',
        path: filePath
    }
}

export function ipc(): void {
    ipcMain.handle('add-scene', async (e: IpcMainInvokeEvent, projectDirPath: string, filePath: string): Promise<Engine.GameProject.AddSceneSuccess|Engine.GameProject.AddSceneFail> => {
        return await handler(projectDirPath, filePath)
    })
}