import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { PROJECT_SRC_ASSETLIST_NAME } from '@/Const'

import { parseProperty } from '@/Utils/parseProperty'
import RAW_ANIMATION from 'raw-loader!@/Template/Scene/ANIMATION.txt'

async function writeAnimationFile(filePath: string): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    const fileContent: string   = parseProperty(RAW_ANIMATION, {
        PROJECT_SRC_ASSETLIST_NAME: path.parse(PROJECT_SRC_ASSETLIST_NAME).name,
        ASSET_KEY: '',
        START: 0,
        END: 0,
        FRAMERATE: 0,
        REPEAT: -1
    })

    const fileWrite = await writeFile(filePath, fileContent)
    if (!fileWrite.success) {
        return fileWrite as Engine.FileSystem.WriteFileFail
    }

    return {
        success: true,
        name: '애니메이션 생성 성공',
        message: '애니메이션 생성에 성공했습니다',
        path: filePath
    }
}

export async function handler(filePath: string): Promise<Engine.GameProject.AddAnimationSuccess|Engine.GameProject.AddAnimationFail> {
    const directoryEnsure = await makeDirectory(path.dirname(filePath))
    if (!directoryEnsure.success) {
        return directoryEnsure as Engine.GameProject.AddAnimationFail
    }

    const fileWrite = await writeAnimationFile(filePath)
    if (!fileWrite.success) {
        return fileWrite as Engine.GameProject.AddAnimationFail
    }

    return fileWrite
}

export function ipc(): void {
    ipcMain.handle('add-animation', async (e: IpcMainInvokeEvent, filePath: string): Promise<Engine.GameProject.AddAnimationSuccess|Engine.GameProject.AddAnimationFail> => {
        return await handler(filePath)
    })
}