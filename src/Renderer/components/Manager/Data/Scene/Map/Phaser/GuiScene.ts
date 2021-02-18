import Phaser from 'phaser'
import PreviewScene from './PreviewScene'

export default class GuiScene extends Phaser.Scene {
    private cursor: Phaser.GameObjects.Text|null = null
    private preview: PreviewScene|null = null

    constructor() {
        super({ key: '__gui-scene__', active: false })
    }

    private generateCursor(): void {
        if (this.cursor) {
            this.destroyCursor()
        }
        this.cursor = this.add.text(0, 0, '', { fontSize: '12px', color: '#00ff00' })
    }

    private updateCursor(): void {
        if (!this.preview) {
            return
        }
        if (!this.cursor) {
            return
        }

        const preview = this.preview.input.activePointer
        const self = this.input.activePointer
        
        this.cursor.setText(`(${ ~~preview.worldX },${ ~~preview.worldY })`)
        this.cursor.setPosition(self.x + 20, self.y + 20)
    }

    private destroyCursor(): void {
        this.cursor?.destroy()
        this.cursor = null
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
    }

    update(): void {
        this.updateCursor()
    }

    onDestroy(): void {
        this.destroyCursor()
        this.destroyPreview()
    }

}