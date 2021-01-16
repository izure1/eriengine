import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { PROJECT_LISTS } from '@/Const'

import { parseProperty } from '@/Utils/parseProperty'
import RAW_SPRITE from 'raw-loader!@/Template/Scene/SPRITE.txt'

async function writeSpriteFile(filePath: string): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    const fileContent: string   = parseProperty(RAW_SPRITE, {
        PROJECT_LISTS
    })

    const fileWrite = await writeFile(filePath, fileContent)
    if (!fileWrite.success) {
        return fileWrite as Engine.FileSystem.WriteFileFail
    }

    return {
        success: true,
        name: '스프라이트 생성 성공',
        message: '스프라이트 생성에 성공했습니다',
        path: filePath
    }
}

export async function handler(filePath: string): Promise<Engine.GameProject.AddSpriteSuccess|Engine.GameProject.AddSpriteFail> {
    const directoryEnsure = await makeDirectory(path.dirname(filePath))
    if (!directoryEnsure.success) {
        return directoryEnsure as Engine.GameProject.AddSpriteFail
    }

    const fileWrite = await writeSpriteFile(filePath)
    if (!fileWrite.success) {
        return fileWrite as Engine.GameProject.AddSpriteFail
    }

    return fileWrite
}

export function ipc(): void {
    ipcMain.handle('add-sprite', async (e: IpcMainInvokeEvent, filePath: string): Promise<Engine.GameProject.AddSpriteSuccess|Engine.GameProject.AddSpriteFail> => {
        return await handler(filePath)
    })
}