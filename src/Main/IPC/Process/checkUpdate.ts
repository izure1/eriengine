import { app, ipcMain, IpcMainInvokeEvent } from 'electron'
import { autoUpdater } from 'electron-updater'
import compareVersions from 'compare-versions'

/**
 * 업데이트가 있는지 체크합니다. 현재 엔진의 버전보다 높은 버전이 릴리즈되었다면 정보를 받아옵니다.
 * @returns 업데이트 정보입니다. available 속성을 이용하여 업데이트 가능여부를 알 수 있습니다.
 */
export async function handler(): Promise<Engine.Process.CheckUpdateSuccess|Engine.Process.CheckUpdateFail> {
  try {
    const updateCheckResult = await autoUpdater.checkForUpdates()
    const appVersion = app.getVersion()
    const updateVersion = updateCheckResult.updateInfo.version

    if (!compareVersions.validate(appVersion) || !compareVersions.validate(updateVersion)) {
      return {
        success: false,
        name: '자동 업데이트 확인',
        message: `자동 업데이트 확인에 실패했습니다. appVersion: '${appVersion}', updateVersion: '${updateVersion}'은(는) 올바른 버전 정보가 아닙니다.`
      }
    }

    if (compareVersions.compare(updateVersion, appVersion, '<=')) {
      return {
        success: false,
        name: '자동 업데이트 확인',
        message: `자동 업데이트가 필요하지 않습니다. appVersion: '${appVersion}', updateVersion: '${updateVersion}'`
      }
    }

    return {
      success: true,
      name: '자동 업데이트 확인',
      message: `자동 업데이트가 필요합니다. appVersion: '${appVersion}', updateVersion: '${updateVersion}'`,
      updateInfo: updateCheckResult.updateInfo
    }
  } catch (reason) {
    const { name, message } = reason as Error
    return {
      success: false,
      name,
      message
    }
  }
}

export function ipc(): void {
  ipcMain.handle('check-update', async (_e: IpcMainInvokeEvent): Promise<Engine.Process.CheckUpdateSuccess|Engine.Process.CheckUpdateFail> => {
    return await handler()
  })
}