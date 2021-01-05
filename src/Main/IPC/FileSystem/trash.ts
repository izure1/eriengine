import { ipcMain, BrowserWindow, dialog, IpcMainInvokeEvent } from 'electron'
import path from 'path'
import slash from 'slash'
import trash from 'trash'

export async function handler(itemPath: string, confirm: boolean): Promise<Engine.FileSystem.TrashSuccess|Engine.FileSystem.TrashFail> {
    const win: BrowserWindow|null = BrowserWindow.getFocusedWindow()
    if (!win) {
        return { success: false, name: '삭제 실패', message: '메인 윈도우가 없습니다' }
    }

    if (confirm) {
        const filename: string = path.basename(itemPath)
        const delConfirm = await dialog.showMessageBox(win, {
            type: 'question',
            title: '파일 삭제',
            message: '파일을 휴지통으로 이동하겠습니까?',
            detail: `'${filename}' 파일을 휴지통으로 이동하겠습니까?`,
            buttons: ['아니오', '예']
        })

        if (delConfirm.response === 0) {
            return { success: false, name: '삭제 취소', message: '사용자가 작업을 취소했습니다' }
        }
    }
    
    try {
        await trash(slash(itemPath))
    } catch(e) {
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
    ipcMain.handle('trash', async (e: IpcMainInvokeEvent, itemPath: string, confirm: boolean): Promise<Engine.FileSystem.TrashSuccess|Engine.FileSystem.TrashFail> => {
        return await handler(itemPath, confirm)
    })
}