/**
 * 
 *  파렛트는 에셋을 이용하여 만든 이미지, 오디오, 스프라이트 등 모듈의 정보를 의미합니다.
 *  가령 스프라이트 파일에는 frameWidth, frameHeight 등의 정보가 담겨 있습니다.
 * 
 *  파렛트는 이러한 정보를 타입화시켜 코드의 이해를 돕기 위해 사용되며,
 *  씬 파렛트를 이용해 저장된 Map.json 의 walls, floors, audios 오브젝트의 정보와는 무관합니다.
 * 
 *  Map.json에 저장된 정보는 Engine.GameObject.SceneMapFloor, SceneMapWall 등으로 사용하십시오.
 * 
 */
export interface PaletteImageAsset {
  key: string
  asset: string
}

export interface PaletteSpriteAsset extends PaletteImageAsset {
  frameWidth: number
  frameHeight: number
  frameRate: number
  start: number
  end: number
  repeat: number
}

export interface PaletteAudioAsset {
  key: string
  asset: string
}

export type PalettePaintAsset = PaletteImageAsset|PaletteSpriteAsset|PaletteAudioAsset
export interface Palette {
  images: PaletteImageAsset[]
  sprites: PaletteSpriteAsset[]
  audios: PaletteAudioAsset[]
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