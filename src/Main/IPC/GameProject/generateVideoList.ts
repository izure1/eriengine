import path from 'path'
import normalize from 'normalize-path'
import glob from 'fast-glob'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as writeFile } from '../FileSystem/writeFile'
import { getModuleContentFromArray } from '@/Utils/getModuleContentFromArray'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_DATA_DIRECTORY_NAME,
    PROJECT_SRC_DATA_VIDEO_DIRECTORY_NAME,
    PROJECT_SRC_VIDEOLIST_NAME
} from '@/Const'

export async function handler(projectDirPath: string): Promise<Engine.GameProject.GenerateVideoListSuccess|Engine.GameProject.GenerateVideoListFail> {
    const cwd = normalize(path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_VIDEO_DIRECTORY_NAME))
    const declaredPath = normalize(path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_VIDEOLIST_NAME))

    try {
        const aliasCwd = normalize(path.join('@', PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_VIDEO_DIRECTORY_NAME))
        const modulePaths = await glob('**/*.ts', { cwd, absolute: false })
        const jsonWrite = await writeFile(declaredPath,
            getModuleContentFromArray(
                modulePaths.map((filePath: string): string => {
                    return normalize(path.join(aliasCwd, filePath))
                }),
                '*',
                (maps): string => {
                    let content = 'export default {\n'
                    for (const map of maps) {
                        content += `    '${normalize(path.relative(aliasCwd, map.path))}': ${map.name},\n`
                    }
                    content += '}'
                    return content
                }
            ))

        if (!jsonWrite.success) {
            return jsonWrite as Engine.GameProject.GenerateVideoListFail
        }
    } catch (e) {
        const { name, message } = e as Error
        return {
            success: false,
            name,
            message
        }
    }

    return {
        success: true,
        name: '비디오 리스트 생성 성공',
        message: '비디오 리스트 생성에 성공했습니다',
        path: declaredPath
    }
}

export function ipc(): void {
    ipcMain.handle('generate-video-list', async (e: IpcMainInvokeEvent, projectDirPath: string): Promise<Engine.GameProject.GenerateVideoListSuccess|Engine.GameProject.GenerateVideoListFail> => {
        return await handler(projectDirPath)
    })
}