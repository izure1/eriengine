declare module 'npmi' {
    type InstallInformation = string[]

    interface NpmLoadOptions {
        loglevel: 'silent'|'error'|'warn'|'notice'|'http'|'timing'|'info'|'verbose'|'silly'
    }

    export interface NpmiConst {
        LOAD_ERR: string
        INSTALL_ERR: string
        VIEW_ERR: string
        NPM_VERSION: string
    }

    export interface NpmiOptions {
        name: string
        version: string
        path: string
        forceInstall?: boolean
        npmLoad?: NpmLoadOptions
    }

    export type NpmiCallback = (err: Error, result: InstallInformation[]) => void

    interface Npmi extends NpmiConst {
        (options: NpmiOptions, callback: NpmiCallback): void
    }

    const _: Npmi
    export default _
}