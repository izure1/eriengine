import { ipcMain, IpcMainInvokeEvent } from 'electron'

import { handler as getUselessStorageKeys } from './getUselessStorageKeys'
import { handler as getStorageDirectories } from './getStorageDirectories'
import { handler as trash } from '../FileSystem/trash'

export async function handler(projectDirectory: string, confirm: boolean): Promise<Engine.GameProject.DeleteUselessStorageDirectoriesSuccess|Engine.GameProject.DeleteUselessStorageDirectoriesFail> {
  const uselessStorageKeysGet = await getUselessStorageKeys(projectDirectory)

  if (!uselessStorageKeysGet.success) {
    return uselessStorageKeysGet as Engine.GameProject.DeleteUselessStorageDirectoriesFail
  }

  for (const key of uselessStorageKeysGet.files) {
    const storageDirectoriesGet = await getStorageDirectories(projectDirectory, key)
    if (!storageDirectoriesGet.success) {
      return storageDirectoriesGet as Engine.GameProject.DeleteUselessStorageDirectoriesFail
    }

    const itemDelete = await trash(storageDirectoriesGet.path, confirm)
    if (!itemDelete.success) {
      return itemDelete as Engine.GameProject.DeleteUselessStorageDirectoriesFail
    }
  }

  return {
    success: true,
    name: '사용하고 있지 않는 스토리지 디렉토리 삭제',
    message: '사용하고 있지 않는 스토리지 디렉토리 삭제에 성공했습니다'
  }
}

export function ipc(): void {
  ipcMain.handle('delete-useless-storage-directories', async (e: IpcMainInvokeEvent, projectDirectory: string, confirm: boolean = false): Promise<Engine.GameProject.DeleteUselessStorageDirectoriesSuccess|Engine.GameProject.DeleteUselessStorageDirectoriesFail> => {
    return await handler(projectDirectory, confirm)
  })
}