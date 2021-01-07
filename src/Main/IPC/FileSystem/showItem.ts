import { ipcMain, shell, IpcMainInvokeEvent } from 'electron'

export async function handler(path: string): Promise<Engine.FileSystem.showItemSuccess|Engine.FileSystem.showItemFail> {
    try {
        shell.showItemInFolder(path.replace(/\//g, '\\'))
    } catch(e) {
        const { name, message } = e
        return {
            success: false,
            name,
            message
        }
    }

    return {
        success: true,
        name: '요소 선택 성공',
        message: '요소를 선택했습니다',
        path
    }
}

export function ipc(): void {
    ipcMain.handle('show-item', async (e: IpcMainInvokeEvent, path: string): Promise<Engine.FileSystem.showItemSuccess|Engine.FileSystem.showItemFail> => {
        return await handler(path)
    })
}