import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { PROJECT_LISTS } from '@/Const'

import { parseProperty } from '@/Utils/parseProperty'
import RAW_ACTOR from 'raw-loader!@/Template/Scene/ACTOR.txt'

async function writeSkillFile(filePath: string): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    const fileContent: string   = parseProperty(RAW_ACTOR, {
        PROJECT_LISTS
    })

    const fileWrite = await writeFile(filePath, fileContent)
    if (!fileWrite.success) {
        return fileWrite as Engine.FileSystem.WriteFileFail
    }

    return {
        success: true,
        name: '액터 생성 성공',
        message: '액터 생성에 성공했습니다',
        path: filePath
    }
}

export async function handler(filePath: string): Promise<Engine.GameProject.AddActorSuccess|Engine.GameProject.AddActorFail> {
    const directoryEnsure = await makeDirectory(path.dirname(filePath))
    if (!directoryEnsure.success) {
        return directoryEnsure as Engine.GameProject.AddActorFail
    }

    const fileWrite = await writeSkillFile(filePath)
    if (!fileWrite.success) {
        return fileWrite as Engine.GameProject.AddActorFail
    }

    return fileWrite
}

export function ipc(): void {
    ipcMain.handle('add-actor', async (e: IpcMainInvokeEvent, filePath: string): Promise<Engine.GameProject.AddActorSuccess|Engine.GameProject.AddActorFail> => {
        return await handler(filePath)
    })
}