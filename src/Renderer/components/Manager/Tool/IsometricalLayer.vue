<template>
  <v-card
    flat
    tile
  >
    <v-card-title>타일 레이어 생성기</v-card-title>
    <v-card-subtitle>아티스트가 타일이나 벽을 그릴 때 필요한 사이즈의 견본 레이어 이미지를 생성해줍니다.</v-card-subtitle>
    <v-card-text>
      <v-container>
        <v-row>
          <v-col>
            <v-stepper v-model="step"
              vertical
              class="elevation-0"
            >

              <v-stepper-step step="1" editable>무엇을 만들고 싶나요?</v-stepper-step>
              <v-stepper-content step="1">
                
                <v-radio-group v-model="type">
                  <v-radio
                    label="바닥"
                    :value="0"
                  />
                  <v-radio
                    label="벽 (왼쪽)"
                    :value="1"
                  />
                  <v-radio
                    label="벽 (오른쪽)"
                    :value="2"
                  />
                  <v-radio
                    label="액터"
                    :value="3"
                  />
                </v-radio-group>
              </v-stepper-content>

              <v-stepper-step step="2" editable>변의 길이가 몇 입니까?</v-stepper-step>
              <v-stepper-content step="2">
                <p>
                  단위는 px이며, 기본 크기는 50입니다.
                </p>
                <v-text-field v-model="side"
                  type="number"
                  rounded
                  filled
                />
              </v-stepper-content>

              <v-stepper-step v-if="isObstacle"
                step="3"
                editable
              >
                벽의 높이는 몇 입니까?
              </v-stepper-step>

              <v-stepper-content step="3">
                <p v-if="isWallLeft || isWallRight">
                  단위는 px이며, 권장 크기는 {{ tileHeight * 2 }}입니다.
                </p>
                <p v-else>
                  단위는 px입니다.
                </p>
                <v-text-field v-model="height"
                  type="number"
                  rounded
                  filled
                />
              </v-stepper-content>
            </v-stepper>
          </v-col>

          <v-col>
            <p>
              빨간 선은 액터가 지나갈 수 없는 영역입니다.
              <br>
              다운로드하면 프로젝트 디렉토리에 파일이 생성됩니다.
            </p>
            <canvas ref="preview-canvas"
              :width="canvasWidth"
              :height="canvasHeight"
            />
            
            <div>
              <v-btn
                text
                @click="download"
              >
                <v-icon left>mdi-download</v-icon>다운로드
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import path from 'path'

import fs from 'fs-extra'
import Phaser from 'phaser'
import { Vue, Component, Watch } from 'vue-property-decorator'

@Component
export default class IsometricalLayerComponent extends Vue {
  private readonly isometricRadian: number = Phaser.Math.DegToRad(26.57)
  private step: number = 1
  private type: number = 0
  private side: number = 50
  private height: number = this.tileHeight * 2

  private get isObstacle(): boolean {
    return this.isWallLeft || this.isWallRight || this.isActor
  }

  private get isWallLeft(): boolean {
    return this.type === 1
  }

  private get isWallRight(): boolean {
    return this.type === 2
  }

  private get isActor(): boolean {
    return this.type === 3
  }

  private get canvas(): HTMLCanvasElement {
    return this.$refs['preview-canvas'] as HTMLCanvasElement
  }

  private get tileWidth(): number {
    return ~~(Math.cos(this.isometricRadian) * this.side)
  }

  private get tileHeight(): number {
    return ~~(Math.sin(this.isometricRadian) * this.side)
  }

  private get canvasWidth(): number {
    return this.tileWidth * 2
  }

  private get canvasHeight(): number {
    if (this.isWallLeft || this.isWallRight) {
      return this.height + this.tileHeight
    }
    else if (this.isActor) {
      return this.height + this.tileHeight * 2
    }
    return this.tileHeight * 2
  }

  private async drawCanvas(): Promise<void> {
    await this.$nextTick()

    const ctx = this.canvas.getContext('2d')
    if (!ctx) {
      return
    }

    const {
      canvasWidth,
      canvasHeight,
      tileHeight
    } = this

    const centerX = canvasWidth / 2

    const left = 0
    const right = canvasWidth
    const top = 0
    const bottom = canvasHeight

    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.beginPath()
    ctx.setLineDash([0])
    
    if (this.isObstacle) {
      ctx.strokeStyle = 'rgb(255, 0, 0)'
    }
    else {
      ctx.strokeStyle = 'rgb(0, 255, 0)'
    }
    ctx.lineWidth = 1
    
    ctx.moveTo(centerX, bottom)

    ctx.lineTo(right, bottom - tileHeight)
    ctx.lineTo(centerX, bottom - tileHeight * 2)
    ctx.lineTo(left, bottom - tileHeight)
    ctx.lineTo(centerX, bottom)

    ctx.stroke()
    ctx.closePath()

    ctx.beginPath()
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = 'rgb(0, 255, 0)'
    ctx.lineWidth = 2

    if (this.isObstacle) {
      ctx.moveTo(centerX, bottom)

      if (this.isWallLeft) {
        ctx.lineTo(centerX, top + tileHeight)
        ctx.lineTo(left, top)
        ctx.lineTo(left, bottom - tileHeight)
      }
      else if (this.isWallRight) {
        ctx.lineTo(centerX, top + tileHeight)
        ctx.lineTo(right, top)
        ctx.lineTo(right, bottom - tileHeight)
      }
      else if (this.isActor) {
        ctx.lineTo(centerX, top + tileHeight * 2)
        ctx.lineTo(left, top + tileHeight)
        ctx.lineTo(left, bottom - tileHeight)

        ctx.moveTo(centerX, top + tileHeight * 2)
        ctx.lineTo(right, top + tileHeight)
        ctx.lineTo(right, bottom - tileHeight)

        ctx.moveTo(left, top + tileHeight)
        ctx.lineTo(centerX, top)
        ctx.lineTo(right, top + tileHeight)
      }
    }

    ctx.stroke()
  }

  private async download(): Promise<void> {
    const raw = this.canvas.toDataURL('image/png', 1)
    const data = raw.split(',').pop()
    const dist = path.resolve(this.$store.state.projectDirectory, `${Date.now()}.png`)

    await fs.writeFile(dist, data, { encoding: 'base64' })
    this.$store.dispatch('snackbar', `'${dist}'에 파일이 생성되었습니다.`)
  }

  @Watch('type')
  private onChangeType() {
    this.drawCanvas()
  }

  @Watch('side')
  private onChangeSide() {
    this.side = Number(this.side)
    if (isNaN(this.side)) {
      this.side = 100
    }
    this.drawCanvas()
  }

  @Watch('height')
  private onChangeHeight() {
    this.height = Number(this.height)
    if (isNaN(this.height)) {
      this.height = 100
    }
    this.drawCanvas()
  }

  private mounted(): void {
    this.drawCanvas()
  }
}
</script>

<style lang="scss" scoped>
canvas {
  border: 1px solid grey;
}
</style>