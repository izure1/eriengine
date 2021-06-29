import Phaser from 'phaser'
import { Plugin as IsometricScenePlugin } from '@eriengine/plugin-isometric-scene'
import { PointerPlugin, SelectPlugin } from '@eriengine/plugin-isometric-cursor'

import { PreviewScene } from './PreviewScene'

export class GuiScene extends Phaser.Scene {
  private isometric!: IsometricScenePlugin
  private cursor!: PointerPlugin
  private select!: SelectPlugin
  private pointer: Phaser.GameObjects.Text|null = null
  private fps: Phaser.GameObjects.Text|null = null
  private preview: PreviewScene|null = null

  constructor() {
    super({ key: '__gui-scene__', active: true })
  }

  private generateCursor(): void {
    if (this.pointer) {
      this.destroyCursor()
    }
    this.pointer = this.add.text(0, 0, '', { fontSize: '12px', color: '#00ff00' })
  }

  private generateFps(): void {
    if (this.fps) {
      this.destroyFps()
    }
    this.fps = this.add.text(0, 0, '', { fontSize: '15px', color: 'white', strokeThickness: 2, stroke: 'black', align: 'right' })
    this.fps.setOrigin(1)
  }

  private updateCursor(): void {
    if (!this.preview || !this.preview.input) {
      return
    }
    if (!this.pointer) {
      return
    }

    const preview = this.preview.input.activePointer
    const self = this.input.activePointer
    
    this.pointer.setText(`(${ ~~preview.worldX },${ ~~preview.worldY })`)
    this.pointer.setPosition(self.x + 20, self.y + 20)
  }

  private updateFps(): void {
    if (!this.fps) {
      return
    }

    const { width, height } = this.renderer
    const margin = 20
    this.fps.setText(`fps: ${~~this.game.loop.actualFps}`)
    this.fps.setPosition(width - margin, height - margin)
  }

  private destroyCursor(): void {
    this.pointer?.destroy()
    this.pointer = null
  }

  private destroyFps(): void {
    this.fps?.destroy()
    this.fps = null
  }

  private destroyPreview(): void {
    this.preview = null
  }

  init(preview: PreviewScene): void {
    this.events.on(Phaser.Core.Events.DESTROY, this.onDestroy.bind(this))
    this.preview = preview
  }
  
  create(): void {
    this.generateCursor()
    this.generateFps()
    this.cursor.enable(false)
    this.select.enable(false)
  }

  update(): void {
    this.updateCursor()
    this.updateFps()
  }

  onDestroy(): void {
    this.destroyCursor()
    this.destroyFps()
    this.destroyPreview()
  }

}