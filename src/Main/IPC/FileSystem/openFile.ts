import { dialog, ipcMain, IpcMainInvokeEvent, BrowserWindow } from 'electron'

export async function handler(filters: Engine.FileSystem.FileFilter[]): Promise<Engine.FileSystem.OpenFileSuccess|Engine.FileSystem.OpenFileFail> {
  const win = BrowserWindow.getFocusedWindow()
  if (!win) {
    return {
      success: false,
      name: '파일 열기 실패',
      message: '메인 윈도우가 없습니다'
    }
  }

  const filenames = await dialog.showOpenDialog(win, {
    title: '파일을 선택해주세요',
    properties: ['openFile'],
    filters
  })

  // 파일을 선택하지 않았을 경우
  if (filenames.canceled) {
    return {
      success: false,
      name: '파일 열기 취소',
      message: '사용자가 작업을 취소했습니다'
    }
  }

  const filename = filenames.filePaths.pop()
  if (!filename) {
    return {
      success: false,
      name: '파일 열기 실패',
      message: '파일을 선택해주세요'
    }
  }

  return {
    success: true,
    name: '파일 열기',
    message: '파일을 선택했습니다',
    path: filename
  }
}

export function ipc(): void {
  ipcMain.handle('open-file', async (e: IpcMainInvokeEvent, filters: Engine.FileSystem.FileFilter[]): Promise<Engine.FileSystem.OpenFileSuccess|Engine.FileSystem.OpenFileFail> => {
    return await handler(filters)
  })
}