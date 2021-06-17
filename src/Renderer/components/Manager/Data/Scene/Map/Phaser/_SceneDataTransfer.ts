import { TypedEmitter } from 'tiny-typed-emitter'
import * as Types from './Vars/Types'

interface SceneDataTransferEvents {
  'load-map-fail':              (_message: string) => void
  'load-map-success':           (_map: Engine.GameProject.SceneMap, _missingAssets: string[]) => void
  'save-map-fail':              (_message: string) => void
  'save-map-success':           (_map: Engine.GameProject.SceneMap) => void
  'receive-map-side':           (_side: number) => void
  'receive-selection-type':     (_type: number) => void
  'receive-dispose-mode':       (_activity: boolean) => void
  'receive-dispose-brush':      (_brush: Types.PaletteImageAsset|Types.PaletteSpriteAsset|null) => void
  'receive-image-list':         (_list: Types.PaletteImageAsset[]) => void
  'receive-sprite-list':        (_list: Types.PaletteSpriteAsset[]) => void
  'receive-open-properties':    () => void
  'receive-delete-selection':   () => void
  'receive-wall-properties':    (_properties: Types.PaletteProperties) => void
  'receive-save-request':       () => void
  'receive-change-asset-path':  (_before: string, _after: string) => void
  'receive-delete-asset':       (_assetPath: string) => void
}

export class SceneDataTransfer extends TypedEmitter<SceneDataTransferEvents> {}