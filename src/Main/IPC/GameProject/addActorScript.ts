import path from 'path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'

import normalize from 'normalize-path'

import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import {
  DATA_LISTS,
  PROJECT_SRC_DIRECTORY_NAME,
  PROJECT_SRC_DATA_DIRECTORY_NAME,
  PROJECT_SRC_DATA_ACTOR_DIRECTORY_NAME
} from '@/Const'

import { parseProperty } from '@/Utils/parseProperty'
import RAW_SCRIPT from 'raw-loader!@/Template/Game/ACTOR_SCRIPT.txt'

async function writeScriptFile(projectDirectory: string, filePath: string, scriptFilePath: string): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {
  const actorDirectory = path.resolve(projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_ACTOR_DIRECTORY_NAME)
  const actorListKey = path.relative(normalize(actorDirectory), normalize(filePath))
  
  const fileContent = parseProperty(RAW_SCRIPT, {
    DATA_LISTS,
    ACTOR_LIST_KEY: normalize(actorListKey)
  })

  const fileWrite = await writeFile(scriptFilePath, fileContent)
  if (!fileWrite.success) {
    return fileWrite as Engine.FileSystem.WriteFileFail
  }

  return {
    success: true,
    name: '액터 스크립트 생성 성공',
    message: '액터 스크립트 생성에 성공했습니다',
    path: scriptFilePath
  }
}

export async function handler(projectDirectory: string, filePath: string, scriptFilePath: string): Promise<Engine.GameProject.AddActorScriptSuccess|Engine.GameProject.AddActorScriptFail> {
  const directoryEnsure = await makeDirectory(path.dirname(scriptFilePath))
  if (!directoryEnsure.success) {
    return directoryEnsure as Engine.GameProject.AddActorScriptFail
  }

  const fileWrite = await writeScriptFile(projectDirectory, filePath, scriptFilePath)
  if (!fileWrite.success) {
    return fileWrite as Engine.GameProject.AddActorScriptFail
  }

  return fileWrite
}

export function ipc(): void {
  ipcMain.handle('add-actor-script', async (e: IpcMainInvokeEvent, projectDirectory: string, filePath: string, scriptFilePath: string): Promise<Engine.GameProject.AddActorScriptSuccess|Engine.GameProject.AddActorScriptFail> => {
    return await handler(projectDirectory, filePath, scriptFilePath)
  })
}