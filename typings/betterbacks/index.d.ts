declare module 'betterbacks' {
    export interface BetterbacksOptions {
        animate?: boolean
        type?: 'squircles'|'squares'|'circles'
        density?: 'low'|'med'|'high'
        themeColor?: string
        dark?: boolean
    }
    interface Betterbacks {
        (selector: string, setting: BetterbacksOptions): void
    }
    const _: Betterbacks
    export default _
}