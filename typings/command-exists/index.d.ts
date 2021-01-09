declare module 'command-exists' {
    interface CommandExists {
        (commandName: string): Promise<string>
        (commandName: string, cb: (err: Error|null, exists: boolean) => void): void
        sync(commandName: string): boolean
    }
    const _: CommandExists
    export default _
}