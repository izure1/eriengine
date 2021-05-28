import Phaser from 'phaser'
import { Plugin as IsometricScenePlugin } from '@eriengine/plugin-isometric-scene'
import { PointerPlugin, SelectPlugin } from '@eriengine/plugin-isometric-cursor'

import { PreviewScene } from './PreviewScene'

export class GuiScene extends Phaser.Scene {
  private isometric!: IsometricScenePlugin
  private cursor!: PointerPlugin
  private select!: SelectPlugin
  private pointer: Phaser.GameObjects.Text|null = null
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

  private destroyCursor(): void {
    this.pointer?.destroy()
    this.pointer = null
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
    this.cursor.enable(false)
    this.select.enable(false)
  }

  update(): void {
    this.updateCursor()
  }

  onDestroy(): void {
    this.destroyCursor()
    this.destroyPreview()
  }

}