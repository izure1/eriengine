import path from 'path'
import merge from 'deepmerge'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as readJson } from '../FileSystem/readJSON'
import { handler as writeJson } from '../FileSystem/writeJSON'
import { handler as writeFile } from '../FileSystem/writeFile'
import { handler as buildProd } from './buildProd'
import { parseProperty } from '@/Utils/parseProperty'
import { ProcessSpawner } from '@/Utils/ProcessSpawner'
import { writeToRenderer } from '@/Utils/stream'
import {
    PROJECT_EXTEND_DIRECTORY_NAME,
    PROJECT_EXTEND_PACKAGE_NAME,
    PROJECT_DIST_SRC_MAIN_NAME,
    PROJECT_PACAKGE_NAME
} from '@/Const'

import RAW_PACKAGE from 'raw-loader!@/Template/Project/Build-App/PACKAGE.txt'
import RAW_MAIN from 'raw-loader!@/Template/Project/Build-App/MAIN.txt'

export async function handler(projectDirPath: string): Promise<Engine.GameProject.BuildToAppSuccess|Engine.GameProject.BuildToAppFail> {
    // 기본 빌드
    const prodBuild = await buildProd(projectDirPath)
    if (!prodBuild.success) {
        return prodBuild as Engine.GameProject.BuildToAppFail
    }

    // 설정 불러오기
    const pkgPath: string = path.resolve(projectDirPath, PROJECT_EXTEND_DIRECTORY_NAME, PROJECT_EXTEND_PACKAGE_NAME)
    const pkgRead = await readJson(pkgPath)
    if (!pkgRead.success) {
        return pkgRead as Engine.GameProject.BuildToAppFail
    }
    const config: Engine.GameProject.Config = pkgRead.content as Engine.GameProject.Config

    // package.json 생성
    const appPkgPath: string = path.resolve(prodBuild.path, PROJECT_PACAKGE_NAME)
    const appPkgChunkContent: object = JSON.parse(parseProperty(RAW_PACKAGE, config))
    const appPkgContent: object = merge(pkgRead.content, appPkgChunkContent)

    const appPkgWrite = await writeJson(appPkgPath, appPkgContent)
    if (!appPkgWrite.success) {
        return appPkgWrite as Engine.GameProject.BuildToAppFail
    }

    // main.js 생성
    const mainPath: string = path.resolve(prodBuild.path, PROJECT_DIST_SRC_MAIN_NAME)
    const mainContent: string = parseProperty(RAW_MAIN, {
        INDEX: PROJECT_DIST_SRC_MAIN_NAME,
        WIDTH: config.gameDisplaySize[0],
        HEIGHT: config.gameDisplaySize[1]
    })
    const mainWrite = await writeFile(mainPath, mainContent)
    if (!mainWrite.success) {
        return mainWrite as Engine.GameProject.BuildToAppFail
    }


    const commands: string[] = [
        'npm i',
        'nnpm run electron:build'
    ]

    for (const command of commands) {
        try {
            const spawner = new ProcessSpawner({ shell: true, cwd: prodBuild.path })
            await spawner.spawn(command, { writeStream: writeToRenderer('build'), deadWord: 'build-to-app' })
        } catch(e) {
            const { name, message } = e as Error
            return {
                success: false,
                name,
                message
            }
        }
    }

    return {
        success: true,
        name: '앱으로 빌드',
        message: '성공적으로 앱으로 빌드했습니다',
        path: prodBuild.path
    }
}

export function ipc(): void {
    ipcMain.handle('build-to-app', async (e: IpcMainInvokeEvent, projectDirPath: string): Promise<Engine.GameProject.BuildToAppSuccess|Engine.GameProject.BuildToAppFail> => {
        return await handler(projectDirPath)
    })
}