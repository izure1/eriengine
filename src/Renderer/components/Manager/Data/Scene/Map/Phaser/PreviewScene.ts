import path from 'path'
import Phaser from 'phaser'
import { TypedEmitter } from 'tiny-typed-emitter'
import { ipcRenderer, IpcRendererEvent } from 'electron'
import { Plugin as ActorPlugin, Actor } from '@eriengine/plugin-actor'
import { Plugin as DialoguePlugin } from '@eriengine/plugin-dialogue'
import { Plugin as FogOfWarPlugin } from '@eriengine/plugin-fog-of-war'
import { Plugin as IsometricScenePlugin } from '@eriengine/plugin-isometric-scene'
import { Plugin as IsometricCursorPlugin } from '@eriengine/plugin-isometric-cursor'
import { FileWatcher } from '@/Utils/FileWatcher'


interface DataTransferEvents {
    'load-map-fail':        (message: string) => void
    'load-map-success':     (map: Engine.GameProject.SceneMap) => void
    'set-map-side':         (side: number) => void
}

class DataTransfer extends TypedEmitter<DataTransferEvents> {

}

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
    private isDisposeMode: boolean = false

    constructor(projectDirectory: string, storageKey: string, filePath: string) {
        super({ key: '__preview-scene__', active: true })
        this.projectDirectory = projectDirectory
        this.storageKey = storageKey
        this.mapFilePath = filePath
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

    setDisposeMode(active: boolean = true): void {
        this.isDisposeMode = active
        this.cursor.enable(active)
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

    private async onMapDataChange(): Promise<void> {
        await this.generateMapData()
    }

    private destroyWatcher(): void {
        this.watcher?.destroy()
        this.watcher = null
    }

    private onMouseLeftDown(): void {
        if (this.cursor.isEnabled) {
            const { x, y } = this.cursor.pointer
            this.isometric.setWalltile(x, y, 100, 'logo')
        }
    }
    
    private onMouseRightDown(): void {
        this.setDisposeMode(false)
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

    preload(): void {
    }

    create(): void {
        this.generateMapData().then((success: boolean): void => {
            if (!success) {
                return
            }

            this.setCameraMoving()
            this.setDisposeMode(false)

            this.transfer
            .on('set-map-side', (side: number): void => {
                this.isometric.setWorldSize(side)
            })

            this.isometric.setWorldSize(this.mapData.side)
            this.cursor.enableCoordinate(true)
        })
    
        this.events.once(Phaser.Scenes.Events.DESTROY, this.onDestroy.bind(this))
    }

    update(time: number, delta: number): void {
        this.updateCamera(delta)
        if (this.input.activePointer.leftButtonDown())  this.onMouseLeftDown()
        if (this.input.activePointer.rightButtonDown()) this.onMouseRightDown()
    }

    private onDestroy(): void {
        this.destroyCamera()
        this.destroyWatcher()
    }
}