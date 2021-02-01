declare module 'ansi-to-html' {
    interface ConvertOptions {
        fg?: string
        bg?: string
        newline?: boolean
        escapeXML?: boolean
        stream?: boolean
    }
    declare class Convert {
        toHtml(ansi: string): string
    }
    interface AnsiToHtml {
        new (options?: ConvertOptions): Convert
    }
    const _: AnsiToHtml
    export default _
}