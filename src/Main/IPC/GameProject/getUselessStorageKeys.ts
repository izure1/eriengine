import { ipcMain, IpcMainInvokeEvent } from 'electron'

import { handler as getAllStorageKeys } from './getAllStorageKeys'
import { handler as getUsingStorageKeys } from './getUsingStorageKeys'

export async function handler(projectDirectory: string): Promise<Engine.GameProject.GetUselessStorageKeysSuccess|Engine.GameProject.GetUselessStorageKeysFail> {
  const allKeys = await getAllStorageKeys(projectDirectory)
  const usingKeys = await getUsingStorageKeys(projectDirectory)

  if (!allKeys.success) {
    return allKeys as Engine.GameProject.GetUselessStorageKeysFail
  }
  if (!usingKeys.success) {
    return usingKeys as Engine.GameProject.GetUselessStorageKeysFail
  }

  const uselessKeys = allKeys.files.filter((key) => !usingKeys.files.includes(key))

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