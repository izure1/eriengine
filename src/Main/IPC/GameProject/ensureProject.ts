import path from 'path'
import fs from 'fs-extra'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as makeDirectory } from '../FileSystem/makeDirectory'
import { handler as writeFile } from '../FileSystem/writeFile'
import { handler as copy } from '../FileSystem/copy'
import { handler as generatePackageJson } from './generatePackageJson'
import { parseProperty } from '@/Utils/parseProperty'
import { ProcessSpawner } from '@/Utils/ProcessSpawner'
import { writeToRenderer } from '@/Utils/stream'
import {
  ENGINE_BUILDING_SERVER_PORT,
  DATA_LISTS,
  STORAGE_LISTS,
  PROJECT_TSCONFIG_NAME,
  PROJECT_WEBPACK_NAME,
  PROJECT_WEBPACKGEN_NAME,
  PROJECT_README_NAME,
  PROJECT_TYPINGS_DIRECTORY_NAME,
  PROJECT_EXTEND_DIRECTORY_NAME,
  PROJECT_SRC_DIRECTORY_NAME,
  PROJECT_SRC_BASESCENE_NAME,
  PROJECT_SRC_BASEACTOR_NAME,
  PROJECT_SRC_GAME_NAME,
  PROJECT_SRC_TYPES_NAME,
  PROJECT_SRC_SCENELIST_NAME,
  PROJECT_SRC_ASSET_DIRECTORY_NAME,
  PROJECT_SRC_ASSET_AUDIO_DIRECTORY_NAME,
  PROJECT_SRC_ASSET_FONT_DIRECTORY_NAME,
  PROJECT_SRC_ASSET_IMAGE_DIRECTORY_NAME,
  PROJECT_SRC_ASSET_SPRITE_DIRECTORY_NAME,
  PROJECT_SRC_ASSET_VIDEO_DIRECTORY_NAME,
  PROJECT_SRC_BUILD_DIRECTORY_NAME,
  PROJECT_SRC_BUILD_FAVICON_NAME,
  PROJECT_SRC_DATA_DIRECTORY_NAME,
  PROJECT_SRC_DATA_SCENE_DIRECTORY_NAME,
  PROJECT_SRC_DATA_ACTOR_DIRECTORY_NAME,
  PROJECT_SRC_DATA_ANIMATION_DIRECTORY_NAME, 
  PROJECT_SRC_DATA_AUDIO_DIRECTORY_NAME, 
  PROJECT_SRC_DATA_IMAGE_DIRECTORY_NAME,
  PROJECT_SRC_DATA_SKILL_DIRECTORY_NAME,
  PROJECT_SRC_DATA_VIDEO_DIRECTORY_NAME,
  PROJECT_SRC_IMAGELIST_NAME,
  PROJECT_SRC_ANIMSLIST_NAME,
  PROJECT_SRC_AUDIOLIST_NAME
} from '@/Const'
import RAW_PROJECT_TSCONFIG from 'raw-loader!@/Template/Project/TSCONFIG.txt'
import RAW_PROJECT_WEBPACK from 'raw-loader!@/Template/Project/WEBPACK.CONFIG.txt'
import RAW_PROJECT_WEBPACKGEN from 'raw-loader!@/Template/Project/WEBPACK.GEN.CONFIG.txt'
import RAW_PROJECT_README from 'raw-loader!@/Template/Project/README.txt'
import RAW_TYPES from 'raw-loader!@/Template/Project/TYPES.txt'
import RAW_GAME from 'raw-loader!@/Template/Game/GAME.txt'
import RAW_BASE_SCENE from 'raw-loader!@/Template/Game/BASE_SCENE.txt'
import RAW_BASE_ACTOR from 'raw-loader!@/Template/Game/BASE_ACTOR.txt'

declare const __static: string

interface FileWriteQueue {
  path?: string
  content: string|((_path?: string) => Promise<void>)
}

async function ensureRequireModules(projectDirPath: string, forceUpdate: boolean = false): Promise<Engine.ModuleSystem.InstallSuccess|Engine.ModuleSystem.InstallFail> {
  try {
    const command = forceUpdate ? 'npm update' : 'npm i'
    const spawner = new ProcessSpawner({ shell: true, cwd: projectDirPath })
    await spawner.spawn(command, { writeStream: writeToRenderer('ensure-require-modules') })
  } catch (reason) {
    return {
      success: false,
      name: reason,
      message: reason
    }
  }

  return {
    success: true,
    name: '프로젝트 서드파티모듈 설치 성공',
    message: '프로젝트에 필요한 서드파티모듈 설치를 성공했습니다'
  }
}

async function ensureBaseFile(projectDirPath: string, config: Engine.GameProject.Config): Promise<Engine.FileSystem.WriteFileSuccess|Engine.FileSystem.WriteFileFail> {

  const srcDirPath = path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME)
  const files: FileWriteQueue[] = [
    // tsconfig.json
    {
      path: path.resolve(projectDirPath, PROJECT_TSCONFIG_NAME),
      content: parseProperty(RAW_PROJECT_TSCONFIG, {})
    },
    // webpack.config.js
    {
      path: path.resolve(projectDirPath, PROJECT_WEBPACK_NAME),
      content: parseProperty(RAW_PROJECT_WEBPACK, {
        ENGINE_BUILDING_SERVER_PORT
      })
    },
    // webpack.gen.config.js
    {
      path: path.resolve(projectDirPath, PROJECT_WEBPACKGEN_NAME),
      content: parseProperty(RAW_PROJECT_WEBPACKGEN, {
        IMAGE_LIST: PROJECT_SRC_IMAGELIST_NAME,
        ANIMS_LIST: PROJECT_SRC_ANIMSLIST_NAME,
        AUDIO_LIST: PROJECT_SRC_AUDIOLIST_NAME
      })
    },
    // README.txt
    {
      path: path.resolve(projectDirPath, PROJECT_README_NAME),
      content: parseProperty(RAW_PROJECT_README, {})
    },
    {
      path: path.resolve(srcDirPath, PROJECT_SRC_TYPES_NAME),
      content: parseProperty(RAW_TYPES, {})
    },
    // src/BaseScene.ts
    {
      path: path.resolve(srcDirPath, PROJECT_SRC_BASESCENE_NAME),
      content: parseProperty(RAW_BASE_SCENE, {
        DATA_LISTS,
        STORAGE_LISTS,
        APPLICATION_ID: config.applicationId
      })
    },
    // src/BaseActor.ts
    {
      path: path.resolve(srcDirPath, PROJECT_SRC_BASEACTOR_NAME),
      content: parseProperty(RAW_BASE_ACTOR, {
        DATA_LISTS,
        STORAGE_LISTS
      })
    },
    // src/Game.ts
    {
      path: path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_GAME_NAME),
      content: parseProperty(RAW_GAME, {
        PROJECT_SRC_SCENELIST_NAME: path.parse(PROJECT_SRC_SCENELIST_NAME).name
      })
    },
    // src/build/favicon.png
    {
      path: path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_BUILD_DIRECTORY_NAME, PROJECT_SRC_BUILD_FAVICON_NAME),
      content: async (faviconPath?: string): Promise<void> => {
        if (!faviconPath) {
          throw new Error('파비콘이 생성될 경로가 지정되지 않았습니다')
        }
        if (!fs.existsSync(faviconPath)) {
          const src = path.resolve(__static, 'icon.png')
          const faviconEnsure = await copy(src, faviconPath)
          if (!faviconEnsure.success) {
            throw faviconEnsure
          }
        }
      }
    },
    // package.json, extend/package.json
    {
      content: async (): Promise<void> => {
        const packageGen = await generatePackageJson(projectDirPath, config)
        if (!packageGen.success) {
          throw packageGen
        }
      }
    }
  ]

  for (const { path, content } of files) {
    if (typeof content === 'function') {
      try {
        await content(path)
      } catch (reason) {
        const { name, message } = reason as Error
        return { success: false, name, message }
      }
    }
    else {
      if (!path) {
        return {
          success: false,
          name: '프로젝트 기본 파일 생성',
          message: '파일이 생성될 경로가 지정되지 않았습니다'
        }
      }
      const fileWrite = await writeFile(path, content)
      if (!fileWrite.success) {
        return fileWrite
      }
    }
  }

  return {
    success: true,
    name: '프로젝트 기본 파일 생성',
    message: '프로젝트 기본 파일 생성에 성공했습니다',
    path: srcDirPath
  }
}

export async function handler(directoryPath: string, config: Engine.GameProject.Config, forceUpdate: boolean): Promise<Engine.GameProject.CreateProjectSuccess|Engine.GameProject.CreateProjectFail> {
  // 디렉토리 생성하기
  const dirs = [
    path.resolve(directoryPath, PROJECT_EXTEND_DIRECTORY_NAME),
    path.resolve(directoryPath, PROJECT_TYPINGS_DIRECTORY_NAME),
    path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME),
    path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME, PROJECT_SRC_ASSET_AUDIO_DIRECTORY_NAME),
    path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME, PROJECT_SRC_ASSET_FONT_DIRECTORY_NAME),
    path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME, PROJECT_SRC_ASSET_IMAGE_DIRECTORY_NAME),
    path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME, PROJECT_SRC_ASSET_SPRITE_DIRECTORY_NAME),
    path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME, PROJECT_SRC_ASSET_VIDEO_DIRECTORY_NAME),
    path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_BUILD_DIRECTORY_NAME),
    path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME),
    path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_SCENE_DIRECTORY_NAME),
    path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_ACTOR_DIRECTORY_NAME),
    path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_ANIMATION_DIRECTORY_NAME),
    path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_AUDIO_DIRECTORY_NAME),
    path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_IMAGE_DIRECTORY_NAME),
    path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_SKILL_DIRECTORY_NAME),
    path.resolve(directoryPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_VIDEO_DIRECTORY_NAME)
  ]

  for (const dirPath of dirs) {
    const dirCreate = await makeDirectory(dirPath)
    if (!dirCreate.success) {
      return dirCreate as Engine.GameProject.CreateProjectFail
    }
  }

  // 기본 파일 생성
  const baseFilesWrite = await ensureBaseFile(directoryPath, config)
  if (!baseFilesWrite.success) {
    return baseFilesWrite as Engine.GameProject.CreateProjectFail
  }

  // 종속 모듈 설치
  const moduleInstall = await ensureRequireModules(directoryPath, forceUpdate)
  if (!moduleInstall.success) {
    return moduleInstall as Engine.GameProject.CreateProjectFail
  }

  return {
    success: true,
    name: '프로젝트 생성 성공',
    message: '프로젝트 생성을 성공했습니다.',
    path: directoryPath,
    config
  }
}

export function ipc(): void {
  ipcMain.handle('ensure-project', async (e: IpcMainInvokeEvent, directoryPath: string, config: Engine.GameProject.Config, forceUpdate: boolean): Promise<Engine.GameProject.CreateProjectSuccess|Engine.GameProject.CreateProjectFail> => {
    return await handler(directoryPath, config, forceUpdate)
  })
}