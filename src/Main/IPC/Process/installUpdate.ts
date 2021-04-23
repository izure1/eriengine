import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { autoUpdater } from 'electron-updater'

/**
 * 현재 앱을 강제종료하고, 다운로드된 업데이트를 설치합니다.
 * 이 함수를 호출하기 전에, check-update, download-update 작업을 마쳤어야 합니다.
 * 만일 다운로드된 업데이트가 없다면 앱은 강제종료되지만, 설치작업은 이루어지지 않습니다.
 */
export async function handler(): Promise<void> {
    autoUpdater.quitAndInstall()
}

export function ipc(): void {
    ipcMain.handle('install-update', async (e: IpcMainInvokeEvent): Promise<void> => {
        return await handler()
    })
}