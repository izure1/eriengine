import path from 'path'
import normalize from 'normalize-path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as readJson } from '../FileSystem/readJSON'
import { handler as writeFile } from '../FileSystem/writeFile'
import { parseProperty } from '@/Utils/parseProperty'
import { ProcessSpawner } from '@/Utils/ProcessSpawner'
import { writeToRenderer } from '@/Utils/stream'

import RAW_GAME_INDEX from 'raw-loader!@/Template/Game/GAME_HTML.txt'

async function readTitle(projectDirPath: string): Promise<Engine.FileSystem.ReadJsonSuccess|Engine.FileSystem.ReadJsonFail> {
    const configPath: string = path.resolve(projectDirPath, 'config.json')
    return await readJson(configPath)
}

async function appendHtml(projectDirPath: string): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
    const dist: string  = path.resolve(projectDirPath, 'dist')

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

export async function handler(projectDirPath: string): Promise<Engine.GameProject.BuildToWebSuccess|Engine.GameProject.BuildToWebFail> {

    try {
        const spawner = new ProcessSpawner({ shell: true, cwd: projectDirPath })
        const command: string = 'npm run build:dev'

        await spawner.spawn(command, writeToRenderer('build-to-web'))
    } catch(reason) {
        const { name, message } = reason as Error
        return {
            success: false,
            name,
            message
        }
    }

    const htmlAppend = await appendHtml(projectDirPath)
    if (!htmlAppend.success) {
        return htmlAppend as Engine.GameProject.BuildToWebFail
    }

    return {
        success: true,
        name: '게임 웹으로 빌드',
        message: '성공적으로 빌드하였습니다',
        path: normalize(path.resolve(projectDirPath, 'dist'))
    }

}

export function ipc(): void {
    ipcMain.handle('build-to-web', async (e: IpcMainInvokeEvent, projectDirPath: string): Promise<Engine.GameProject.BuildToWebSuccess|Engine.GameProject.BuildToWebFail> => {
        return await handler(projectDirPath)
    })
}