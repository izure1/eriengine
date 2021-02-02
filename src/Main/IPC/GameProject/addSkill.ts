import path from 'path'
import { nanoid } from 'nanoid'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { DATA_LISTS } from '@/Const'

import { parseProperty } from '@/Utils/parseProperty'
import RAW_SKILL from 'raw-loader!@/Template/Game/SKILL.txt'

async function writeSkillFile(filePath: string): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    const fileContent: string   = parseProperty(RAW_SKILL, {
        DATA_LISTS,
        KEY: nanoid()
    })

    const fileWrite = await writeFile(filePath, fileContent)
    if (!fileWrite.success) {
        return fileWrite as Engine.FileSystem.WriteFileFail
    }

    return {
        success: true,
        name: '스킬 생성 성공',
        message: '스킬 생성에 성공했습니다',
        path: filePath
    }
}

export async function handler(filePath: string): Promise<Engine.GameProject.AddSkillSuccess|Engine.GameProject.AddSkillFail> {
    const directoryEnsure = await makeDirectory(path.dirname(filePath))
    if (!directoryEnsure.success) {
        return directoryEnsure as Engine.GameProject.AddSkillFail
    }

    const fileWrite = await writeSkillFile(filePath)
    if (!fileWrite.success) {
        return fileWrite as Engine.GameProject.AddSkillFail
    }

    return fileWrite
}

export function ipc(): void {
    ipcMain.handle('add-skill', async (e: IpcMainInvokeEvent, filePath: string): Promise<Engine.GameProject.AddSkillSuccess|Engine.GameProject.AddSkillFail> => {
        return await handler(filePath)
    })
}