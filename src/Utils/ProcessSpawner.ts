import { spawn, SpawnOptionsWithoutStdio, ChildProcessWithoutNullStreams  } from 'child_process'
import kill from 'tree-kill'
import Stream from 'stream'

interface SpawnOption {
    writeStream?: Stream.Writable,
    deadWord?: string
}

export class ProcessSpawner {
    private options: SpawnOptionsWithoutStdio
    private isRunning: boolean = false
    private spawner: ChildProcessWithoutNullStreams|null = null
    private deadWord: string|null = null

    private static Childrens: Set<ProcessSpawner> = new Set

    static async Kill(deadWord: string): Promise<void> {
        for (const spawner of ProcessSpawner.Childrens) {
            if (spawner.deadWord !== deadWord) continue
            await spawner.kill()
        }
    }

    constructor(options: SpawnOptionsWithoutStdio = {}) {
        this.options = options
    }

    spawn(commandline: string, { writeStream, deadWord }: SpawnOption): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isRunning) {
                return reject('This spawner already running.')
            }
    
            const args: string[] = commandline.split(' ')
            const command: string = args.shift()!

            this.isRunning = true
            this.spawner = spawn(command, args, this.options)
            let err: string = ''

            if (!this.spawner) {
                return reject(new Error('The spawner could not be created with an unknown error.'))
            }

            ProcessSpawner.Childrens.add(this)
    
            this.spawner.stdout.setEncoding('utf-8')
            this.spawner.stderr.setEncoding('utf-8')

            if (deadWord) {
                this.deadWord = deadWord
            }
            if (writeStream) {
                this.spawner.stdout.pipe(writeStream)
            }
            this.spawner.stderr.on('data', (data: string): void => {
                err += data
            })

            this.spawner.on('exit', (code: number|null): void => {
                if (!this.spawner) {
                    reject(new Error('The spawner could not be created with an unknown error.'))
                }
                else {
                    if (code === 0) resolve()
                    else            reject(new Error(`The following error occurred. CODE: ${code}, ERR: ${err}`))
                }
                if (writeStream) {
                    writeStream.end()
                    writeStream.destroy()
                }
                ProcessSpawner.Childrens.delete(this)
                this.spawner = null
                this.isRunning = false
            })
        })
    }

    kill(): Promise<void> {
        return new Promise((resolve, reject): void => {
            if (!this.spawner) {
                return resolve()
            }
            try {
                kill(this.spawner.pid, (error?: Error): void => {
                    if (error) reject(error)
                    else {
                        ProcessSpawner.Childrens.delete(this)
                        resolve()
                    }
                })
            } catch(e) {
                reject(e)
            }
        })
    }

    setOption(options: SpawnOptionsWithoutStdio): this {
        this.options = options
        return this
    }
}