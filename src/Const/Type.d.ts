declare namespace Engine {
    namespace Type {
        type Primitive = string|number|boolean|null
        interface Json {
            [key: string]: Primitive|Primitive[]|Json
        }
        type Transferable = Primitive|Json

        interface StreamChunk {
            channel: string
            data: string
        }
    }
}