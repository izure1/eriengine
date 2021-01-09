import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { SHA256 } from 'crypto-js'

export async function handler(applicationId: string): Promise<Engine.GameProject.GetEngineAuthSuccess|Engine.GameProject.GetEngineAuthFail> {
    try {
        const auth: string = SHA256(applicationId).toString()
        return {
            success: true,
            name: '프로젝트 인증 암호화 성공',
            message: '프로젝트 인증 암호화에 성공했습니다.',
            auth
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
    ipcMain.handle('get-engine-auth', async (e: IpcMainInvokeEvent, applicationId: string): Promise<Engine.GameProject.GetEngineAuthSuccess|Engine.GameProject.GetEngineAuthFail> => {
        return await handler(applicationId)
    })
}