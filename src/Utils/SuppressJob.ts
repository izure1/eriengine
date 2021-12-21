type SuppressID = number
type SuppressJobCallback = () => void

export class SuppressJob {
  private __duration: number = 250
  private __doings: Map<string, SuppressID> = new Map

  constructor(duration = 25) {
    this.__duration = duration
  }

  private __getTimeoutID(id: number|NodeJS.Timeout): number {
    if (typeof id === 'number') {
      return id
    }
    else {
      return id[Symbol.toPrimitive]()
    }
  }

  private __createJob(id: string, callback: SuppressJobCallback, duration = 250): void {
    const timeout = setTimeout(callback, duration)
    const timeoutID = this.__getTimeoutID(timeout)
    this.__doings.set(id, timeoutID)
  }

  private __deleteJob(id: string): void {
    const timeoutID = this.__doings.get(id) ?? NaN
    clearTimeout(timeoutID)
  }

  doJob(id: string, callback: SuppressJobCallback, duration = this.__duration): void {
    this.__deleteJob(id)
    this.__createJob(id, callback, duration)
  }

  clearJob(id: string): void {
    this.__deleteJob(id)
  }

  clearJobs(): void {
    this.__doings.forEach((_v, id) => {
      this.clearJob(id)
    })
  }
}