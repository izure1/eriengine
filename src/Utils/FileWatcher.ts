import path from 'path'
import fs from 'fs-extra'
import chokidar from 'chokidar'
import normalize from 'normalize-path'

import { SuppressJob } from '@/Utils/SuppressJob'

type WatcherCallback = (_filePath: string) => void

export class FileWatcher {
  protected cwd: string
  private recursive: boolean
  private interval: number
  private intervalId: number = NaN
  private watcher: chokidar.FSWatcher|null = null
  private callbacks: WatcherCallback[] = []
  private suppressJob: SuppressJob|null = null

  constructor(cwd: string, recursive: boolean = true, interval: number = 1000) {
    this.cwd = cwd
    this.recursive = recursive
    this.interval = interval
  }

  private destroyWatcher(): void {
    if (this.watcher) {
      this.watcher.close()
      this.watcher = null
    }
    if (this.suppressJob) {
      this.suppressJob.clearJobs()
      this.suppressJob = null
    }
  }

  private setWatcher(): void {
    this.destroyWatcher()
    if (!fs.existsSync(this.cwd)) {
      return
    }
    this.suppressJob = new SuppressJob(250)

    // todo: 폴링을 쓰는 이유
    // chikidar에서 폴링을 사용하지 않으면 여러 디렉토리가 중첩되어 있을 경우, 상위 디렉토리를 잠그는 오류가 발생함.
    // https://github.com/paulmillr/chokidar/issues/320
    const watchInterval = 1500
    this.watcher = chokidar.watch(this.cwd, { ignoreInitial: true, awaitWriteFinish: true, usePolling: true, interval: watchInterval, binaryInterval: watchInterval })
    this.watcher.on('add', (filePath) => { this.onUpdate(filePath) })
    this.watcher.on('change', (filePath) => { this.onUpdate(filePath) })
    this.watcher.on('unlink', (filePath) => { this.onUpdate(filePath) })
  }

  private onUpdate(filePath: string): void {
    if (this.suppressJob) {
      this.suppressJob.doJob('update', () => {
        filePath = path.resolve(this.cwd, filePath)
        filePath = normalize(filePath)
        for (const callback of this.callbacks) {
          callback(filePath)
        }
      })
    }
  }

  private startCheckInterval(): void {
    if (this.watcher && !fs.existsSync(this.cwd)) {
      this.destroyWatcher()
      this.onUpdate(this.cwd)
    }
    if (!this.watcher && fs.existsSync(this.cwd)) {
      this.setWatcher()
      this.onUpdate(this.cwd)
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
    this.onUpdate('')
    return this
  }

  destroy(): this {
    this.destroyWatcher()
    this.destroyInterval()
    this.callbacks.length = 0
    return this
  }
}