declare module 'add-filename-increment' {
    import { ParsedPath } from 'path'
    interface Options {
        fs?: boolean
        platform?: 'linux'|'win32'|'darwin'
        increment?: (filepath: string, options: Options) => string
    }
    interface AddFilenameIncrement {
        (path: string, options?: Options): string
        path(filepath: string, options?: Options): string
        file(file: string|ParsedPath, options?: Options): ParsedPath
        ordinal(num: number): string
        toOrdinal(num: number): string
    }
    const _: AddFilenameIncrement
    export default _
}