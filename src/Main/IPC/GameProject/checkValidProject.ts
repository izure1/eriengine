import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as getEngineAuth } from '../Process/getEngineAuth'

export async function handler({ engineAuth, applicationId }: Engine.GameProject.Config): Promise<Engine.GameProject.CheckValidProjectSuccess|Engine.GameProject.CheckValidProjectFail> {
  if (!engineAuth) {
    return {
      success: false,
      name: '프로젝트 설정 확인',
      message: '프로젝트 설정에 \'engineAuth\' 값이 없습니다.'
    }
  }
  if (!applicationId) {
    return {
      success: false,
      name: '프로젝트 설정 확인',
      message: '프로젝트 설정에 \'applicationId\' 값이 없습니다.'
    }
  }

  try {
    const encrypted = await getEngineAuth(applicationId)
    if (!encrypted.success) {
      return encrypted as Engine.GameProject.CheckValidProjectFail
    }
    if (encrypted.auth !== engineAuth) {
      return {
        success: false,
        name: '프로젝트 설정 확인',
        message: '올바르지 않은 프로젝트 설정입니다'
      }
    }
    return {
      success: true,
      name: '프로젝트 설정 확인 성공',
      message: '올바른 프로젝트 설정입니다'
    }
  } catch (reason) {
    const { name, message } = reason as Error
    return {
      success: false,
      name,
      message
    }
  }
}

export function ipc(): void {
  ipcMain.handle('check-valid-project', async (e: IpcMainInvokeEvent, config: Engine.GameProject.Config): Promise<Engine.GameProject.CheckValidProjectSuccess|Engine.GameProject.CheckValidProjectFail> => {
    return await handler(config)
  })
}