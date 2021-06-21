import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as getStoragePath } from './getStoragePath'
import { handler as readFile } from '../FileSystem/readFile'

export async function handler(projectDirPath: string, key: string, dirname: string, filename: string): Promise<Engine.GameProject.ReadStorageFileSuccess|Engine.GameProject.ReadStorageFileFail> {
  const pathGet = await getStoragePath(projectDirPath, key, dirname, filename)
  if (!pathGet.success) {
    return pathGet as Engine.GameProject.ReadStorageFileFail
  }

  const fileRead = await readFile(pathGet.path)
  if (!fileRead.success) {
    return fileRead as Engine.GameProject.ReadStorageFileFail
  }

  return {
    success: true,
    name: '스토리지 파일 읽기 성공',
    message: '스토리지 파일 읽기에 성공했습니다',
    path: fileRead.path,
    content: fileRead.content
  }
}

export function ipc(): void {
  ipcMain.handle('read-storage-file', async (e: IpcMainInvokeEvent, projectDirPath: string, key: string, dirname: string, filename: string): Promise<Engine.GameProject.ReadStorageFileSuccess|Engine.GameProject.ReadStorageFileFail> => {
    return await handler(projectDirPath, key, dirname, filename)
  })
}