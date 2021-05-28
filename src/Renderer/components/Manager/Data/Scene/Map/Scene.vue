<template>
  <section class="canvas-wrapper">
    <div ref="canvas"
      class="canvas"
      @click.left="onLeftClick"
      @click.right="onRightClick"
    />

    <v-dialog :value="isLoading"
      persistent
    >
      <v-card v-if="isLoading"
        dark
        loading
        width="300"
        class="loading"
      >
        <v-card-title>불러오는 중...</v-card-title>
        <v-card-text>
          씬에서 에셋을 불러오는 중입니다.
          <br>
          잠시만 기다려주세요.
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-card v-if="isContextmenuOpen"
      dark
      width="230"
      class="contextmenu"
      :style="{ left: `${contextmenuX}px`, top: `${contextmenuY}px` }"
      @click="isContextmenuOpen = false"
    >
      <v-list>
        <v-list-item-group>
          <v-list-item>
            <v-list-item-content @click="showSelectedObjectsProperties">속성</v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content @click="deleteSelectedObject">삭제</v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-card>
  </section>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Game } from 'phaser'

import createGameConfig from './Phaser/createConfig'

import { PreviewScene } from './Phaser/PreviewScene'
import { GuiScene } from './Phaser/GuiScene'
import { Palette, PalettePaintAsset } from './Phaser/Vars/Types'

@Component({
  props: {
    scene: {
      type: Object as () => PreviewScene,
      default: null
    },
    selectedPaint: {
      validator: (v) => v === null || Object.prototype.hasOwnProperty.call(v, 'key'),
      default: null
    },
    disposeType: {
      type: Number,
      required: true
    }
  }
})
export default class SceneComponent extends Vue {
  protected scene!: PreviewScene|null
  protected selectedPaint!: PalettePaintAsset|null
  protected disposeType!: number

  private game: Game|null = null

  private mainScene: PreviewScene|null = null
  private guiScene: GuiScene|null = null

  private isLoading: boolean = false
  private isContextmenuOpen: boolean = false
  private contextmenuX: number = 0
  private contextmenuY: number = 0

  private get projectConfig(): Engine.GameProject.Config {
    return this.$store.state.projectConfig
  }

  private get projectDirectory(): string {
    return this.$store.state.projectDirectory
  }

  private get canvasParent(): HTMLCanvasElement {
    return this.$refs['canvas'] as HTMLCanvasElement
  }

  private resizeCanvas(): void {
    if (!this.game) {
      return
    }

    const { width, height } = getComputedStyle(this.canvasParent)
    const clientWidth = parseFloat(width)
    const clientHeight = parseFloat(height)
    
    this.game.scale.setGameSize(clientWidth, clientHeight)
  }

  private watchResizeWindow(): void {
    window.addEventListener('resize', this.resizeCanvas)
  }

  private unwatchResizeWindow(): void {
    window.removeEventListener('resize', this.resizeCanvas)
  }

  create(palette: Palette, savedMap: Engine.GameProject.SceneMap): Game {
    const [ width, height ] = this.projectConfig.gameDisplaySize

    this.mainScene = new PreviewScene(palette, savedMap, this.projectDirectory, { key: 'main', active: true })
    this.guiScene = new GuiScene()

    this.game = new Game(
      createGameConfig(width, height, [this.mainScene, this.guiScene], this.canvasParent)
    )

    this.$emit('send-data', 'scene', this.mainScene)
    this.resizeCanvas()

    // 씬에서 에셋을 불러오는 메세지를 띄웁니다.
    this.isLoading = true
    this.mainScene.waitCreated().then(() => {
      this.isLoading = false

      if (this.guiScene) {
        this.guiScene.init(this.mainScene!)
      }
    })

    return this.game
  }

  private destroyGame(clearCache: boolean = false): void {
    if (!this.game) {
      return
    }

    if (clearCache) {
      const sceneKeys = [ ...this.game.plugins.scenePlugins ]
      for (const sceneKey of sceneKeys) {
        this.game.plugins.removeScenePlugin(sceneKey)
      }
    }

    this.game.destroy(true)

    this.game = null
    this.guiScene = null
    this.mainScene = null
    
    this.$emit('send-data', 'scene', null)
  }

  /** 좌클릭했을 때 호출될 메서드입니다. */
  private onLeftClick(e: MouseEvent): void {
    this.isContextmenuOpen = false
  }

  /** 우클릭했을 때 호출될 메서드입니다. */
  private onRightClick(e: MouseEvent): void {
    // 컨텍스트 메뉴를 엽니다
    this.mainScene?.waitCreated().then(() => {
      if (!this.mainScene) {
        return
      }
      if (this.mainScene.isSelectedMapObject) {
        this.isContextmenuOpen = true
        this.contextmenuX = e.offsetX
        this.contextmenuY = e.offsetY
      }
    })

    // 현재 사용 중인 페인트를 취소하고, 선택 모드로 돌아갑니다.
    this.cancelDisposePaint()
  }

  private cancelDisposePaint(): void {
    this.$emit('send-data', 'selectedPaint', null)
  }

  /** 씬에서 선택한 오브젝트를 삭제합니다. */
  private deleteSelectedObject(): void {
    this.mainScene?.waitCreated().then(() => {
      if (!this.mainScene) {
        return
      }
      const { walls, floors, audios } = this.mainScene.selectedMapObjects
      for (const wall of walls) {
        this.mainScene.deleteWall(wall)
      }
      for (const floor of floors) {
        this.mainScene.deleteFloor(floor)
      }
      for (const audio of audios) {
        this.mainScene.deleteAudio(audio)
      }
    })
  }

  /** 씬에서 선택한 오브젝트의 속성 수정창을 엽니다. */
  private showSelectedObjectsProperties(): void {
    this.$emit('send-data', 'isPropertiesConfigOpen', true)
  }

  @Watch('selectedPaint')
  private onChangeSelectedPaint(): void {
    this.mainScene?.waitCreated().then(() => {
      this.mainScene?.setDisposePaint(this.selectedPaint)
    })
  }

  @Watch('disposeType')
  private onChangeDisposeType(): void {
    // 현재 선택한 페인트를 취소하고, 선택 모드로 돌아갑니다.
    this.cancelDisposePaint()

    this.mainScene?.waitCreated().then(() => {
      this.mainScene?.setDisposeType(this.disposeType)
    })
  }

  mounted(): void {
    this.watchResizeWindow()
  }

  beforeDestroy(): void {
    // 게임과 게임의 캐시를 전부 삭제합니다.
    this.destroyGame(true)
    // 씬 캔버스 리사이즈 이벤트를 해제합니다.
    this.unwatchResizeWindow()
  }
}
</script>

<style lang="scss" scoped>
.canvas-wrapper {
  width: 100%;
  height: calc(100vh - 64px);
  position: absolute;
  top: 64px;
  left: 0;
}

.canvas {
  width: 100%;
  height: 100%;
}

.loading {
  position: absolute;
  bottom: 50px;
  left: 100px;
}

.contextmenu {
  position: absolute;
}
</style>