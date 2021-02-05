import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as getEngineAuth } from '../Process/getEngineAuth'

export async function handler({ engineAuth, applicationId }: Engine.GameProject.Config): Promise<Engine.GameProject.CheckValidProjectSuccess|Engine.GameProject.CheckValidProjectFail> {
    if (!engineAuth) {
        return {
            success: true,
            name: '프로젝트 설정 확인',
            message: '프로젝트 설정에 \'engineAuth\' 값이 없습니다.',
            valid: false
        }
    }
    if (!applicationId) {
        return {
            success: true,
            name: '프로젝트 설정 확인',
            message: '프로젝트 설정에 \'applicationId\' 값이 없습니다.',
            valid: false
        }
    }

    try {
        const entryped = await getEngineAuth(applicationId)
        if (!entryped.success) {
            return entryped as Engine.GameProject.CheckValidProjectFail
        }
        if (entryped.auth !== engineAuth) {
            return {
                success: true,
                name: '프로젝트 설정 확인',
                message: '올바르지 않은 프로젝트 설정입니다',
                valid: false
            }
        }
        return {
            success: true,
            name: '프로젝트 설정 확인 성공',
            message: '올바른 프로젝트 설정입니다',
            valid: true
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