import path from 'path'
import fs from 'fs-extra'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { handler as addStorageDirectory } from './addStorageDirectory'
import {
    PROJECT_SRC_STORAGE_ACTOR_SCRIPT_DIRECTORY_NAME,
    DATA_LISTS,
    STORAGE_LISTS
} from '@/Const'

import { parseProperty } from '@/Utils/parseProperty'
import { getStorageKeyFromFilename } from '@/Utils/getStorageKeyFromFilename'
import RAW_ACTOR from 'raw-loader!@/Template/Game/ACTOR.txt'

interface FileWriteQueue {
    path: string
    content: string|((_path: string) => Promise<void>)
}

async function writeActorFile(_projectDirPath: string, filePath: string): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    const STORAGE_KEY = getStorageKeyFromFilename(filePath)
    const files: FileWriteQueue[] = [
        {
            path: filePath,
            content: parseProperty(RAW_ACTOR, {
                DATA_LISTS,
                STORAGE_LISTS,
                STORAGE_KEY
            })
        }
    ]

    for (const { path, content } of files) {
        if (fs.existsSync(path)) {
            continue
        }

        if (typeof content === 'function') {
            try {
                await content(path)
            } catch(e) {
                const { name, message } = e as Error
                return { success: false, name, message }
            }
        }
        else {
            const fileWrite = await writeFile(path, content)
            if (!fileWrite.success) {
                return fileWrite
            }
        }
    }

    return {
        success: true,
        name: '액터 생성 성공',
        message: '액터 생성에 성공했습니다',
        path: filePath
    }
}

export async function handler(projectDirPath: string, filePath: string): Promise<Engine.GameProject.AddActorSuccess|Engine.GameProject.AddActorFail> {
    const directoryEnsure = await makeDirectory(path.dirname(filePath))
    if (!directoryEnsure.success) {
        return directoryEnsure as Engine.GameProject.AddActorFail
    }

    const fileWrite = await writeActorFile(projectDirPath, filePath)
    if (!fileWrite.success) {
        return fileWrite as Engine.GameProject.AddActorFail
    }

    const storageKey = getStorageKeyFromFilename(filePath)
    if (!storageKey) {
        return {
            success: false,
            name: '액터 생성 실패',
            message: '스토리지 키 정보가 없습니다'
        }
    }

    const storageDirAdd = await addStorageDirectory(projectDirPath, storageKey, PROJECT_SRC_STORAGE_ACTOR_SCRIPT_DIRECTORY_NAME)
    if (!storageDirAdd.success) {
        return storageDirAdd as Engine.GameProject.AddActorFail
    }

    return fileWrite
}

export function ipc(): void {
    ipcMain.handle('add-actor', async (e: IpcMainInvokeEvent, projectDirPath: string, filePath: string): Promise<Engine.GameProject.AddActorSuccess|Engine.GameProject.AddActorFail> => {
        return await handler(projectDirPath, filePath)
    })
}