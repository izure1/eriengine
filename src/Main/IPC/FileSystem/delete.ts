import { ipcMain, BrowserWindow, dialog, IpcMainInvokeEvent } from 'electron'
import path from 'path'
import normalize from 'normalize-path'
import del from 'del'

export async function handler(itemPath: string, confirm: boolean): Promise<Engine.FileSystem.DeleteSuccess|Engine.FileSystem.DeleteFail> {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) {
        return { success: false, name: '삭제 실패', message: '메인 윈도우가 없습니다' }
    }

    if (confirm) {
        const filename = path.basename(itemPath)
        const delConfirm = await dialog.showMessageBox(win, {
            type: 'question',
            title: '파일 삭제',
            message: '파일을 영구적으로 삭제하시겠습니까?',
            detail: `'${filename}' 파일을 영구적으로 삭제하시겠습니까?\n이 작업은 돌이킬 수 없습니다.`,
            buttons: ['아니오', '예']
        })

        if (delConfirm.response === 0) {
            return { success: false, name: '삭제 취소', message: '사용자가 작업을 취소했습니다' }
        }
    }
    
    try {
        process.noAsar = true
        await del(normalize(itemPath), { force: true })
        process.noAsar = false
    } catch(e) {
        process.noAsar = false
        const { message } = e as Error
        return {
            success: false,
            name: '삭제 실패',
            message
        }
    }

    return {
        success: true,
        name: '파일 삭제',
        message: '파일을 삭제했습니다',
        path: itemPath
    }
}

export function ipc(): void {
    ipcMain.handle('delete', async (e: IpcMainInvokeEvent, itemPath: string, confirm: boolean): Promise<Engine.FileSystem.DeleteSuccess|Engine.FileSystem.DeleteFail> => {
        return await handler(itemPath, confirm)
    })
}