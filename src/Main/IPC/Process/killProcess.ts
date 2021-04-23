import { ipcMain, IpcMainInvokeEvent } from 'electron'
import kill from 'tree-kill'

function killPromise(pid: number): Promise<void> {
    return new Promise((resolve, reject): void => {
        try {
            kill(pid, (error?: Error): void => {
                if (error) {
                    return reject(error)
                }
                resolve()
            })
        } catch (e) {
            reject(e)
        }
    })
}

export async function handler(pid: number): Promise<Engine.Process.KillProcessSuccess|Engine.Process.killProcessFail> {
    try {
        await killPromise(pid)
        return {
            success: true,
            name: '프로세스 종료',
            message: '프로세스를 성공적으로 종료했습니다',
            pid
        }
    } catch (e) {
        const { name, message } = e as Error
        return {
            success: false,
            name,
            message
        }
    }
}

export function ipc(): void {
    ipcMain.handle('kill-process', async (e: IpcMainInvokeEvent, pid: number): Promise<Engine.Process.KillProcessSuccess|Engine.Process.killProcessFail> => {
        return await handler(pid)
    })
}