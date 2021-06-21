import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import { handler as checkUpdate } from './checkUpdate'

function mainWindow(): BrowserWindow|undefined {
  return BrowserWindow.getAllWindows()[0]
}

autoUpdater.autoDownload = false
autoUpdater.on('download-progress', (progressObj: Engine.Process.UpdateProgress) => {
  const main = mainWindow()
  if (!main) {
    return
  }
  main.webContents.send('download-update-progress', progressObj.percent)
})

autoUpdater.on('error', (error: Error): void => {
  const main = mainWindow()
  if (!main) {
    return
  }
  main.webContents.send('download-update-error', error.toString())
})

/**
 * 업데이트가 있는지 여부를 확인한 후, 있다면 다운로드를 시작합니다.
 * 다운로드까지만 이루어집니다. 설치를 위해서는 install-download 채널을 이용하여 메인프로세스에 invoke하십시오.
 * 다운로드 도중, download-update-progress 채널로 이벤트가 방출됩니다. 다운로드 진척도를 백분율로 환산하여 매개변수로 넘깁니다.
 * 다운로드 도중, 오류가 발생했다면 download-update-error 채널로 이벤트가 방출됩니다. 다운로드 오류에 대한 정보를 매개변수로 넘깁니다.
 * 다운로드가 완료되면 함수가 종료됩니다.
 * @returns 다운로드 성공여부입니다.
 */
export async function handler(): Promise<Engine.Process.DownloadUpdateSuccess|Engine.Process.DownloadUpdateFail> {
  const checkUpdateResult = await checkUpdate()
  if (!checkUpdateResult.success) {
    return checkUpdateResult
  }

  try {
    await autoUpdater.downloadUpdate()
  } catch (reason) {
    const { name, message } = reason as Error
    return {
      success: false,
      name,
      message
    }
  }

  return {
    success: true,
    name: '엔진 업데이트',
    message: '엔진 업데이트를 성공적으로 다운로드 받았습니다.',
    updateInfo: checkUpdateResult.updateInfo
  }
}

export function ipc(): void {
  ipcMain.handle('download-update', async (_e: IpcMainInvokeEvent): Promise<Engine.Process.DownloadUpdateSuccess|Engine.Process.DownloadUpdateFail> => {
    return await handler()
  })
}