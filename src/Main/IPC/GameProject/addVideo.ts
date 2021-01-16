import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { PROJECT_LISTS } from '@/Const'

import { parseProperty } from '@/Utils/parseProperty'
import RAW_VIDEO from 'raw-loader!@/Template/Scene/VIDEO.txt'

async function writeSpriteFile(filePath: string): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    const fileContent: string   = parseProperty(RAW_VIDEO, {
        PROJECT_LISTS
    })

    const fileWrite = await writeFile(filePath, fileContent)
    if (!fileWrite.success) {
        return fileWrite as Engine.FileSystem.WriteFileFail
    }

    return {
        success: true,
        name: '비디오 생성 성공',
        message: '비디오 생성에 성공했습니다',
        path: filePath
    }
}

export async function handler(filePath: string): Promise<Engine.GameProject.AddVideoSuccess|Engine.GameProject.AddVideoFail> {
    const directoryEnsure = await makeDirectory(path.dirname(filePath))
    if (!directoryEnsure.success) {
        return directoryEnsure as Engine.GameProject.AddVideoFail
    }

    const fileWrite = await writeSpriteFile(filePath)
    if (!fileWrite.success) {
        return fileWrite as Engine.GameProject.AddVideoFail
    }

    return fileWrite
}

export function ipc(): void {
    ipcMain.handle('add-video', async (e: IpcMainInvokeEvent, filePath: string): Promise<Engine.GameProject.AddVideoSuccess|Engine.GameProject.AddVideoFail> => {
        return await handler(filePath)
    })
}