import { ipcMain, IpcMainInvokeEvent } from 'electron'
import fs from 'fs-extra'
import Zip from 'adm-zip'

function unzip(src: string, dist: string, overwrite: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(src)) {
      const err = new Error(`The '${src}' file not exists.`)
      reject(err)
    }
    // todo: adm-zip 패키지에 매개변수 3개를 사용할 경우, 비동기 사용에 오류가 있음.
    // 버그가 수정되기 전까지 비동기 사용 금지
    // https://github.com/cthackers/adm-zip/issues/407
    // new Zip(src).extractAllToAsync(dist, overwrite, (err) => {
    //   if (err) reject(err)
    //   else resolve(dist)
    // })
    try {
      new Zip(src).extractAllTo(dist, overwrite)
      resolve(src)
    } catch (reason) {
      reject(reason)
    }
  })
}

export async function handler(src: string, dist: string, overwrite: boolean): Promise<Engine.FileSystem.UnzipSuccess|Engine.FileSystem.UnzipFail> {
  try {
    await unzip(src, dist, overwrite)
  } catch (reason) {
    const { message } = reason as Error
    return {
      success: false,
      name: '압축 해제 실패',
      message
    }
  }

  return {
    success: true,
    name: '압축 해제',
    message: '압축을 해제했습니다',
    src,
    dist
  }
}

export function ipc(): void {
  ipcMain.handle('unzip', async (e: IpcMainInvokeEvent, src: string, dist: string, overwrite: boolean = false): Promise<Engine.FileSystem.UnzipSuccess|Engine.FileSystem.UnzipFail> => {
    return await handler(src, dist, overwrite)
  })
}