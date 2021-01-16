import { ipcMain, IpcMainInvokeEvent } from 'electron'
import exists from 'command-exists'

export async function handler(commandName: string): Promise<Engine.Process.CheckCommandExistsSuccess|Engine.Process.CheckCommandExistsFail> {
    try {
        await exists(commandName)
        return {
            success: true,
            name: '명령어 확인 성공',
            message: `'${commandName}' 명령어가 존재합니다.`
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
    ipcMain.handle('check-command-exists', async (e: IpcMainInvokeEvent, commandName: string): Promise<Engine.Process.CheckCommandExistsSuccess|Engine.Process.CheckCommandExistsFail> => {
        return await handler(commandName)
    })
}