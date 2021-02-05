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
    PROJECT_CONFIG_NAME,
    PROJECT_EXTEND_DIRECTORY_NAME,
    PROJECT_EXTEND_PACKAGE_NAME
} from '@/Const'

import RAW_PROJECT_PACKAGE from 'raw-loader!@/Template/Project/PACKAGE.txt'
import RAW_PROJECT_EXTEND_PACKAGE from 'raw-loader!@/Template/Project/Extend/PACKAGE.txt'

export async function handler(projectDirPath: string): Promise<Engine.GameProject.GeneratePackageJsonSuccess|Engine.GameProject.GeneratePackageJsonFail> {

    // config.json 파일로부터 설정 받아오기
    const configPath: string = path.resolve(projectDirPath, PROJECT_CONFIG_NAME)
    const configRead = await readJson(configPath)
    if (!configRead.success) {
        return configRead as Engine.GameProject.GeneratePackageJsonFail
    }

    const config: Engine.GameProject.Config = configRead.content as Engine.GameProject.Config
    const pkgPath: string = path.resolve(projectDirPath, PROJECT_PACAKGE_NAME)

    // package.json 임시 파일 생성
    const pkgContent: string = parseProperty(RAW_PROJECT_PACKAGE, {
        NAME: config.PROJECT_NAME,
        DESCRIPTION: '',
        AUTHOR: '',
        LICENSE: ''
    })
    const pckWrite = await writeFile(pkgPath, pkgContent)
    if (!pckWrite.success) {
        return pckWrite as Engine.GameProject.GeneratePackageJsonFail
    }

    // extend/package.json 임시 파일 생성
    const extendPkgContent: string   = parseProperty(RAW_PROJECT_EXTEND_PACKAGE, {})
    const extendPkgPath: string      = path.resolve(projectDirPath, PROJECT_EXTEND_DIRECTORY_NAME, PROJECT_EXTEND_PACKAGE_NAME)

    if (!fs.existsSync(extendPkgPath)) {
        const fileWrite = await writeFile(extendPkgPath, extendPkgContent)
        if (!fileWrite.success) {
            return fileWrite as Engine.GameProject.GeneratePackageJsonFail
        }
    }

    // 병합할 package.json 파일 목록
    // 순서에 주의하십시오. 배열의 뒤에 있을수록 우선순위가 높아집니다.
    const pkgPaths: string[] = [ pkgPath, extendPkgPath ]

    // 병합 시작
    let merged: object = {}
    for (const filePath of pkgPaths) {
        const jsonRead = await readJson(filePath)
        if (!jsonRead.success) {
            return jsonRead as Engine.GameProject.GeneratePackageJsonFail
        }

        merged = merge(merged, jsonRead.content)
    }

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
    ipcMain.handle('generate-packagejson', async (e: IpcMainInvokeEvent, projectDirPath: string): Promise<Engine.GameProject.GeneratePackageJsonSuccess|Engine.GameProject.GeneratePackageJsonFail> => {
        return await handler(projectDirPath)
    })
}