import { ipcMain, ipcRenderer, BrowserWindow, IpcRendererEvent } from 'electron'
import Stream from 'stream'


const STREAM_IPC_CHANNEL: string = '__eriengine-standard-ipc-stream-channel__'

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

export function writeToRenderer(channel: string): Stream.Writable {
    return new MainWriteStream(channel)
}

export function readFromMain(channel: string): Stream.Readable {
    return new RendererReadStream(channel)
}