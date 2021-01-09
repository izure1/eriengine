import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as getEngineAuth } from './getEngineAuth'

export async function handler({ ENGINE_AUTH, APPLICATION_ID }: Engine.GameProject.Config): Promise<Engine.GameProject.CheckValidProjectSuccess|Engine.GameProject.CheckValidProjectFail> {
    if (!ENGINE_AUTH) {
        return {
            success: false,
            name: '프로젝트 설정 확인 실패',
            message: '프로젝트 설정에 \'ENGINE_AUTH\' 값이 없습니다.'
        }
    }
    if (!APPLICATION_ID) {
        return {
            success: false,
            name: '프로젝트 설정 확인 실패',
            message: '프로젝트 설정에 \'APPLICATION_ID\' 값이 없습니다.'
        }
    }

    try {
        const entryped = await getEngineAuth(APPLICATION_ID)
        if (!entryped.success) {
            return entryped as Engine.GameProject.CheckValidProjectFail
        }
        if (entryped.auth !== ENGINE_AUTH) {
            console.log(APPLICATION_ID, ENGINE_AUTH, entryped)
            return {
                success: false,
                name: '프로젝트 설정 확인 성공',
                message: '올바르지 않은 프로젝트 설정입니다'
            }
        }
        return {
            success: true,
            name: '프로젝트 설정 확인 성공',
            message: '올바른 프로젝트 설정입니다'
        }
    } catch(e) {
        const { name, message } = e as Error
        return {
            success: false,
            name,
            message
        }
    }
}

export function ipc(): void {
    ipcMain.handle('check-valid-project', async (e: IpcMainInvokeEvent, config: Engine.GameProject.Config): Promise<Engine.GameProject.CheckValidProjectSuccess|Engine.GameProject.CheckValidProjectFail> => {
        return await handler(config)
    })
}