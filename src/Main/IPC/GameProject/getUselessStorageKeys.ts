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
    name: '사용하고 있지 않은 스토리지 키 읽기',
    message: '사용하고 있지 않은 스토리지 키 목록 읽기에 성공했습니다',
    files: uselessKeys
  }
}

export function ipc(): void {
  ipcMain.handle('get-useless-storage-keys', async (e: IpcMainInvokeEvent, projectDirectory: string): Promise<Engine.GameProject.GetUselessStorageKeysSuccess|Engine.GameProject.GetUselessStorageKeysFail> => {
    return await handler(projectDirectory)
  })
}