import path from 'path'
import fs from 'fs-extra'
import merge from 'deepmerge'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as readJson } from '../FileSystem/readJSON'
import { handler as writeJson } from '../FileSystem/writeJSON'
import { handler as writeFile } from '../FileSystem/writeFile'
import { parseProperty } from '@/Utils/parseProperty'
import {
    PROJECT_PACAKGE_NAME,
    PROJECT_EXTEND_DIRECTORY_NAME,
    PROJECT_EXTEND_PACKAGE_NAME
} from '@/Const'

import RAW_PROJECT_PACKAGE from 'raw-loader!@/Template/Project/PACKAGE.txt'
import RAW_PROJECT_EXTEND_PACKAGE from 'raw-loader!@/Template/Project/Extend/PACKAGE.txt'

export async function handler(projectDirPath: string, config: Engine.GameProject.Config): Promise<Engine.GameProject.GeneratePackageJsonSuccess|Engine.GameProject.GeneratePackageJsonFail> {

    // extend/package.json 파일 생성
    const extendPkgContent: string   = parseProperty(RAW_PROJECT_EXTEND_PACKAGE, config)
    const extendPkgPath: string      = path.resolve(projectDirPath, PROJECT_EXTEND_DIRECTORY_NAME, PROJECT_EXTEND_PACKAGE_NAME)

    if (!fs.existsSync(extendPkgPath)) {
        const fileWrite = await writeFile(extendPkgPath, extendPkgContent)
        if (!fileWrite.success) {
            return fileWrite as Engine.GameProject.GeneratePackageJsonFail
        }
    }

    const pkgPath: string = path.resolve(projectDirPath, PROJECT_PACAKGE_NAME)
    const pkgContent: object = JSON.parse(RAW_PROJECT_PACKAGE)

    // 병합 시작
    const merged: object = merge(pkgContent, extendPkgContent)

    // 병합된 내용 package.json 파일로 추출
    const mergedPkgWrite = await writeJson(pkgPath, merged)
    if (!mergedPkgWrite.success) {
        return mergedPkgWrite as Engine.GameProject.GeneratePackageJsonFail
    }

    return {
        success: true,
        name: 'package.json 파일 생성',
        message: 'package.json 파일을 성공적으로 생성했습니다',
        path: pkgPath
    }

}

export function ipc(): void {
    ipcMain.handle('generate-packagejson', async (e: IpcMainInvokeEvent, projectDirPath: string, config: Engine.GameProject.Config): Promise<Engine.GameProject.GeneratePackageJsonSuccess|Engine.GameProject.GeneratePackageJsonFail> => {
        return await handler(projectDirPath, config)
    })
}