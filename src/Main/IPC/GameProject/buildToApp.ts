import path from 'path'
import merge from 'deepmerge'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as readJson } from '../FileSystem/readJSON'
import { handler as writeJson } from '../FileSystem/writeJSON'
import { handler as writeFile } from '../FileSystem/writeFile'
import { handler as buildToWeb } from './buildToWeb'
import { parseProperty } from '@/Utils/parseProperty'
import {
    PROJECT_EXTEND_DIRECTORY_NAME,
    PROJECT_EXTEND_PACKAGE_NAME,
    PROJECT_DIST_INDEX_NAME,
    PROJECT_PACAKGE_NAME
} from '@/Const'

import RAW_PACKAGE from 'raw-loader!@/Template/Project/Build-App/PACKAGE.txt'
import RAW_MAIN from 'raw-loader!@/Template/Project/Build-App/MAIN.txt'

export async function handler(projectDirPath: string): Promise<Engine.GameProject.BuildToAppSuccess|Engine.GameProject.BuildToAppFail> {
    // 기본 웹빌드
    const webBuild = await buildToWeb(projectDirPath)
    if (!webBuild.success) {
        return webBuild as Engine.GameProject.BuildToAppFail
    }

    // 설정 불러오기
    const pkgPath: string = path.resolve(projectDirPath, PROJECT_EXTEND_DIRECTORY_NAME, PROJECT_EXTEND_PACKAGE_NAME)
    const pkgRead = await readJson(pkgPath)
    if (!pkgRead.success) {
        return pkgRead as Engine.GameProject.BuildToAppFail
    }
    const config: Engine.GameProject.Config = pkgRead.content as Engine.GameProject.Config

    // package.json 생성
    const appPkgPath: string = path.resolve(webBuild.path, PROJECT_PACAKGE_NAME)
    const appPkgChunkContent: object = JSON.parse(RAW_PACKAGE)
    const appPkgContent: object = merge(pkgRead.content, appPkgChunkContent)

    const appPkgWrite = await writeJson(appPkgPath, appPkgContent)
    if (!appPkgWrite.success) {
        return appPkgWrite as Engine.GameProject.BuildToAppFail
    }

    // main.js 생성
    const mainPath: string = path.resolve(webBuild.path, PROJECT_DIST_INDEX_NAME)
    const mainContent: string = parseProperty(RAW_MAIN, {
        INDEX: PROJECT_DIST_INDEX_NAME,
        WIDTH: config.gameDisplaySize[0],
        HEIGHT: config.gameDisplaySize[1]
    })
    const mainWrite = await writeFile(mainPath, mainContent)
    if (!mainWrite.success) {
        return mainWrite as Engine.GameProject.BuildToAppFail
    }

    return {
        success: true,
        name: '앱으로 빌드',
        message: '성공적으로 앱으로 빌드했습니다',
        path: webBuild.path
    }
}

export function ipc(): void {
    ipcMain.handle('build-to-app', async (e: IpcMainInvokeEvent, projectDirPath: string): Promise<Engine.GameProject.BuildToAppSuccess|Engine.GameProject.BuildToAppFail> => {
        return await handler(projectDirPath)
    })
}