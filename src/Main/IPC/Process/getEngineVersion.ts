import { app, ipcMain, IpcMainInvokeEvent } from 'electron'

export async function handler(): Promise<Engine.Process.GetEngineVersionSuccess|Engine.Process.GetEngineVersionFail> {
    try {
        const version: string = app.getVersion()
        return {
            success: true,
            name: '앱 버전 가져오기',
            message: '앱 버전을 성공적으로 가져왔습니다',
            version
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
    ipcMain.handle('get-engine-version', async (e: IpcMainInvokeEvent): Promise<Engine.Process.GetEngineVersionSuccess|Engine.Process.GetEngineVersionFail> => {
        return await handler()
    })
}