import Phaser from 'phaser'
import { Plugin as ActorPlugin, Actor } from '@eriengine/plugin-actor'
import { Plugin as DialoguePlugin } from '@eriengine/plugin-dialogue'
import { Plugin as FogOfWarPlugin } from '@eriengine/plugin-fog-of-war'
import { Plugin as IsometricScenePlugin } from '@eriengine/plugin-isometric-scene'
import { Plugin as IsometricCursorPlugin } from '@eriengine/plugin-isometric-cursor'

import Icon from '@/Renderer/assets/icon.png'


export default class PreviewScene extends Phaser.Scene {
    private isometric!: IsometricScenePlugin
    private cursor!: IsometricCursorPlugin
    private actor!: ActorPlugin
    private fow!: FogOfWarPlugin
    private dialogue!: DialoguePlugin

    private cameraControl: Phaser.Cameras.Controls.SmoothedKeyControl|null = null
    private isDisposeMode: boolean = false

    private onDestroy(): void {
        this.cameraControl?.destroy()
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

    private onMouseLeftDown(): void {
        const { x, y } = this.cursor.pointer
        this.isometric.setWalltile(x, y, 100, 'logo')
        console.log(1)
    }
    
    private onMouseRightDown(): void {
        console.log(2)
    }

    preload(): void {
        this.load.image('logo', Icon)
    }

    create(): void {
        this.setCameraMoving()
        this.setDisposeMode(true)

        this.add.image(0, 0, 'logo')

        this.isometric.setWorldSize(3000)
    
        this.events.once(Phaser.Scenes.Events.DESTROY, this.onDestroy)
    }

    update(time: number, delta: number): void {
        this.updateCamera(delta)
        if (this.input.activePointer.leftButtonDown())  this.onMouseLeftDown()
        if (this.input.activePointer.rightButtonDown()) this.onMouseRightDown()
    }
}