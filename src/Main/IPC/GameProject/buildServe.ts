import path from 'path'
import normalize from 'normalize-path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as buildCreateFiles } from './buildCreateFiles'
import { ProcessSpawner } from '@/Utils/ProcessSpawner'
import { writeToRenderer } from '@/Utils/stream'

export async function handler(projectDirPath: string): Promise<Engine.GameProject.BuildServeSuccess|Engine.GameProject.BuildServeFail> {

    try {
        const spawner = new ProcessSpawner({ shell: true, cwd: projectDirPath })
        const command: string = 'npm run serve'

        await spawner.spawn(command, { writeStream: writeToRenderer('build'), deadWord: 'build-serve' })
    } catch(reason) {
        const { name, message } = reason as Error
        return {
            success: false,
            name,
            message
        }
    }

    const htmlAppend = await buildCreateFiles(projectDirPath)
    if (!htmlAppend.success) {
        return htmlAppend as Engine.GameProject.BuildServeFail
    }

    return {
        success: true,
        name: '게임 개발서버 빌드',
        message: '게임을 개발서버모드로 성공적으로 빌드하였습니다',
        path: normalize(path.resolve(projectDirPath, 'dist'))
    }

}

export function ipc(): void {
    ipcMain.handle('build-serve', async (e: IpcMainInvokeEvent, projectDirPath: string): Promise<Engine.GameProject.BuildServeSuccess|Engine.GameProject.BuildServeFail> => {
        return await handler(projectDirPath)
    })
}