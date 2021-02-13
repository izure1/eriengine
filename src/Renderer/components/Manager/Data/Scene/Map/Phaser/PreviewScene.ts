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

interface Point2 {
    x: number
    y: number
}

interface Rect {
    width: number
    height: number
    a: Point2
    b: Point2
}

interface DataTransferEvents {
    'load-map-fail':            (message: string) => void
    'load-map-success':         (map: Engine.GameProject.SceneMap) => void
    'receive-map-side':         (side: number) => void
    'receive-selection-type':   (type: number) => void
    'receive-dispose-mode':     (activity: boolean) => void
    'receive-dispose-brush':    (brush: PaletteImage|PaletteSprite|null) => void
    'receive-image-list':       (list: PaletteImage[]) => void
    'receive-sprite-list':      (list: PaletteSprite[]) => void
    'receive-open-properties':  () => void
    'receive-delete-selection': () => void
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

    private shiftKey: Phaser.Input.Keyboard.Key|null = null

    private dragStartOffset: Point2 = { x: 0, y: 0 }
    private dragEndOffset: Point2 = { x: 0, y: 0 }
    private selectionType: number = 0
    private selectionRectangle: Phaser.GameObjects.Rectangle|null = null
    private selectionActors: Set<Actor> = new Set
    private selectionWalls: Set<Phaser.Physics.Matter.Sprite> = new Set
    private selectionTiles: Set<Phaser.GameObjects.Sprite> = new Set

    private disposeBrush: PaletteImage|PaletteSprite|null = null

    constructor(projectDirectory: string, storageKey: string, filePath: string) {
        super({ key: '__preview-scene__', active: false })

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

    private get isDisposeEnable(): boolean {
        if (!this.selectionType) {
            return false
        }
        if (!this.disposeBrush) {
            return false
        }
        if (!this.textures.exists(this.disposeBrush.key)) {
            return false
        }
        return true
    }

    private get isAnimationPalette(): boolean {
        if (!this.isDisposeEnable) {
            return false
        }
        return Object.prototype.hasOwnProperty.call(this.disposeBrush, 'frameWidth')
    }

    private get cursorSide(): number {
        if (!this.isDisposeEnable) {
            return 0
        }

        let width: number
        let height: number

        if (this.isAnimationPalette) {
            const brush: PaletteSprite = this.disposeBrush as PaletteSprite
            width   = brush.frameWidth
            height  = brush.frameHeight
        }
        else {
            const texture = this.textures.get(this.disposeBrush!.key)
            if (!texture) {
                return 0
            }
            width = texture.source[0].width
            height = texture.source[0].height

            if (!width || !height) {
                return 0
            }
        }

        return this.getIsometricSideFromWidth(width)
    }

    private get selectionRange(): Rect {
        let width: number
        let height: number
        let a: Point2
        let b: Point2

        if (!this.selectionRectangle) {
            width = 0
            height = 0
            a = { x: 0, y: 0 }
            b = { x: 0, y: 0 }
        }
        else {
            width   = this.selectionRectangle.displayWidth
            height  = this.selectionRectangle.displayHeight
            a       = this.selectionRectangle.getTopLeft()
            b       = this.selectionRectangle.getBottomRight()
        }

        return {
            width,
            height,
            a,
            b
        }
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

    private setSelectionType(type: number): void {
        this.selectionType = type
        this.unselectObjects()
    }

    private setDisposeBrush(brush: PaletteImage|PaletteSprite|null): void {
        this.disposeBrush = brush
    }

    private updateDisposeCursor(): void {
        this.cursor.enable(false)
        if (!this.isDisposeEnable) {
            return
        }
        this.cursor.enable(true)
        this.cursor.setGridSide(this.cursorSide)
    }

    private getDiagonal(width: number, height: number): number {
        return Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))
    }

    private getIsometricSideFromWidth(size: number): number {
        const rad: number = Phaser.Math.DegToRad(26.57)
        const w: number = size / 2
        const h: number = w / 4
        return this.getDiagonal(w, h)
    }

    private generateSelectionRectangle(): void {
        const fillColor: number     = Phaser.Display.Color.GetColor(0, 255, 0)

        this.selectionRectangle = this.add.rectangle(0, 0, 0, 0, fillColor, 0.05)
    }

    private activeSelectionRectangle(activity: boolean): void {
        if (!this.selectionRectangle) {
            return
        }
        if (activity) {
            if (!this.selectionType) {
                return
            }
            if (this.disposeBrush) {
                return
            }
        }
        this.selectionRectangle?.setActive(activity)
        this.selectionRectangle?.setVisible(activity)
    }

    private setSelectionRectanglePosition({ worldX, worldY }: Phaser.Input.Pointer): void {
        if (!this.selectionRectangle) {
            return
        }
        if (!this.selectionType) {
            return
        }
        if (this.disposeBrush) {
            return
        }
        this.selectionRectangle.setPosition(worldX, worldY)
    }

    private updateSelectionRectangleSize(pointer: Phaser.Input.Pointer): void {
        if (!this.selectionRectangle) {
            return
        }
        if (!this.selectionType) {
            return
        }
        if (this.disposeBrush) {
            return
        }
        const distanceX: number = pointer.worldX - this.selectionRectangle.x
        const distanceY: number = pointer.worldY - this.selectionRectangle.y
        const width: number     = Math.abs(distanceX)
        const height: number    = Math.abs(distanceY)

        const originX: number = distanceX > 0 ? 0 : 1
        const originY: number = distanceY > 0 ? 0 : 1

        this.selectionRectangle.setSize(width, height)
        this.selectionRectangle.setOrigin(originX, originY)
    }

    private destroySelectionRectangle(): void {
        if (!this.selectionRectangle) {
            return
        }
        this.selectionRectangle.destroy()
        this.selectionRectangle = null
    }

    private getObjectInRect<T extends Phaser.GameObjects.GameObject&Phaser.GameObjects.Components.Transform>(rect: Rect, objects: T[]): T[] {
        const { width, height, a, b } = rect
        
        const list: T[] = []
        for (const object of objects) {
            const { x, y } = object
            if (
                x > a.x && x < b.x &&
                y > a.y && y < b.y
            ) {
                list.push(object)
            }
        }
        return list
    }

    private unselectObjects(): void {
        for (const actor of this.selectionActors) {
            actor.clearTint()
        }
        for (const wall of this.selectionWalls) {
            wall.clearTint()
        }
        for (const tile of this.selectionTiles) {
            tile.clearTint()
        }

        this.selectionActors.clear()
        this.selectionWalls.clear()
        this.selectionTiles.clear()
    }

    private selectObjects(): void {
        if (!this.selectionType) {
            return
        }
        if (this.disposeBrush) {
            return
        }

        const fillColor: number = Phaser.Display.Color.GetColor32(255, 0, 0, 5)

        switch (this.selectionType) {
            case 1:
                break
            case 2: {
                this.getObjectInRect(this.selectionRange, this.isometric.walls).forEach((wall): void => {
                    wall.setTint(fillColor)
                    this.selectionWalls.add(wall)
                })
                break
            }
            case 3: {
                this.getObjectInRect(this.selectionRange, this.isometric.tiles).forEach((tile): void => {
                    tile.setTint(fillColor)
                    this.selectionTiles.add(tile)
                })
                break
            }
        }
    }

    private deleteSelectionObjects(): void {
        this.selectionActors.forEach((actor): void => {
            actor.destroy()
        })

        this.selectionWalls.forEach((wall): void => {
            wall.destroy()
        })

        this.selectionTiles.forEach((tile): void => {
            tile.destroy()
        })

        this.selectionActors.clear()
        this.selectionWalls.clear()
        this.selectionTiles.clear()
    }

    private dispose(e: Phaser.Input.Pointer): void {
        if (!this.isDisposeEnable) {
            return
        }

        // shift키를 누른 상태로 작업했을 시, 직선으로 계산함
        let x: number
        let y: number
        if (e.event.shiftKey) {
            const startOffset: Point2 = this.cursor.calcCursorOffset(this.dragStartOffset)
            const distanceX: number = e.worldX - startOffset.x
            const distanceY: number = e.worldY - startOffset.y
            
            // 정확히 상하/좌우로 이동하거나, 이동하지 않았을 경우
            if (distanceX === 0 || distanceY === 0) {
                x = this.cursor.pointerX
                y = this.cursor.pointerY
            }
            else {
                let deg: number
                const distance: number  = this.getDiagonal(distanceX, distanceY)

                // ↗
                if (distanceX > 0 && distanceY < 0) {
                    deg = -26.57
                }
                // ↘
                else if (distanceX > 0 && distanceY > 0) {
                    deg = 26.57
                }
                // ↙
                else if (distanceX < 0 && distanceY > 0) {
                    deg = 180 - 26.57
                }
                // ↖
                else {
                    deg = 180 + 26.57
                }

                const rad: number = Phaser.Math.DegToRad(deg)
                const offset: Point2 = this.cursor.calcCursorOffset({
                    x: Math.cos(rad) * distance,
                    y: Math.sin(rad) * distance
                })

                x = startOffset.x + offset.x
                y = startOffset.y + offset.y
            }
        }
        else {
            x = this.cursor.pointerX
            y = this.cursor.pointerY
        }

        let animsKey: string|undefined = undefined

        if (this.isAnimationPalette) {
            const brush: PaletteSprite = this.disposeBrush as PaletteSprite
            animsKey = brush.key
        }

        switch (this.selectionType) {
            case 1:
                break
            
            case 2:
                this.isometric.setWalltile(x, y, this.cursorSide, this.disposeBrush!.key, undefined, animsKey)
                break

            case 3:
                this.isometric.setFloortile(x, y, this.cursorSide, this.disposeBrush!.key, undefined, animsKey)
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

    private updateDragStartOffset({ worldX, worldY }: Phaser.Input.Pointer): void {
        this.dragStartOffset = { x: worldX, y: worldY }
    }

    private updateDragEndOffset({ worldX, worldY }: Phaser.Input.Pointer): void {
        this.dragEndOffset = { x: worldX, y: worldY }
    }

    private onMouseLeftDown(e: Phaser.Input.Pointer): void {
        this.updateDragStartOffset(e)
        this.dispose(e)

        if (!e.event.shiftKey) {
            this.unselectObjects()
        }
        this.setSelectionRectanglePosition(e)
        this.updateSelectionRectangleSize(e)
        this.activeSelectionRectangle(true)
    }

    private onMouseLeftDrag(e: Phaser.Input.Pointer): void {
        this.dispose(e)
        this.updateSelectionRectangleSize(e)
    }

    private onMouseLeftUp(e: Phaser.Input.Pointer): void {
        this.updateDragEndOffset(e)
        this.activeSelectionRectangle(false)
        this.selectObjects()
    }
    
    private onMouseRightDown(e: Phaser.Input.Pointer): void {
    }

    private onMouseRightUp(e: Phaser.Input.Pointer): void {
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

        this.input.on(Phaser.Input.Events.POINTER_UP, (e: Phaser.Input.Pointer): void => {
            switch (e.button) {
                case 0:
                    this.onMouseLeftUp(e)
                    break
                case 2:
                    this.onMouseRightUp(e)
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

    private attachKeyboardEvent(): void {
        if (this.shiftKey) {
            this.shiftKey.destroy()
        }
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
    }

    private attachTransferEvent(): void {
        // 데이터 송수신 인스턴스 이벤트 할당
        this.transfer
        .on('receive-map-side', (side: number): void => {
            this.isometric.setWorldSize(side)
        })
        .on('receive-selection-type', (type: number): void => {
            this.setSelectionType(type)
            this.updateDisposeCursor()
        })
        .on('receive-dispose-brush', (brush: PaletteImage|PaletteSprite|null): void => {
            this.disposeBrush = brush
            this.updateDisposeCursor()
        })
        .on('receive-delete-selection', (): void => {
            this.deleteSelectionObjects()
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

            this.generateSelectionRectangle()

            // 맵 파일 감지 시작
            this.generateWatcher()
            this.generateAnimation()
            
            // 씬 기능 시작
            this.setCameraMoving()
            this.setSelectionType(0)
            this.setDisposeBrush(null)

            // 이벤트 할당
            this.attachMouseEvent()
            this.attachKeyboardEvent()
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
        this.destroySelectionRectangle()
    }
}