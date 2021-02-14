export interface PaletteImage {
    key: string
    asset: string
}

export interface PaletteSprite extends PaletteImage {
    frameWidth: number
    frameHeight: number
    frameRate: number
    start: number
    end: number
    repeat: number
}

export interface PaletteProperties {
    alias: string
    isSensor: boolean
    scale: number
}

export interface Point2 {
    x: number
    y: number
}

export interface Rect {
    a: Point2
    b: Point2
}