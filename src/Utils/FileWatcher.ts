import path from 'path'
import fs from 'fs-extra'
import normalize from 'normalize-path'

type WatcherCallback = (filePath: string) => void
export class FileWatcher {
    protected cwd: string
    private recursive: boolean
    private watcher: fs.FSWatcher|null = null
    private callbacks: WatcherCallback[] = []

    constructor(cwd: string, recursive: boolean = true) {
        this.cwd = cwd
        this.recursive = recursive
    }

    private destroyWatcher(): void {
        if (!this.watcher) {
            return
        }
        this.watcher.close()
        this.watcher = null
    }

    private setWatcher(): void {
        this.destroyWatcher()
        if (!fs.existsSync(this.cwd)) {
            return
        }
        this.watcher = fs.watch(this.cwd, { recursive: this.recursive, }, (e: string, filePath: string) => { this.onUpdate(e, filePath) })
    }

    private onUpdate(e: string, filePath: string): void {
        for (const callback of this.callbacks) {
            filePath = path.resolve(this.cwd, filePath)
            filePath = normalize(filePath)
            callback(filePath)
        }
    }

    update(callback: WatcherCallback): this {
        this.callbacks.push(callback)
        return this
    }

    start(): this {
        this.setWatcher()
        return this
    }

    emit(): this {
        this.onUpdate('', '')
        return this
    }

    destroy(): this {
        this.destroyWatcher()
        this.callbacks.length = 0
        return this
    }
}