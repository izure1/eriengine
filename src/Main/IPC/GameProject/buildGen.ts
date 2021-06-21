import path from 'path'
import normalize from 'normalize-path'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { ProcessSpawner } from '@/Utils/ProcessSpawner'
import { writeToRenderer } from '@/Utils/stream'
import {
  PROJECT_CACHE_DIRECTORY_NAME,
  PROJECT_CACHE_SCENEPALETTE_DIRECTORY_NAME
} from '@/Const'

export async function handler(projectDirPath: string): Promise<Engine.GameProject.GeneratePreviewListSuccess|Engine.GameProject.GeneratePreviewListFail> {
  try {
    const spawner = new ProcessSpawner({ shell: true, cwd: projectDirPath })
    const command = 'npm run build:gen'

    await spawner.spawn(command, { writeStream: writeToRenderer('build'), deadWord: 'build-gen' })
  } catch (reason) {
    const { name, message } = reason as Error
    return {
      success: false,
      name,
      message
    }
  }

  return {
    success: true,
    name: '씬 프리뷰 리스트 빌드',
    message: '씬 프리뷰 리스트를 성공적으로 빌드하였습니다',
    path: normalize(path.resolve(projectDirPath, PROJECT_CACHE_DIRECTORY_NAME, PROJECT_CACHE_SCENEPALETTE_DIRECTORY_NAME))
  }
}

export function ipc(): void {
  ipcMain.handle('build-gen', async (e: IpcMainInvokeEvent, projectDirPath: string): Promise<Engine.GameProject.GeneratePreviewListSuccess|Engine.GameProject.GeneratePreviewListFail> => {
    return await handler(projectDirPath)
  })
}