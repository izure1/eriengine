import path from 'path'
import normalize from 'normalize-path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as readJson } from '../FileSystem/readJSON'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { parseProperty } from '@/Utils/parseProperty'

import RAW_GAME_INDEX from 'raw-loader!@/Template/Game/GAME_HTML.txt'

function getDistPath(projectDirPath: string): string {
    return normalize(path.resolve(projectDirPath, 'dist'))
}

async function readTitle(projectDirPath: string): Promise<Engine.FileSystem.ReadJsonSuccess|Engine.FileSystem.ReadJsonFail> {
    const configPath: string = path.resolve(projectDirPath, 'config.json')
    return await readJson(configPath)
}

async function appendHtml(projectDirPath: string): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    const dist: string  = getDistPath(projectDirPath)

    const directoryMake = await makeDirectory(dist)
    if (!directoryMake.success) {
        return directoryMake as Engine.FileSystem.WriteFileFail
    }

    const configRead = await readTitle(projectDirPath)
    if (!configRead.success) {
        return configRead as Engine.FileSystem.WriteFileFail
    }

    const config: Engine.GameProject.Config = configRead.content as Engine.GameProject.Config
    return await writeFile(
        path.resolve(dist, 'index.html'),
        parseProperty(RAW_GAME_INDEX, {
            TITLE: config.PROJECT_NAME
        })
    )
}

export async function handler(projectDirPath: string): Promise<Engine.GameProject.BuildCreateFilesSuccess|Engine.GameProject.BuildCreateFilesFail> {
    const htmlAppend = await appendHtml(projectDirPath)
    if (!htmlAppend.success) {
        return htmlAppend as Engine.GameProject.BuildCreateFilesFail
    }
    return {
        success: true,
        name: '빌드 파일 생성',
        message: '빌드 파일 생성에 성공했습니다',
        path: getDistPath(projectDirPath)
    }
}

export function ipc(): void {
    ipcMain.handle('build-create-files', async (e: IpcMainInvokeEvent, projectDirPath: string): Promise<Engine.GameProject.BuildCreateFilesSuccess|Engine.GameProject.BuildCreateFilesFail> => {
        return await handler(projectDirPath)
    })
}