import path from 'path'
import normalize from 'normalize-path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { ProcessSpawner } from '@/Utils/ProcessSpawner'
import { writeToRenderer } from '@/Utils/stream'

export async function handler(projectDirPath: string): Promise<Engine.GameProject.BuildToWebSuccess|Engine.GameProject.BuildToWebFail> {

    try {
        const spawner = new ProcessSpawner({ shell: true, cwd: projectDirPath })
        await spawner.spawn('npm run serve', writeToRenderer('build-to-web'))
    } catch(reason) {
        const { name, message } = reason as Error
        return {
            success: false,
            name,
            message
        }
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