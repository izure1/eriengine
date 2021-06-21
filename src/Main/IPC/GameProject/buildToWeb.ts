import path from 'path'
import normalize from 'normalize-path'
import sanitize from 'sanitize-filename'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as buildDev } from './buildDev'
import { handler as buildProd } from './buildProd'
import { handler as copy } from '../FileSystem/copy'
import { writeToRenderer } from '@/Utils/stream'
import {
  PROJECT_BUILD_WEB_DIRECTORY_NAME
} from '@/Const'

export async function handler(projectDirPath: string, buildMode: 'dev'|'prod' = 'prod'): Promise<Engine.GameProject.BuildToWebSuccess|Engine.GameProject.BuildToWebFail> {
  // 기본 빌드
  const built = await (buildMode === 'dev' ? buildDev : buildProd)(projectDirPath)
  if (!built.success) {
    return built as Engine.GameProject.BuildToWebFail
  }

  const dist = normalize(path.resolve(built.path, '../', PROJECT_BUILD_WEB_DIRECTORY_NAME, sanitize(new Date().toUTCString())))
  const dirCopy = await copy(built.path, dist)
  if (!dirCopy.success) {
    const stream = writeToRenderer('build')
    stream.write(dirCopy.message)
    stream.destroy()

    return dirCopy as Engine.GameProject.BuildToWebFail
  }

  return {
    success: true,
    name: '웹으로 빌드',
    message: '성공적으로 웹으로 빌드했습니다',
    path: dist
  }
}

export function ipc(): void {
  ipcMain.handle('build-to-web', async (e: IpcMainInvokeEvent, projectDirPath: string, buildMode: 'dev'|'prod'): Promise<Engine.GameProject.BuildToWebSuccess|Engine.GameProject.BuildToWebFail> => {
    return await handler(projectDirPath, buildMode)
  })
}