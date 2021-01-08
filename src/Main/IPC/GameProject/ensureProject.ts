import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { parseProperty } from '@/Utils/parseProperty'
import { installModuleFromPackage } from '@/Utils/installModule'
import {
    PROJECT_CONFIG_NAME,
    PROJECT_TSCONFIG_NAME,
    PROJECT_PACAKGE_NAME,
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_SCENE_DIRECTORY_NAME,
    PROJECT_SRC_ACTOR_DIRECTORY_NAME,
    PROJECT_SRC_ASSET_DIRECTORY_NAME,
    PROJECT_SRC_ANIMATION_DIRECTORY_NAME,
} from '@/Const'
import RAW_PROJECT_PACKAGE from 'raw-loader!@/Template/Project/PACKAGE.txt'
import RAW_PROJECT_TSCONFIG from 'raw-loader!@/Template/Project/TSCONFIG.txt'
import RAW_PROJECT_CONFIG from 'raw-loader!@/Template/Project/CONFIG.txt'

async function ensureConfig(projectDirPath: string, config: Engine.GameProject.Config): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    let fileWrite: Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail

    // package.json
    const pkgContent: string    = parseProperty(RAW_PROJECT_PACKAGE, { NAME: config.PROJECT_NAME })
    const pkgPath: string       = path.resolve(projectDirPath, PROJECT_PACAKGE_NAME)

    fileWrite = await writeFile(pkgPath, pkgContent)
    if (!fileWrite.success) {
        return fileWrite as Engine.FileSystem.WriteFileFail
    }

    // tsconfig.json
    const tsContent: string     = parseProperty(RAW_PROJECT_TSCONFIG, {})
    const tsPath: string        = path.resolve(projectDirPath, PROJECT_TSCONFIG_NAME)

    fileWrite = await writeFile(tsPath, tsContent)
    if (!fileWrite.success) {
        return fileWrite as Engine.FileSystem.WriteFileFail
    }

    // config.json
    const configContent: string = parseProperty(RAW_PROJECT_CONFIG, config)
    const configPath: string    = path.join(projectDirPath, PROJECT_CONFIG_NAME)

    fileWrite = await writeFile(configPath, configContent)
    if (!fileWrite.success) {
        return fileWrite as Engine.FileSystem.WriteFileFail
    }

    return {
        success: true,
        name: '설정 파일 생성 성공',
        message: '설정 파일 생성을 성공했습니다',
        path: projectDirPath,
    }
}

async function ensureRequireModules(projectDirPath: string, config: Engine.GameProject.Config): Promise<Engine.ModuleSystem.InstallSuccess|Engine.ModuleSystem.InstallFail> {
    const moduleInstall = await installModuleFromPackage(projectDirPath)
    if (!moduleInstall.success) {
        return moduleInstall as Engine.ModuleSystem.InstallFail
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
        path.join(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_SCENE_DIRECTORY_NAME),
        path.join(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ACTOR_DIRECTORY_NAME),
        path.join(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME),
        path.join(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ANIMATION_DIRECTORY_NAME),
    ]

    for (const dirPath of dirs) {
        const dirCreate = await makeDirectory(dirPath)
        if (!dirCreate.success) {
            return dirCreate as Engine.GameProject.CreateProjectFail
        }
    }

    // 설정 파일 만들기
    const configWrite = await ensureConfig(directoryPath, config)
    if (!configWrite.success) {
        return configWrite as Engine.GameProject.CreateProjectFail
    }

    // 종속 모듈 설치
    const moduleInstall = await ensureRequireModules(directoryPath, config)
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