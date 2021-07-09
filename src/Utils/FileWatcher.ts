import path from 'path'
import fs from 'fs-extra'
import chokidar from 'chokidar'
import normalize from 'normalize-path'

type WatcherCallback = (_filePath: string) => void
export class FileWatcher {
  protected cwd: string
  private recursive: boolean
  private interval: number
  private intervalId: number = NaN
  private watcher: chokidar.FSWatcher|null = null
  private callbacks: WatcherCallback[] = []

  constructor(cwd: string, recursive: boolean = true, interval: number = 1000) {
    this.cwd = cwd
    this.recursive = recursive
    this.interval = interval
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
    this.watcher = chokidar.watch(this.cwd)
    this.watcher.on('all', (e, filePath) => { this.onUpdate(e, filePath) })
  }

  private onUpdate(e: string, filePath: string): void {
    for (const callback of this.callbacks) {
      filePath = path.resolve(this.cwd, filePath)
      filePath = normalize(filePath)
      callback(filePath)
    }
  }

  private startCheckInterval(): void {
    if (this.watcher && !fs.existsSync(this.cwd)) {
      this.destroyWatcher()
      this.onUpdate('change', this.cwd)
    }
    if (!this.watcher && fs.existsSync(this.cwd)) {
      this.setWatcher()
      this.onUpdate('change', this.cwd)
    }
  }

  private destroyInterval(): void {
    window.clearInterval(this.intervalId)
  }

  update(callback: WatcherCallback): this {
    this.callbacks.push(callback)
    return this
  }

  start(): this {
    this.setWatcher()
    this.intervalId = window.setInterval(this.startCheckInterval.bind(this), this.interval)
    return this
  }

  emit(): this {
    this.onUpdate('', '')
    return this
  }

  destroy(): this {
    this.destroyWatcher()
    this.destroyInterval()
    this.callbacks.length = 0
    return this
  }
}