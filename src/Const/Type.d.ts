declare namespace Engine {
    namespace Type {
        type Primitive = string|number|boolean|null
        interface Json {
            [key: string]: Primitive|Primitive[]|Json
        }
        type Transferable = Primitive|Json
        type TransferableEncoding = 'utf8'|'utf-8'|'hex'|'base64'

        interface StreamChunk {
            channel: string
            data: string
        }
    }
}