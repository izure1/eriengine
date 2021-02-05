import path from 'path'
import normalize from 'normalize-path'
import sanitize from 'sanitize-filename'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as buildProd } from './buildProd'
import { handler as copy } from '../FileSystem/copy'
import { writeToRenderer } from '@/Utils/stream'
import {
    PROJECT_DIST_WEB_DIRECTORY_NAME
} from '@/Const'

export async function handler(projectDirPath: string): Promise<Engine.GameProject.BuildToWebSuccess|Engine.GameProject.BuildToWebFail> {
    const prodBuild = await buildProd(projectDirPath)
    if (!prodBuild.success) {
        return prodBuild as Engine.GameProject.BuildToWebFail
    }

    const dist: string = normalize(path.resolve(prodBuild.path, '../', PROJECT_DIST_WEB_DIRECTORY_NAME, sanitize(new Date().toUTCString())))
    const dirCopy = await copy(prodBuild.path, dist)
    if (!dirCopy.success) {
        const stream = writeToRenderer('build')
        stream.write(dirCopy.message)
        stream.destroy()
        return dirCopy as Engine.GameProject.BuildToWebFail
    }

    return {
        success: true,
        name: '웹으로 빌드',
        message: '성공적으로 웹으로 빌드했습니다',
        path: dist
    }
}

export function ipc(): void {
    ipcMain.handle('build-to-web', async (e: IpcMainInvokeEvent, projectDirPath: string): Promise<Engine.GameProject.BuildToWebSuccess|Engine.GameProject.BuildToWebFail> => {
        return await handler(projectDirPath)
    })
}