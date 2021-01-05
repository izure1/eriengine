import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import {
    PROJECT_SCENE_DIRECTORY_NAME,
    PROJECT_SCENE_SCRIPT_DIRECTORY_NAME,
    PROJECT_SCENE_ANIMATION_DIRECTORY_NAME,
    PROJECT_PHASER_VERSION,
} from '@/Const'

import { parseProperty } from '@/Utils/parseProperty'
import { installModule } from '@/Utils/installModule'
import RAW_SCENE from 'raw-loader!@/Init/Scene/Scene.txt'

function getSceneKey(key: string): string {
    const chars: string[] = key.split('')
    if (chars[0]) {
        chars[0] = chars[0].toUpperCase()
    }
    return chars.join('')
}

function getSceneContent(key: string): string {
    const KEY: string = getSceneKey(key)
    return parseProperty(RAW_SCENE, { KEY })
}

async function ensureDirectory(projectDirPath: string, key: string): Promise<Engine.FileSystem.MakeDirectorySuccess|Engine.FileSystem.MakeDirectoryFail> {
    const sceneRootPath: string = path.join(projectDirPath, PROJECT_SCENE_DIRECTORY_NAME)
    const sceneDirPath: string = path.join(sceneRootPath, getSceneKey(key))
    const dirs: string[] = [
        sceneRootPath,
        path.join(sceneDirPath, PROJECT_SCENE_SCRIPT_DIRECTORY_NAME),
        path.join(sceneDirPath, PROJECT_SCENE_ANIMATION_DIRECTORY_NAME),
    ]

    for (const dir of dirs) {
        const directoryMake = await makeDirectory(dir)
        if (!directoryMake.success) {
            return directoryMake
        }
    }

    return {
        success: true,
        name: '씬 디렉토리 생성 성공',
        message: '씬 디렉토리 생성에 성공했습니다',
        path: sceneDirPath
    }
}

interface FileWriteQueue {
    path: string
    content: string
}

async function ensureFile(projectDirPath: string, key: string): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    const KEY: string = getSceneKey(key)
    const sceneRootPath: string = path.join(projectDirPath, PROJECT_SCENE_DIRECTORY_NAME)
    const sceneDirPath: string = path.join(sceneRootPath, KEY)
    const files: FileWriteQueue[] = [
        {
            path: path.join(sceneDirPath, `Scene.ts`),
            content: parseProperty(RAW_SCENE, { KEY })
        }
    ]

    for (const { path, content } of files) {
        const fileWrite = await writeFile(path, content)
        if (!fileWrite.success) {
            return fileWrite
        }
    }

    return {
        success: true,
        name: '씬 파일 생성 성공',
        message: '씬 파일 생성에 성공했습니다',
        path: sceneDirPath
    }
}

async function ensureRequireModules(projectDirPath: string): Promise<Engine.ModuleSystem.InstallSuccess|Engine.ModuleSystem.InstallFail> {
    const moduleInstall = await installModule('phaser', PROJECT_PHASER_VERSION, projectDirPath)

    if (!moduleInstall.success) {
        return moduleInstall as Engine.ModuleSystem.InstallFail
    }
    return moduleInstall as Engine.ModuleSystem.InstallSuccess
}

export async function handler(projectDirPath: string, key: string): Promise<Engine.GameProject.AddSceneSuccess|Engine.GameProject.AddSceneFail> {
    const directoryEnsure = await ensureDirectory(projectDirPath, key)
    if (!directoryEnsure.success) {
        return directoryEnsure as Engine.GameProject.AddSceneFail
    }

    const fileEnsure = await ensureFile(projectDirPath, key)
    if (!fileEnsure.success) {
        return fileEnsure as Engine.GameProject.AddSceneFail
    }

    const moduleEnsure = await ensureRequireModules(projectDirPath)
    if (!moduleEnsure.success) {
        return moduleEnsure as Engine.GameProject.AddSceneFail
    }

    return {
        success: true,
        name: '씬 생성 성공',
        message: '씬 생성에 성공했습니다',
        path: path.join(projectDirPath, getSceneKey(key))
    }
}

export function ipc(): void {
    ipcMain.handle('add-scene', async (e: IpcMainInvokeEvent, projectDirPath: string, key: string): Promise<Engine.GameProject.AddSceneSuccess|Engine.GameProject.AddSceneFail> => {
        return await handler(projectDirPath, key)
    })
}