import { spawn, SpawnOptionsWithoutStdio, ChildProcessWithoutNullStreams  } from 'child_process'
import Stream from 'stream'

export class ProcessSpawner {
    private options: SpawnOptionsWithoutStdio
    private isRunning: boolean = false

    constructor(options: SpawnOptionsWithoutStdio = {}) {
        this.options = options
    }

    spawn(commandline: string, destination: Stream.Writable): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.isRunning) {
                return reject('This spawner already running.')
            }
    
            const args: string[] = commandline.split(' ')
            const command: string = args.shift()!

            this.isRunning = true
            let spawner: ChildProcessWithoutNullStreams|null = spawn(command, args, this.options)
            let err: string = ''
    
            spawner.stdout.setEncoding('utf-8')
            spawner.stderr.setEncoding('utf-8')
    
            spawner.stdout.pipe(destination)
            spawner.stderr.on('data', (data: string): void => {
                err += data
            })

            spawner.on('exit', (code: number|null, signal): void => {
                if (!spawner) {
                    reject('The spawner could not be created with an unknown error.')
                }
                else {
                    if (code === 0) resolve()
                    else            reject(`The following error occurred. CODE: ${code}, ERR: ${err}`)
                }
                destination.end()
                destination.destroy()
                spawner = null
                this.isRunning = false
            })
        })
    }

    setOption(options: SpawnOptionsWithoutStdio): this {
        this.options = options
        return this
    }
}