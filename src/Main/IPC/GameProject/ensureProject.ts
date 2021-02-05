import path from 'path'
import fs from 'fs-extra'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { handler as copy } from '../FileSystem/copy'
import { handler as generatePackageJson } from './generatePackageJson'
import { parseProperty } from '@/Utils/parseProperty'
import { ProcessSpawner } from '@/Utils/ProcessSpawner'
import { writeToRenderer } from '@/Utils/stream'
import {
    PROJECT_CONFIG_NAME,
    PROJECT_TSCONFIG_NAME,
    PROJECT_WEBPACK_NAME,
    PROJECT_README_NAME,
    PROJECT_EXTEND_DIRECTORY_NAME,
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_GAME_NAME,
    PROJECT_SRC_SCENELIST_NAME,
    PROJECT_SRC_ASSET_DIRECTORY_NAME,
    PROJECT_SRC_ASSET_AUDIO_DIRECTORY_NAME,
    PROJECT_SRC_ASSET_FONT_DIRECTORY_NAME,
    PROJECT_SRC_ASSET_IMAGE_DIRECTORY_NAME,
    PROJECT_SRC_ASSET_SPRITE_DIRECTORY_NAME,
    PROJECT_SRC_ASSET_VIDEO_DIRECTORY_NAME,
    PROJECT_SRC_BUILD_DIRECTORY_NAME,
    PROJECT_SRC_BUILD_FAVICON_NAME,
    PROJECT_SRC_DATA_DIRECTORY_NAME,
    PROJECT_SRC_DATA_SCENE_DIRECTORY_NAME,
    PROJECT_SRC_DATA_ACTOR_DIRECTORY_NAME,
    PROJECT_SRC_DATA_ANIMATION_DIRECTORY_NAME, 
    PROJECT_SRC_DATA_AUDIO_DIRECTORY_NAME, 
    PROJECT_SRC_DATA_IMAGE_DIRECTORY_NAME,
    PROJECT_SRC_DATA_SKILL_DIRECTORY_NAME,
    PROJECT_SRC_DATA_VIDEO_DIRECTORY_NAME
} from '@/Const'
import RAW_PROJECT_TSCONFIG from 'raw-loader!@/Template/Project/TSCONFIG.txt'
import RAW_PROJECT_CONFIG from 'raw-loader!@/Template/Project/CONFIG.txt'
import RAW_PROJECT_WEBPACK from 'raw-loader!@/Template/Project/WEBPACK.CONFIG.txt'
import RAW_PROJECT_README from 'raw-loader!@/Template/Project/README.txt'
import RAW_GAME from 'raw-loader!@/Template/Game/GAME.txt'

declare const __static: string

async function ensureFiles(projectDirPath: string, config: Engine.GameProject.Config): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    let fileWrite: Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail

    // tsconfig.json
    const tsContent: string     = parseProperty(RAW_PROJECT_TSCONFIG, {})
    const tsPath: string        = path.resolve(projectDirPath, PROJECT_TSCONFIG_NAME)

    fileWrite = await writeFile(tsPath, tsContent)
    if (!fileWrite.success) {
        return fileWrite as Engine.FileSystem.WriteFileFail
    }

    // webpack.config.js
    const wpContent: string     = parseProperty(RAW_PROJECT_WEBPACK, {})
    const wpPath: string        = path.resolve(projectDirPath, PROJECT_WEBPACK_NAME)

    fileWrite = await writeFile(wpPath, wpContent)
    if (!fileWrite.success) {
        return fileWrite as Engine.FileSystem.WriteFileFail
    }

    // config.json
    const configContent: string = parseProperty(RAW_PROJECT_CONFIG, config)
    const configPath: string    = path.resolve(projectDirPath, PROJECT_CONFIG_NAME)

    fileWrite = await writeFile(configPath, configContent)
    if (!fileWrite.success) {
        return fileWrite as Engine.FileSystem.WriteFileFail
    }

    // README.txt
    const readmeContent: string   = parseProperty(RAW_PROJECT_README, {})
    const readmePath: string      = path.resolve(projectDirPath, PROJECT_README_NAME)

    fileWrite = await writeFile(readmePath, readmeContent)
    if (!fileWrite.success) {
        return fileWrite as Engine.FileSystem.WriteFileFail
    }

    // src/game.ts
    const gamePath: string = path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_GAME_NAME)

    fileWrite = await writeFile(gamePath, parseProperty(RAW_GAME, {
        PROJECT_SRC_SCENELIST_NAME: path.parse(PROJECT_SRC_SCENELIST_NAME).name
    }))
    if (!fileWrite.success) {
        return fileWrite as Engine.FileSystem.WriteFileFail
    }

    // src/build/favicon.png
    const faviconPath: string = path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_BUILD_DIRECTORY_NAME, PROJECT_SRC_BUILD_FAVICON_NAME)
    if (!fs.existsSync(faviconPath)) {
        const src: string = path.resolve(__static, 'icon.png')
        const faviconEnsure = await copy(src, faviconPath)
        if (!faviconEnsure.success) {
            return faviconEnsure as Engine.FileSystem.CopyFail
        }
    }

    // package.json, extend/package.json
    const packageGen = await generatePackageJson(projectDirPath)
    if (!packageGen.success) {
        return packageGen as Engine.FileSystem.WriteFileFail
    }

    return {
        success: true,
        name: '설정 파일 생성 성공',
        message: '설정 파일 생성을 성공했습니다',
        path: projectDirPath,
    }
}

async function ensureRequireModules(projectDirPath: string): Promise<Engine.ModuleSystem.InstallSuccess|Engine.ModuleSystem.InstallFail> {
    try {
        const spawner = new ProcessSpawner({ shell: true, cwd: projectDirPath })
        await spawner.spawn('npm i', { writeStream: writeToRenderer('ensure-require-modules') })
    } catch(reason) {
        return {
            success: false,
            name: reason,
            message: reason
        }
    }

    return {
        success: true,
        name: '씬 서드파티모듈 설치 성공',
        message: '씬에 필요한 서드파티모듈 설치를 성공했습니다'
    }
}

export async function handler(directoryPath: string, config: Engine.GameProject.Config): Promise<Engine.GameProject.CreateProjectSuccess|Engine.GameProject.CreateProjectFail> {
    // 디렉토리 생성하기
    const dirs: string[] = [
        path.resolve(directoryPath, PROJECT_EXTEND_DIRECTORY_NAME),
        path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME),
        path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME, PROJECT_SRC_ASSET_AUDIO_DIRECTORY_NAME),
        path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME, PROJECT_SRC_ASSET_FONT_DIRECTORY_NAME),
        path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME, PROJECT_SRC_ASSET_IMAGE_DIRECTORY_NAME),
        path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME, PROJECT_SRC_ASSET_SPRITE_DIRECTORY_NAME),
        path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME, PROJECT_SRC_ASSET_VIDEO_DIRECTORY_NAME),
        path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_BUILD_DIRECTORY_NAME),
        path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME),
        path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_SCENE_DIRECTORY_NAME),
        path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_ACTOR_DIRECTORY_NAME),
        path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_ANIMATION_DIRECTORY_NAME),
        path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_AUDIO_DIRECTORY_NAME),
        path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_IMAGE_DIRECTORY_NAME),
        path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_SKILL_DIRECTORY_NAME),
        path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_VIDEO_DIRECTORY_NAME)
    ]

    for (const dirPath of dirs) {
        const dirCreate = await makeDirectory(dirPath)
        if (!dirCreate.success) {
            return dirCreate as Engine.GameProject.CreateProjectFail
        }
    }

    // 설정 파일 만들기
    const filesWrite = await ensureFiles(directoryPath, config)
    if (!filesWrite.success) {
        return filesWrite as Engine.GameProject.CreateProjectFail
    }

    // 종속 모듈 설치
    const moduleInstall = await ensureRequireModules(directoryPath)
    if (!moduleInstall.success) {
        return moduleInstall as Engine.GameProject.CreateProjectFail
    }

    return {
        success: true,
        name: '프로젝트 생성 성공',
        message: '프로젝트 생성을 성공했습니다.',
        path: directoryPath,
        config
    }
}

export function ipc(): void {
    ipcMain.handle('ensure-project', async (e: IpcMainInvokeEvent, directoryPath: string, config: Engine.GameProject.Config): Promise<Engine.GameProject.CreateProjectSuccess|Engine.GameProject.CreateProjectFail> => {
        return await handler(directoryPath, config)
    })
}