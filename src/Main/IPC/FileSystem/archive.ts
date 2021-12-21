import { ipcMain, IpcMainInvokeEvent } from 'electron'
import fs from 'fs-extra'
import archiver from 'archiver'

interface ArchiveOption {
  file: string
  name: string
}

function archive(srcFiles: ArchiveOption[], dist: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(dist)
    const archive = archiver('zip', {
      zlib: { level: 9 }
    })

    output.on('end', resolve)
    archive.on('error', reject)
    archive.pipe(output)

    srcFiles.forEach(({ file, name }) => {
      archive.file(file, { name })
    })

    archive.finalize()
  })
}

export async function handler(srcFiles: ArchiveOption[], dist: string): Promise<Engine.FileSystem.ArchiveSuccess|Engine.FileSystem.ArchiveFail> {
  try {
    await archive(srcFiles, dist)
  } catch (reason) {
    const { message } = reason as Error
    return {
      success: false,
      name: '압축 실패',
      message
    }
  }

  return {
    success: true,
    name: '압축 성공',
    message: '압축을 성공했습니다',
    path: dist
  }
}

export function ipc(): void {
  ipcMain.handle('archive', async (e: IpcMainInvokeEvent, srcFiles: ArchiveOption[], dist: string): Promise<Engine.FileSystem.ArchiveSuccess|Engine.FileSystem.ArchiveFail> => {
    return await handler(srcFiles, dist)
  })
}