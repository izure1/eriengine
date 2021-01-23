import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { PROJECT_LISTS } from '@/Const'

import { parseProperty } from '@/Utils/parseProperty'
import RAW_SCRIPT from 'raw-loader!@/Template/Scene/SCENE_SCRIPT.txt'

async function writeScriptFile(filePath: string): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    const fileContent: string   = parseProperty(RAW_SCRIPT, {
        PROJECT_LISTS
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

export async function handler(filePath: string): Promise<Engine.GameProject.AddSceneScriptSuccess|Engine.GameProject.AddSceneScriptFail> {
    const directoryEnsure = await makeDirectory(path.dirname(filePath))
    if (!directoryEnsure.success) {
        return directoryEnsure as Engine.GameProject.AddSceneScriptFail
    }

    const fileWrite = await writeScriptFile(filePath)
    if (!fileWrite.success) {
        return fileWrite as Engine.GameProject.AddSceneScriptFail
    }

    return fileWrite
}

export function ipc(): void {
    ipcMain.handle('add-scene-script', async (e: IpcMainInvokeEvent, filePath: string): Promise<Engine.GameProject.AddSceneScriptSuccess|Engine.GameProject.AddSceneScriptFail> => {
        return await handler(filePath)
    })
}