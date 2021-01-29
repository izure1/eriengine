import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { PROJECT_LISTS } from '@/Const'

import { parseProperty } from '@/Utils/parseProperty'
import RAW_SCRIPT from 'raw-loader!@/Template/Game/ACTOR_SCRIPT.txt'

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
        name: '액터 스크립트 생성 성공',
        message: '액터 스크립트 생성에 성공했습니다',
        path: filePath
    }
}

export async function handler(filePath: string): Promise<Engine.GameProject.AddActorScriptSuccess|Engine.GameProject.AddActorScriptFail> {
    const directoryEnsure = await makeDirectory(path.dirname(filePath))
    if (!directoryEnsure.success) {
        return directoryEnsure as Engine.GameProject.AddActorScriptFail
    }

    const fileWrite = await writeScriptFile(filePath)
    if (!fileWrite.success) {
        return fileWrite as Engine.GameProject.AddActorScriptFail
    }

    return fileWrite
}

export function ipc(): void {
    ipcMain.handle('add-actor-script', async (e: IpcMainInvokeEvent, filePath: string): Promise<Engine.GameProject.AddActorScriptSuccess|Engine.GameProject.AddActorScriptFail> => {
        return await handler(filePath)
    })
}