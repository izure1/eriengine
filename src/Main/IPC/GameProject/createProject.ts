import path from 'path'
import { nanoid } from 'nanoid'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { handler as ensureProject } from './ensureProject'
import { handler as addScene } from './addScene'
import { parseProperty } from '@/Utils/parseProperty'
import {
    PROJECT_DIRECTORY_NAME,
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_DATA_DIRECTORY_NAME,
    PROJECT_SRC_DATA_SCENE_DIRECTORY_NAME
} from '@/Const'

function createSceneName(name: string): string {
    return `${name}.${nanoid(10)}.ts`
}

function createUseDialogueCodeBlock(): string {
  return `
    // dialogue 플러그인의 출력창으로 gui씬을 사용합니다.
    this.dialogue.setUsingScene(NewScene.Key)
  `
}

async function ensureDefaultScenes(projectDirPath: string): Promise<Engine.GameProject.AddSceneSuccess|Engine.GameProject.AddSceneFail> {
  const mainSceneName = createSceneName('main')
  const guiSceneName = createSceneName('gui')

  const scenes: { name: string, property: object } [] = [
    {
      name: mainSceneName,
      property: {
        DEPTH: 0,
        AUTO_START: true
      }
    },
    {
      name: guiSceneName,
      property: {
        DEPTH: 1,
        AUTO_START: true,
        USING_DIALOGUE_GUI_SCENE: createUseDialogueCodeBlock()
      }
    }
  ]
  const sceneRootDir: string = path.resolve(projectDirPath, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_SCENE_DIRECTORY_NAME)
  for (const { name, property } of scenes) {
    const filePath = path.resolve(sceneRootDir, name)
    const sceneAdd = await addScene(projectDirPath, filePath, property)
    if (!sceneAdd.success) {
      return sceneAdd as Engine.GameProject.AddSceneFail
    }
  }
  return {
    success: true,
    name: '씬 초기화 성공',
    message: '씬 초기화에 성공했습니다',
    path: projectDirPath
  }
}

export async function handler(directoryPath: string, config: Engine.GameProject.Config): Promise<Engine.GameProject.CreateProjectSuccess|Engine.GameProject.CreateProjectFail> {
  const projectDirName = parseProperty(PROJECT_DIRECTORY_NAME, config)
  const projectDirPath = path.resolve(directoryPath, projectDirName)

  const projectEnsure = await ensureProject(projectDirPath, config, false)
  if (!projectEnsure.success) {
    return projectEnsure as Engine.GameProject.CreateProjectFail
  }

  // 기본 씬 생성
  const sceneEnsure = await ensureDefaultScenes(projectDirPath)
  if (!sceneEnsure.success) {
    return sceneEnsure as Engine.GameProject.CreateProjectFail
  }

  return {
    success: true,
    name: '프로젝트 생성 성공',
    message: '프로젝트 생성을 성공했습니다.',
    path: projectDirPath,
    config
  }
}

export function ipc(): void {
  ipcMain.handle('create-project', async (e: IpcMainInvokeEvent, directoryPath: string, config: Engine.GameProject.Config): Promise<Engine.GameProject.CreateProjectSuccess|Engine.GameProject.CreateProjectFail> => {
    return await handler(directoryPath, config)
  })
}