import Phaser from 'phaser'

export class PreviewAudioVisualizer extends Phaser.GameObjects.Text {
  private thresholdRadius: number
  private beat: Phaser.GameObjects.Arc
  private tween: Phaser.Tweens.Tween

  constructor(scene: Phaser.Scene, id: string, x: number, y: number, audio: { key: string, thresholdRadius: number }) {
    super(scene, x, y, ['오디오', audio.key], { color: '#ffd152', strokeThickness: 3, stroke: 'black', align: 'center', fontStyle: 'bold' })

    const { thresholdRadius } = audio
    const { red, green, blue } = Phaser.Display.Color.ValueToColor('#ffd152')
    const color = Phaser.Display.Color.GetColor(red, green, blue)
    
    this.setOrigin(0.5)
    this.setName(id)

    this.thresholdRadius = thresholdRadius

    this.beat = this.scene.add.arc(x, y, 100, undefined, undefined, undefined, 0x00000000)
    this.beat.setStrokeStyle(5, color)

    // 오디오 주변에 circular visualizer 이펙트를 활성화합니다.
    this.tween = this.createTween()

    // 파괴되었을 때 circular visualizer 이펙트와, tween을 삭제합니다.
    this.once(Phaser.GameObjects.Events.DESTROY, (): void => {
      this.destroyBeat()
      this.destroyTween()
    })
  }

  preUpdate() {
    this.followBeat()
  }

  private createTween(): Phaser.Tweens.Tween {
    return this.scene.tweens.addCounter({
      from: 0,
      to: this.thresholdRadius,
      duration: 1500,
      repeat: -1,
      repeatDelay: 1000,
      ease: Phaser.Math.Easing.Circular.Out,
      onUpdate: (tween) => {
        const value = tween.getValue()
        this.beat.setRadius(value)
        this.beat.setAlpha(Phaser.Math.Interpolation.Linear([1, 0], value / this.thresholdRadius))
      }
    })
  }

  private followBeat(): void {
    if (!this.beat) {
      return
    }
    const { x, y } = this
    this.beat.setPosition(x, y)
  }

  private destroyBeat(): void {
    if (!this.beat) {
      return
    }
    this.beat.destroy()
  }

  private destroyTween(): void {
    if (!this.tween) {
      return
    }
    this.tween.remove()
  }

  /**
   * 소리의 한계 범위를 수정함으로써, circular visualizer 이펙트의 범위를 수정합니다.
   * @param radius 소리의 한계 범위의 반지름입니다.
   */
  changeThresholdRadius(radius: number): this {
    this.thresholdRadius = radius

    this.destroyTween()
    this.tween = this.createTween()

    return this
  }
}