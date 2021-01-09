import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import {
    PROJECT_SRC_ASSETLIST_NAME,
    PROJECT_SRC_ANIMSLIST_NAME,
    PROJECT_SRC_SKILLLIST_NAME
} from '@/Const'

import { parseProperty } from '@/Utils/parseProperty'
import RAW_SCRIPT from 'raw-loader!@/Template/Scene/SCRIPT.txt'

function getSceneKey(key: string): string {
    const chars: string[] = key.split('')
    if (chars[0]) {
        chars[0] = chars[0].toUpperCase()
    }
    return chars.join('')
}

async function writeScriptFile(filePath: string, sceneKey: string): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    const KEY:  string          = getSceneKey(sceneKey)
    const fileContent: string   = parseProperty(RAW_SCRIPT, {
        KEY,
        PROJECT_SRC_ASSETLIST_NAME: path.parse(PROJECT_SRC_ASSETLIST_NAME).name,
        PROJECT_SRC_ANIMSLIST_NAME: path.parse(PROJECT_SRC_ANIMSLIST_NAME).name,
        PROJECT_SRC_SKILLLIST_NAME: path.parse(PROJECT_SRC_SKILLLIST_NAME).name
    })

    const fileWrite = await writeFile(filePath, fileContent)
    if (!fileWrite.success) {
        return fileWrite as Engine.FileSystem.WriteFileFail
    }

    return {
        success: true,
        name: '씬 스크립트 생성 성공',
        message: '씬 스크립트 생성에 성공했습니다',
        path: filePath
    }
}

export async function handler(filePath: string, sceneKey: string): Promise<Engine.GameProject.AddScriptSuccess|Engine.GameProject.AddScriptFail> {
    const directoryEnsure = await makeDirectory(path.dirname(filePath))
    if (!directoryEnsure.success) {
        return directoryEnsure as Engine.GameProject.AddSceneFail
    }

    const fileWrite = await writeScriptFile(filePath, sceneKey)
    if (!fileWrite.success) {
        return fileWrite as Engine.GameProject.AddScriptFail
    }

    return fileWrite
}

export function ipc(): void {
    ipcMain.handle('add-script', async (e: IpcMainInvokeEvent, filePath: string, sceneKey: string): Promise<Engine.GameProject.AddSceneSuccess|Engine.GameProject.AddScriptFail> => {
        return await handler(filePath, sceneKey)
    })
}