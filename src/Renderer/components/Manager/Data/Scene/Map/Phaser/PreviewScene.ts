import path from 'path'
import Phaser from 'phaser'
import { TypedEmitter } from 'tiny-typed-emitter'
import { ipcRenderer } from 'electron'
import { Plugin as ActorPlugin, Actor } from '@eriengine/plugin-actor'
import { Plugin as DialoguePlugin } from '@eriengine/plugin-dialogue'
import { Plugin as FogOfWarPlugin } from '@eriengine/plugin-fog-of-war'
import { Plugin as IsometricScenePlugin } from '@eriengine/plugin-isometric-scene'
import { Plugin as IsometricCursorPlugin } from '@eriengine/plugin-isometric-cursor'
import { FileWatcher } from '@/Utils/FileWatcher'

import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_ASSET_DIRECTORY_NAME
} from '@/Const'



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

interface DataTransferEvents {
    'load-map-fail':            (message: string) => void
    'load-map-success':         (map: Engine.GameProject.SceneMap) => void
    'receive-map-side':         (side: number) => void
    'receive-cursor-side':      (side: number) => void
    'receive-dispose-mode':     (mode: number, source: PaletteImage|PaletteSprite|null) => void
    'receive-image-list':       (list: PaletteImage[]) => void
    'receive-sprite-list':      (list: PaletteSprite[]) => void
}

class DataTransfer extends TypedEmitter<DataTransferEvents> {}

export default class PreviewScene extends Phaser.Scene {
    private isometric!: IsometricScenePlugin
    private cursor!: IsometricCursorPlugin
    private actor!: ActorPlugin
    private fow!: FogOfWarPlugin
    private dialogue!: DialoguePlugin

    transfer: DataTransfer = new DataTransfer
    private watcher: FileWatcher|null = null

    private projectDirectory: string = ''
    private storageKey: string = ''
    private mapFilePath: string = ''
    private mapData: Engine.GameProject.SceneMap = { side: 2000, actors: [], walls: [], floors: [] }
    private cameraControl: Phaser.Cameras.Controls.SmoothedKeyControl|null = null

    private requireImages:  PaletteImage[] = []
    private requireSprites: PaletteSprite[] = []

    private disposeMode: number  = 0
    private disposeSource: PaletteImage|PaletteSprite|null = null


    constructor(projectDirectory: string, storageKey: string, filePath: string) {
        super({ key: '__preview-scene__', active: true })

        this.projectDirectory = projectDirectory
        this.storageKey = storageKey
        this.mapFilePath = filePath

        this.transfer
        .on('receive-image-list', (list): void => {
            this.requireImages = list
        })
        .on('receive-sprite-list', (list): void => {
            this.requireSprites = list
        })
    }

    private get assetDirectory(): string {
        return path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME)
    }

    private setCameraMoving(): void {
        const camera                = this.cameras.main
        const acceleration: number  = 0.05
        const drag: number          = 0.0005
        const maxSpeed: number      = 1

        this.cameraControl = new Phaser.Cameras.Controls.SmoothedKeyControl({
            camera,
            left:       this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right:      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            up:         this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down:       this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            zoomIn:     this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            zoomOut:    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            acceleration,
            drag,
            maxSpeed
        })

        camera.pan(0, 0, 0)
    }

    private setDisposeMode(mode: number, source: PaletteImage|PaletteSprite|null): void {
        this.disposeMode = mode
        this.disposeSource = source
        this.cursor.enable(!!mode)
    }

    private isAnimationPalette(source: PaletteImage|PaletteSprite): boolean {
        return Object.prototype.hasOwnProperty.call(source, 'frameWidth')
    }

    private getIsometricSideFromWidth(size: number): number {
        const rad: number = Phaser.Math.DegToRad(26.57)
        const w: number = size / 2
        const h: number = w / 4
        return Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2))
    }

    private dispose(): void {
        if (!this.disposeMode) {
            return
        }
        if (!this.disposeSource) {
            return
        }
        if (!this.textures.exists(this.disposeSource.key)) {
            return
        }

        const { x, y } = this.cursor.pointer
        let animsKey: string|undefined = undefined
        let width: number
        let height: number

        if (this.isAnimationPalette(this.disposeSource)) {
            const source: PaletteSprite = this.disposeSource as PaletteSprite
            animsKey = source.key
            width = source.frameWidth
            height = source.frameHeight
        }
        else {
            const texture = this.textures.get(this.disposeSource.key)
            if (!texture) {
                return
            }
            width = texture.source[0].width
            height = texture.source[0].height

            if (!width || !height) {
                return
            }
        }

        const side = this.getIsometricSideFromWidth(width)

        switch (this.disposeMode) {
            case 1:
                break
            
            case 2:
                this.isometric.setWalltile(x, y, side, this.disposeSource.key, undefined, animsKey)
                break

            case 3:
                this.isometric.setFloortile(x, y, side, this.disposeSource.key, undefined, animsKey)
                break
        }
    }

    private updateCamera(delta: number): void {
        this.cameraControl?.update(delta)
        
        // 카메라 축소/확대 최대치 설정
        if (this.cameras.main.zoom < 0.25)  this.cameras.main.zoom = 0.25
        if (this.cameras.main.zoom > 1)     this.cameras.main.zoom = 1
    }

    private destroyCamera(): void {
        this.cameraControl?.destroy()
    }

    private generateWatcher(): void {
        this.destroyWatcher()
        this.watcher = new FileWatcher(this.mapFilePath, false).update(this.onMapDataChange.bind(this)).start().emit()
    }

    private generateAnimation(): void {
        for (const anims of this.requireSprites) {
            const { key, frameRate, start, end } = anims
            if (this.anims.exists(key)) {
                continue
            }
            this.anims.create({
                key,
                frameRate,
                frames: this.anims.generateFrameNumbers(key, { start, end }),
                repeat: -1
            })
        }
    }

    private async onMapDataChange(): Promise<void> {
        await this.generateMapData()
    }

    private destroyWatcher(): void {
        this.watcher?.destroy()
        this.watcher = null
    }

    private onMouseLeftDown(e: Phaser.Input.Pointer): void {
    }
    
    private onMouseRightDown(e: Phaser.Input.Pointer): void {
    }

    private onMouseLeftDrag(e: Phaser.Input.Pointer): void {
        this.dispose()
    }

    private async generateMapData(): Promise<boolean> {
        const sceneMapRead: Engine.GameProject.ReadSceneMapSuccess|Engine.GameProject.ReadSceneMapFail = await ipcRenderer.invoke('read-scene-map', this.projectDirectory, this.storageKey)
        if (!sceneMapRead.success) {
            this.transfer.emit('load-map-fail', sceneMapRead.message)
            return false
        }
        this.mapData = sceneMapRead.content
        this.transfer.emit('load-map-success', this.mapData)
        return true
    }

    private attachMouseEvent(): void {
        this.input.on(Phaser.Input.Events.POINTER_DOWN, (e: Phaser.Input.Pointer): void => {
            switch (e.button) {
                case 0:
                    this.onMouseLeftDown(e)
                    break
                case 2:
                    this.onMouseRightDown(e)
                    break
            }
        })

        this.input.on(Phaser.Input.Events.POINTER_MOVE, (e: Phaser.Input.Pointer): void => {
            switch (e.buttons) {
                case 1:
                    this.onMouseLeftDrag(e)
                    break
            }
        })
    }

    private attachTransferEvent(): void {
        // 데이터 송수신 인스턴스 이벤트 할당
        this.transfer
        .on('receive-map-side', (side: number): void => {
            this.isometric.setWorldSize(side)
        })
        .on('receive-dispose-mode', (mode: number, source: PaletteImage|PaletteSprite|null): void => {
            this.setDisposeMode(mode, source)
        })
        .on('receive-cursor-side', (side: number): void => {
            this.cursor.setGridSide(side)
        })
    }

    preload(): void {
        this.load.setBaseURL(this.assetDirectory)
        for (const { key, asset } of this.requireImages) {
            this.load.image(key, asset)
        }
        for (const { key, asset, frameWidth, frameHeight } of this.requireSprites) {
            this.load.spritesheet(key, asset, { frameWidth, frameHeight })
        }
    }

    create(): void {
        this.generateMapData().then((success: boolean): void => {
            if (!success) {
                return
            }

            // 맵 파일 감지 시작
            this.generateWatcher()
            this.generateAnimation()
            
            // 씬 기능 시작
            this.setCameraMoving()
            this.setDisposeMode(0, null)

            // 이벤트 할당
            this.attachMouseEvent()
            this.attachTransferEvent()

            // 플러그인 설정
            this.isometric.setWorldSize(this.mapData.side)
            this.cursor.enableCoordinate(true)
        })
    
        this.events.once(Phaser.Scenes.Events.DESTROY, this.onDestroy.bind(this))
    }

    update(time: number, delta: number): void {
        this.updateCamera(delta)
    }

    private onDestroy(): void {
        this.destroyCamera()
        this.destroyWatcher()
    }
}