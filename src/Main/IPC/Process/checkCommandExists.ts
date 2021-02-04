import { ipcMain, IpcMainInvokeEvent } from 'electron'
import exists from 'command-exists'

export async function handler(commandName: string): Promise<Engine.Process.CheckCommandExistsSuccess|Engine.Process.CheckCommandExistsFail> {
    try {
        await exists(commandName)
        return {
            success: true,
            name: '명령어 확인',
            message: `'${commandName}' 명령어가 존재합니다.`,
            exists: true
        }
    } catch(e) {
        return {
            success: true,
            name: '명령어 확인',
            message: `'${commandName}' 명령어가 존재하지 않습니다.`,
            exists: false
        }
    }
}

export function ipc(): void {
    ipcMain.handle('check-command-exists', async (e: IpcMainInvokeEvent, commandName: string): Promise<Engine.Process.CheckCommandExistsSuccess|Engine.Process.CheckCommandExistsFail> => {
        return await handler(commandName)
    })
}