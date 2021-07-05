import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'

import { handler as readDirectory } from '../FileSystem/readDirectory'

import {
  PROJECT_SRC_DIRECTORY_NAME,
  PROJECT_SRC_STORAGE_DIRECTORY_NAME,
} from '@/Const'

export async function handler(projectDirectory: string): Promise<Engine.GameProject.GetAllStorageKeysSuccess|Engine.GameProject.GetAllStorageKeysFail> {
  const storageDirectory = path.resolve(projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_STORAGE_DIRECTORY_NAME)
  const dirs = await readDirectory(storageDirectory, { includeDirectories: true, includeFiles: false })

  if (!dirs.success) {
    return dirs as Engine.GameProject.GetAllStorageKeysFail
  }

  return {
    success: true,
    name: '스토리지 키 읽기',
    message: '스토리지 키 읽기에 성공했습니다',
    files: dirs.files
  }
}

export function ipc(): void {
  ipcMain.handle('get-all-storage-keys', async (e: IpcMainInvokeEvent, projectDirectory: string): Promise<Engine.GameProject.GetAllStorageKeysSuccess|Engine.GameProject.GetAllStorageKeysFail> => {
    return await handler(projectDirectory)
  })
}