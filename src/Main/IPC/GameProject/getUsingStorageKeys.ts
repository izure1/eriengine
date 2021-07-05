import path from 'path'

import { ipcMain, IpcMainInvokeEvent } from 'electron'
import glob from 'fast-glob'

import { handler as getAllStorageKeys } from './getAllStorageKeys'
import { getStorageKeyFromFilename } from '@/Utils/getStorageKeyFromFilename'
import {
  PROJECT_SRC_DIRECTORY_NAME,
  PROJECT_SRC_DATA_DIRECTORY_NAME
} from '@/Const'

export async function handler(projectDirectory: string): Promise<Engine.GameProject.GetUsingStorageKeysSuccess|Engine.GameProject.GetUsingStorageKeysFail> {
  const allStorageKeysGet = await getAllStorageKeys(projectDirectory)

  if (!allStorageKeysGet.success) {
    return allStorageKeysGet as Engine.GameProject.GetUsingStorageKeysFail
  }

  const usingKeys: Set<string> = new Set
  const cwd = path.resolve(projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME)
  for (const key of allStorageKeysGet.files) {
    const filenames = await glob(`**/*.${key}.ts`, { cwd })

    const filename = filenames.pop() ?? null
    if (filename !== null) {
      const globKey = getStorageKeyFromFilename(filename)
      usingKeys.add(globKey)
    }
  }

  return {
    success: true,
    name: '사용 중인 스토리지 키',
    message: '사용 중인 스토리지 키 목록 읽기에 성공했습니다',
    files: Array.from(usingKeys)
  }
}

export function ipc(): void {
  ipcMain.handle('get-using-storage-keys', async (e: IpcMainInvokeEvent, projectDirectory: string): Promise<Engine.GameProject.GetUsingStorageKeysSuccess|Engine.GameProject.GetUsingStorageKeysFail> => {
    return await handler(projectDirectory)
  })
}