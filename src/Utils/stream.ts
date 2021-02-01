import { ipcMain, ipcRenderer, BrowserWindow, IpcRendererEvent, IpcMainEvent } from 'electron'
import Stream from 'stream'


const STREAM_IPC_CHANNEL: string = '__eriengine-standard-ipc-stream-channel__'

/**
 * Electron background에서 Renderer로 IPC를 이용한 데이터를 전송하기 위한 스트림 클래스입니다
 */
class MainWriteStream extends Stream.Writable {
    protected channel: string
    private win: BrowserWindow|null = null

    constructor(channel: string) {
        super()
        this.channel = channel
        this.win = BrowserWindow.getFocusedWindow()
    }

    _write(chunk: Buffer|string|any, encoding: string, callback: (err?: Error|null) => void): void {
        this.win = BrowserWindow.getFocusedWindow()
        if (!this.win) {
            callback(new Error('Browser window not exists.'))
            return
        }
        this.win.webContents.send(STREAM_IPC_CHANNEL, { channel: this.channel, data: chunk.toString() })
        callback(null)
    }

    _destroy(error: Error|null, callback: (error?: Error|null) => void): void {
        this.win = null
        callback(null)
    }
}

/**
 * Electron Renderer에서 background로 IPC를 이용한 데이터를 전송하기 위한 스트림 클래스입니다
 */
class RendererWriteStream extends Stream.Writable {
    protected channel: string
    
    constructor(channel: string) {
        super()
        this.channel = channel
    }

    _write(chunk: Buffer|string|any, encoding: string, callback: (err?: Error|null) => void): void {
        ipcRenderer.send(STREAM_IPC_CHANNEL, { channel: this.channel, data: chunk.toString() })
        callback(null)
    }

    _destroy(error: Error|null, callback: (error?: Error|null) => void): void {
        callback(null)
    }
}

/**
 * Electron background에서 Renderer로부터 IPC로 전송된 데이터를 수신받는 스트림 클래스입니다
 */
class MainReadStream extends Stream.Readable {
    protected channel: string
    private onReceive = (e: IpcMainEvent, chunk: Engine.Type.StreamChunk): void => {
        if (chunk.channel !== this.channel) {
            return
        }
        this.push(chunk.data)
    }

    constructor(channel: string) {
        super()
        this.channel = channel
        ipcMain.on(STREAM_IPC_CHANNEL, this.onReceive)
    }

    _read(size: number): void {}

    _destroy(error: Error|null, callback: (error?: Error|null) => void): void {
        ipcMain.off(STREAM_IPC_CHANNEL, this.onReceive)
        callback(null)
    }
}

/**
 * Electron Renderer에서 background로부터 IPC로 전송된 데이터를 수신받는 스트림 클래스입니다
 */
class RendererReadStream extends Stream.Readable {
    protected channel: string
    private onReceive = (e: IpcRendererEvent, chunk: Engine.Type.StreamChunk): void => {
        if (chunk.channel !== this.channel) {
            return
        }
        this.push(chunk.data)
    }

    constructor(channel: string) {
        super()
        this.channel = channel
        ipcRenderer.on(STREAM_IPC_CHANNEL, this.onReceive)
    }

    _read(size: number): void {}

    _destroy(error: Error|null, callback: (error?: Error|null) => void): void {
        ipcRenderer.off(STREAM_IPC_CHANNEL, this.onReceive)
        callback(null)
    }
}

/**
 * 백그라운드에서 렌더러로 데이터를 전송하는 스트림을 생성합니다
 * @param channel 전송할 채널입니다
 */
export function writeToRenderer(channel: string): MainWriteStream {
    return new MainWriteStream(channel)
}

/**
 * 렌더러에서 백그라운드로 데이터를 전송하는 스트림을 생성합니다
 * @param channel 전송할 채널입니다
 */
export function writeToMain(channel: string): RendererWriteStream {
    return new RendererWriteStream(channel)
}

/**
 * 렌더러에서 전송된 데이터를 수신받을 스트림을 생성합니다
 * @param channel 수신받을 채널입니다
 */
export function readFromRenderer(channel: string): MainReadStream {
    return new MainReadStream(channel)
}

/**
 * 백그라운드에서 전송된 데이터를 수신받을 스트림을 생성합니다
 * @param channel 수신받을 채널입니다
 */
export function readFromMain(channel: string): RendererReadStream {
    return new RendererReadStream(channel)
}