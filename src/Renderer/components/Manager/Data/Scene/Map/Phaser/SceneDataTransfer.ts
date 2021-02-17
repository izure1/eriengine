import { TypedEmitter } from 'tiny-typed-emitter'
import * as Types from './Vars/Types'

interface SceneDataTransferEvents {
    'load-map-fail':            (message: string) => void
    'load-map-success':         (map: Engine.GameProject.SceneMap) => void
    'save-map-fail':            (message: string) => void
    'save-map-success':         (map: Engine.GameProject.SceneMap) => void
    'receive-map-side':         (side: number) => void
    'receive-selection-type':   (type: number) => void
    'receive-dispose-mode':     (activity: boolean) => void
    'receive-dispose-brush':    (brush: Types.PaletteImage|Types.PaletteSprite|null) => void
    'receive-image-list':       (list: Types.PaletteImage[]) => void
    'receive-sprite-list':      (list: Types.PaletteSprite[]) => void
    'receive-open-properties':  () => void
    'receive-delete-selection': () => void
    'receive-wall-properties':       (properties: Types.PaletteProperties) => void
    'receive-save-request':     () => void
}

export class SceneDataTransfer extends TypedEmitter<SceneDataTransferEvents> {}