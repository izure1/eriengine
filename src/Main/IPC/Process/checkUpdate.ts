import { app, ipcMain, IpcMainInvokeEvent } from 'electron';
import { autoUpdater } from 'electron-updater';
import compareVersions from 'compare-versions';

export async function handler(): Promise<Engine.Process.CheckUpdateSuccess|Engine.Process.CheckUpdateFail> {
    try {
        const updateCheckResult = await autoUpdater.checkForUpdates();
        const appVersion: string = app.getVersion();
        const updateVersion: string = updateCheckResult.updateInfo.version;

        if (!compareVersions.validate(appVersion) || !compareVersions.validate(updateVersion)) {
            return {
                success: false,
                name: '자동 업데이트 확인',
                message: `자동 업데이트 확인에 실패했습니다. appVersion: '${appVersion}', updateVersion: '${updateVersion}'은(는) 올바른 버전 정보가 아닙니다.`
            };
        }

        if (compareVersions.compare(updateVersion, appVersion, '<=')) {
            return {
                success: true,
                name: '자동 업데이트 확인',
                message: `자동 업데이트가 필요하지 않습니다. appVersion: '${appVersion}', updateVersion: '${updateVersion}'`,
                available: false,
                updateInfo: updateCheckResult.updateInfo
            };
        }

        return {
            success: true,
            available: true,
            name: '자동 업데이트 확인',
            message: `자동 업데이트가 필요합니다. appVersion: '${appVersion}', updateVersion: '${updateVersion}'`,
            updateInfo: updateCheckResult.updateInfo
        };
    } catch(e) {
        const { name, message } = e;
        return {
            success: false,
            name,
            message
        };
    }
}

export function ipc(): void {
    ipcMain.handle('check-update', async (e: IpcMainInvokeEvent): Promise<Engine.Process.CheckUpdateSuccess|Engine.Process.CheckUpdateFail> => {
        return await handler();
    });
}