import { ipcMain, IpcMainInvokeEvent } from 'electron'

import { handler as getAllStorageKeys } from './getAllStorageKeys'
import { handler as getUsingStorageKeys } from './getUsingStorageKeys'

export async function handler(projectDirectory: string): Promise<Engine.GameProject.GetUselessStorageKeysSuccess|Engine.GameProject.GetUselessStorageKeysFail> {
  const allStorageKeysGet = await getAllStorageKeys(projectDirectory)
  const usingStorageKeysGet = await getUsingStorageKeys(projectDirectory)

  if (!allStorageKeysGet.success) {
    return allStorageKeysGet as Engine.GameProject.GetUselessStorageKeysFail
  }
  if (!usingStorageKeysGet.success) {
    return usingStorageKeysGet as Engine.GameProject.GetUselessStorageKeysFail
  }

  const uselessKeys = allStorageKeysGet.files.filter((key) => !usingStorageKeysGet.files.includes(key))

  return {
    success: true,
    name: '',
    message: '',
    files: uselessKeys
  }
}

export function ipc(): void {
  ipcMain.handle('get-useless-storage-keys', async (e: IpcMainInvokeEvent, projectDirectory: string): Promise<Engine.GameProject.GetUselessStorageKeysSuccess|Engine.GameProject.GetUselessStorageKeysFail> => {
    return await handler(projectDirectory)
  })
}