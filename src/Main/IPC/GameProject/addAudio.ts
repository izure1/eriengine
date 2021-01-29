import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { PROJECT_LISTS } from '@/Const'

import { parseProperty } from '@/Utils/parseProperty'
import RAW_AUDIO from 'raw-loader!@/Template/Game/AUDIO.txt'

async function writeSpriteFile(filePath: string): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    const fileContent: string   = parseProperty(RAW_AUDIO, {
        PROJECT_LISTS
    })

    const fileWrite = await writeFile(filePath, fileContent)
    if (!fileWrite.success) {
        return fileWrite as Engine.FileSystem.WriteFileFail
    }

    return {
        success: true,
        name: '오디오 생성 성공',
        message: '오디오 생성에 성공했습니다',
        path: filePath
    }
}

export async function handler(filePath: string): Promise<Engine.GameProject.AddAudioSuccess|Engine.GameProject.AddAudioFail> {
    const directoryEnsure = await makeDirectory(path.dirname(filePath))
    if (!directoryEnsure.success) {
        return directoryEnsure as Engine.GameProject.AddAudioFail
    }

    const fileWrite = await writeSpriteFile(filePath)
    if (!fileWrite.success) {
        return fileWrite as Engine.GameProject.AddAudioFail
    }

    return fileWrite
}

export function ipc(): void {
    ipcMain.handle('add-audio', async (e: IpcMainInvokeEvent, filePath: string): Promise<Engine.GameProject.AddAudioSuccess|Engine.GameProject.AddAudioFail> => {
        return await handler(filePath)
    })
}