import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { ProcessSpawner } from '@/Utils/ProcessSpawner'

export async function handler(deadWord: string): Promise<Engine.Process.KillSpawnerSuccess|Engine.Process.KillSpawnerFail> {
    try {
        await ProcessSpawner.Kill(deadWord)
        return {
            success: true,
            name: '스포너 종료',
            message: '스포너를 성공적으로 종료했습니다'
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
    ipcMain.handle('kill-spawner', async (e: IpcMainInvokeEvent, deadWord: string): Promise<Engine.Process.KillSpawnerSuccess|Engine.Process.KillSpawnerFail> => {
        return await handler(deadWord)
    })
}