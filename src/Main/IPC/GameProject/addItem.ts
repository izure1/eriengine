import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { DATA_LISTS } from '@/Const'

import { parseProperty } from '@/Utils/parseProperty'
import RAW_ITEM from 'raw-loader!@/Template/Game/ITEM.txt'

async function writeItemFile(filePath: string): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
  const fileContent = parseProperty(RAW_ITEM, {
    DATA_LISTS
  })

  const fileWrite = await writeFile(filePath, fileContent)
  if (!fileWrite.success) {
    return fileWrite as Engine.FileSystem.WriteFileFail
  }

  return {
    success: true,
    name: '아이템 생성 성공',
    message: '아이템 생성에 성공했습니다',
    path: filePath
  }
}

export async function handler(filePath: string): Promise<Engine.GameProject.AddItemSuccess|Engine.GameProject.AddItemFail> {
  const directoryEnsure = await makeDirectory(path.dirname(filePath))
  if (!directoryEnsure.success) {
    return directoryEnsure as Engine.GameProject.AddItemFail
  }

  const fileWrite = await writeItemFile(filePath)
  if (!fileWrite.success) {
    return fileWrite as Engine.GameProject.AddItemFail
  }

  return fileWrite
}

export function ipc(): void {
  ipcMain.handle('add-item', async (e: IpcMainInvokeEvent, filePath: string): Promise<Engine.GameProject.AddItemSuccess|Engine.GameProject.AddItemFail> => {
    return await handler(filePath)
  })
}