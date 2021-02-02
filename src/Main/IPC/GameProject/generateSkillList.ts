import path from 'path'
import normalize from 'normalize-path'
import glob from 'fast-glob'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as writeFile } from '../FileSystem/writeFile'
import { getModuleContentFromArray } from '@/Utils/getModuleContentFromArray'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_DATA_DIRECTORY_NAME,
    PROJECT_SRC_DATA_SKILL_DIRECTORY_NAME,
    PROJECT_SRC_SKILLLIST_NAME
} from '@/Const'

export async function handler(projectDirPath: string): Promise<Engine.GameProject.GenerateSkillListSuccess|Engine.GameProject.GenerateSkillListFail> {
    const cwd: string       = normalize(path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_SKILL_DIRECTORY_NAME))
    const listPath: string  = normalize(path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_SKILLLIST_NAME))

    try {
        const aliasCwd: string          = normalize(path.join('@', PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_SKILL_DIRECTORY_NAME))
        const list: string[]            = await glob('**/*.ts', { cwd, absolute: false })
        const jsonWrite                 = await writeFile(listPath,
            getModuleContentFromArray(
                list.map((filePath: string): string => {
                    return normalize(path.join(aliasCwd, filePath))
                }),
                '*',
                (maps): string => {
                    let content: string = 'export default {\n'
                    for (const map of maps) {
                        content += `    '${normalize(path.relative(aliasCwd, map.path))}': ${map.name},\n`
                    }
                    content += '}'
                    return content
                }
            ))

        if (!jsonWrite.success) {
            return jsonWrite as Engine.GameProject.GenerateSkillListFail
        }
    } catch(e) {
        const { name, message } = e as Error
        return {
            success: false,
            name,
            message
        }
    }

    return {
        success: true,
        name: '스킬 리스트 생성 성공',
        message: '스킬 리스트 생성에 성공했습니다',
        path: listPath
    }
}

export function ipc(): void {
    ipcMain.handle('generate-skill-list', async (e: IpcMainInvokeEvent, projectDirPath: string): Promise<Engine.GameProject.GenerateSkillListSuccess|Engine.GameProject.GenerateSkillListFail> => {
        return await handler(projectDirPath)
    })
}