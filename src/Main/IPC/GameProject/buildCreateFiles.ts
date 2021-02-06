import path from 'path'
import normalize from 'normalize-path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as readJson } from '../FileSystem/readJSON'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { parseProperty } from '@/Utils/parseProperty'

import {
    PROJECT_EXTEND_DIRECTORY_NAME,
    PROJECT_EXTEND_PACKAGE_NAME,
    PROJECT_BUILD_DIRECTORY_NAME,
    PROJECT_BUILD_SRC_DIRECTORY_NAME,
    PROJECT_BUILD_SRC_INDEX_NAME
} from '@/Const'
import RAW_HTML from 'raw-loader!@/Template/Project/Build-Web/HTML.txt'

function getBuildPath(projectDirPath: string): string {
    return normalize(path.resolve(projectDirPath, PROJECT_BUILD_DIRECTORY_NAME, PROJECT_BUILD_SRC_DIRECTORY_NAME))
}

async function readTitle(projectDirPath: string): Promise<Engine.FileSystem.ReadJsonSuccess|Engine.FileSystem.ReadJsonFail> {
    const pkgPath: string = path.resolve(projectDirPath, PROJECT_EXTEND_DIRECTORY_NAME, PROJECT_EXTEND_PACKAGE_NAME)
    return await readJson(pkgPath)
}

async function appendHtml(projectDirPath: string): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    const dist: string  = getBuildPath(projectDirPath)

    const directoryMake = await makeDirectory(dist)
    if (!directoryMake.success) {
        return directoryMake as Engine.FileSystem.WriteFileFail
    }

    const pkgRead = await readTitle(projectDirPath)
    if (!pkgRead.success) {
        return pkgRead as Engine.FileSystem.WriteFileFail
    }

    const config: Engine.GameProject.Config = pkgRead.content as Engine.GameProject.Config
    return await writeFile(
        path.resolve(dist, PROJECT_BUILD_SRC_INDEX_NAME),
        parseProperty(RAW_HTML, {
            TITLE: config.name
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
        path: getBuildPath(projectDirPath)
    }
}

export function ipc(): void {
    ipcMain.handle('build-create-files', async (e: IpcMainInvokeEvent, projectDirPath: string): Promise<Engine.GameProject.BuildCreateFilesSuccess|Engine.GameProject.BuildCreateFilesFail> => {
        return await handler(projectDirPath)
    })
}