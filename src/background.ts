'use strict'

import path from 'path'
import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

declare const __static: string

const isDevelopment = process.env.NODE_ENV !== 'production'


function *generateIPC() {
    // File system
    yield require('./Main/IPC/FileSystem/readDirectory')
    yield require('./Main/IPC/FileSystem/openDirectory')
    yield require('./Main/IPC/FileSystem/openFile')
    yield require('./Main/IPC/FileSystem/openFiles')
    yield require('./Main/IPC/FileSystem/saveFile')
    yield require('./Main/IPC/FileSystem/makeDirectory')
    yield require('./Main/IPC/FileSystem/readFile')
    yield require('./Main/IPC/FileSystem/readJSON')
    yield require('./Main/IPC/FileSystem/writeFile')
    yield require('./Main/IPC/FileSystem/writeJSON')
    yield require('./Main/IPC/FileSystem/copy')
    yield require('./Main/IPC/FileSystem/rename')
    yield require('./Main/IPC/FileSystem/find')
    yield require('./Main/IPC/FileSystem/delete')
    yield require('./Main/IPC/FileSystem/trash')
    yield require('./Main/IPC/FileSystem/showItem')

    // Game project
    yield require('./Main/IPC/GameProject/createProject')
    yield require('./Main/IPC/GameProject/ensureProject')
    yield require('./Main/IPC/GameProject/readProject')
    yield require('./Main/IPC/GameProject/checkValidProject')

    yield require('./Main/IPC/GameProject/addScene')
    yield require('./Main/IPC/GameProject/addSceneScript')
    yield require('./Main/IPC/GameProject/addActor')
    yield require('./Main/IPC/GameProject/addActorScript')
    yield require('./Main/IPC/GameProject/addAnimation')
    yield require('./Main/IPC/GameProject/addSkill')
    yield require('./Main/IPC/GameProject/addSprite')
    yield require('./Main/IPC/GameProject/addImage')
    yield require('./Main/IPC/GameProject/addAudio')
    yield require('./Main/IPC/GameProject/addVideo')

    yield require('./Main/IPC/GameProject/generatePackageJson')
    yield require('./Main/IPC/GameProject/generateActorList')
    yield require('./Main/IPC/GameProject/generateSceneList')
    yield require('./Main/IPC/GameProject/generateAnimationList')
    yield require('./Main/IPC/GameProject/generateAssetList')
    yield require('./Main/IPC/GameProject/generateSkillList')
    yield require('./Main/IPC/GameProject/generateSpriteList')
    yield require('./Main/IPC/GameProject/generateImageList')
    yield require('./Main/IPC/GameProject/generateAudioList')
    yield require('./Main/IPC/GameProject/generateVideoList')
    yield require('./Main/IPC/GameProject/generateStorageList')

    yield require('./Main/IPC/GameProject/addStorage')
    yield require('./Main/IPC/GameProject/addStorageDirectory')
    yield require('./Main/IPC/GameProject/addStorageFile')
    yield require('./Main/IPC/GameProject/addStorageJSON')
    yield require('./Main/IPC/GameProject/readStorageFile')
    yield require('./Main/IPC/GameProject/readStorageJSON')
    yield require('./Main/IPC/GameProject/checkStorageExists')
    yield require('./Main/IPC/GameProject/getStoragePath')
    yield require('./Main/IPC/GameProject/getStorageDirectories')
    yield require('./Main/IPC/GameProject/getStorageFiles')

    yield require('./Main/IPC/GameProject/readSceneMap')
    yield require('./Main/IPC/GameProject/ensureSceneMap')
    yield require('./Main/IPC/GameProject/writeSceneMap')

    yield require('./Main/IPC/GameProject/buildCreateFiles')
    yield require('./Main/IPC/GameProject/buildGen')
    yield require('./Main/IPC/GameProject/buildDev')
    yield require('./Main/IPC/GameProject/buildProd')
    yield require('./Main/IPC/GameProject/buildServe')
    yield require('./Main/IPC/GameProject/buildToWeb')
    yield require('./Main/IPC/GameProject/buildToApp')
    
    // Process
    yield require('./Main/IPC/Process/checkCommandExists')
    yield require('./Main/IPC/Process/getEngineAuth')
    yield require('./Main/IPC/Process/getEngineVersion')
    yield require('./Main/IPC/Process/killProcess')
    yield require('./Main/IPC/Process/killSpawner')
}

// IPC 함수를 실행합니다.
(() => {
    const generate = generateIPC()
    for (const { ipc } of generate) ipc()
})()


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

// delete 모듈이 빌드된 파일의 .asar 파일을 삭제하지 못하는 오류를 수정
//process.noAsar = true

async function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        show: false,
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            spellcheck: false,
            nodeIntegration: true,
            webSecurity: false
        },
        icon: path.resolve(__static, 'icon.png')
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }

    win.setMenu(null)
    win.once('ready-to-show', win.show)
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  // file:/// 프로토콜 처리
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''))
    callback(pathname)
  })

  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
