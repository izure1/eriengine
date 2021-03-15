import path from 'path';
import { app, dialog, ipcMain, IpcMainInvokeEvent, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import { handler as checkUpdate } from './checkUpdate';

declare const __static: string;
let updateWin: BrowserWindow|null = null;

async function createUpdateWindow(): Promise<void> {
    closeUpdateWindow();
    updateWin = new BrowserWindow({
        backgroundColor: '#eeeeee',
        maxWidth: 400,
        maxHeight: 200,
        minWidth: 400,
        minHeight: 200,
        closable: false,
        minimizable: false,
        maximizable: false,
        width: 400,
        height: 200,
        parent: BrowserWindow.getAllWindows()[0] || null,
        modal: true,
        webPreferences: {
            nodeIntegration: true,
            spellcheck: false,
            webSecurity: false
        }
    });
    updateWin.setMenu(null);

    const file: string = path.resolve(__static, 'update.html');
    await updateWin.loadURL(file);
}

function closeUpdateWindow(): void {
    if (!updateWin) {
        return;
    }
    updateWin.destroy();
    updateWin = null;
}

autoUpdater.autoDownload = false;
autoUpdater.on('download-progress', (progressObj: Engine.Process.UpdateProgress) => {
    if (!updateWin) {
        return;
    }
    updateWin.webContents.send('download-progress', progressObj.percent);
});

autoUpdater.on('update-downloaded', () => {
    closeUpdateWindow();
    setTimeout((): void => {
        autoUpdater.quitAndInstall();
    }, 1000);
});

autoUpdater.on('error', (error: Error): void => {
    if (!updateWin) {
        return;
    }
    updateWin.webContents.send('error', error.toString());
});

export async function handler(): Promise<Engine.Process.UpdateEngineSuccess|Engine.Process.UpdateEngineFail> {
    const checkUpdateResult = await checkUpdate();
    if (!checkUpdateResult.success || !checkUpdateResult.available) {
        return checkUpdateResult;
    }

    createUpdateWindow();
    try {
        await autoUpdater.downloadUpdate();
    } catch(e) {
        const { name, message } = e;
        return {
            success: false,
            name,
            message
        };
    }

    return {
        success: true,
        name: '엔진 업데이트',
        message: '엔진 업데이트를 성공적으로 끝마쳤습니다.'
    };
}

export function ipc(): void {
    ipcMain.handle('update-engine', async (e: IpcMainInvokeEvent): Promise<Engine.Process.UpdateEngineSuccess|Engine.Process.UpdateEngineFail> => {
        return await handler();
    });
}