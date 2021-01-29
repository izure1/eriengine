import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { PROJECT_LISTS } from '@/Const'

import { parseProperty } from '@/Utils/parseProperty'
import RAW_IMAGE from 'raw-loader!@/Template/Game/IMAGE.txt'

async function writeSpriteFile(filePath: string): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    const fileContent: string   = parseProperty(RAW_IMAGE, {
        PROJECT_LISTS
    })

    const fileWrite = await writeFile(filePath, fileContent)
    if (!fileWrite.success) {
        return fileWrite as Engine.FileSystem.WriteFileFail
    }

    return {
        success: true,
        name: '이미지 생성 성공',
        message: '이미지 생성에 성공했습니다',
        path: filePath
    }
}

export async function handler(filePath: string): Promise<Engine.GameProject.AddImageSuccess|Engine.GameProject.AddImageFail> {
    const directoryEnsure = await makeDirectory(path.dirname(filePath))
    if (!directoryEnsure.success) {
        return directoryEnsure as Engine.GameProject.AddImageFail
    }

    const fileWrite = await writeSpriteFile(filePath)
    if (!fileWrite.success) {
        return fileWrite as Engine.GameProject.AddImageFail
    }

    return fileWrite
}

export function ipc(): void {
    ipcMain.handle('add-image', async (e: IpcMainInvokeEvent, filePath: string): Promise<Engine.GameProject.AddImageSuccess|Engine.GameProject.AddImageFail> => {
        return await handler(filePath)
    })
}