<template>
  <section>
    <section
      @click.left="onMouseLeftButtonClick"
      @click.right="onMouseRightButtonClick"
      ref="game-canvas"
      class="game-canvas"
    />

    <v-toolbar
      class="canvas-toolbar ma-5"
      dark
      floating
      dense
    >

      <v-btn v-for="(button, i) in buttons"
        :key="`canvas-toolbar-btn-${i}`"
        icon
      >
        <v-menu
          dark
          offset-y
          open-on-hover
        >
          <template v-slot:activator="menu">
            <v-tooltip top>
              <template v-slot:activator="tooltip">
                <div v-on="menu.on">
                  <div v-on="tooltip.on">
                    <v-btn
                      :color="isSelectedButton(button) ? '#00FF00' : 'white'"
                      icon
                    >
                      <v-icon>{{ button.icon }}</v-icon>
                    </v-btn>
                  </div>
                </div>
              </template>
              <span class="caption">{{ button.description }}</span>
            </v-tooltip>
          </template>
          <v-list
            v-if="button.lists.length"
            dense
            light
          >
            <v-list-item
              v-for="(list, i) in button.lists"
              :key="`canvas-toolbar-btn-list-${i}`"
              class="pa-0"
            >
              <v-btn
                @click="list.click(button)"
                width="100%"
                class="text-sm-caption"
                text
              >
                <div class="text-left">{{ list.text }}</div>
                <v-spacer />
              </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
        
    </v-toolbar>

    <v-toolbar
      class="canvas-toolbar ma-5"
      dark
      floating
      dense
    >

      <v-btn
        :disabled="!selectionType"
        icon
      >
        <v-menu
          dark
          offset-y
          open-on-hover
        >
          <template v-slot:activator="menu">
            <v-tooltip top>
              <template v-slot:activator="tooltip">
                <div v-on="menu.on">
                  <div v-on="tooltip.on">
                    <v-btn icon>
                      <v-icon>mdi-format-paint</v-icon>
                    </v-btn>
                  </div>
                </div>
              </template>
              <span class="caption">칠할 브러쉬를 선택합니다</span>
            </v-tooltip>
          </template>
          <v-list
            dense
            light
          >
            <v-list-item @click="changeBrushType(0)">
              <v-list-item-title>이미지</v-list-item-title>
            </v-list-item>
            <v-list-item @click="changeBrushType(1)">
              <v-list-item-title>스프라이트</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>

      <v-btn v-if="isSaving"
        :loading="isSaving"
        :disabled="isSaving"
        text
      >
        저장 중...
      </v-btn>
        
    </v-toolbar>

    <v-card v-if="isContextmenuOpen"
      max-width="200"
      :style="{
          left: `${contextmenuOffset.x}px`,
          top: `${contextmenuOffset.y}px`
      }"
      dark
      tile
      flat
    >
      <v-list dense>
        <v-list-item
          v-for="(contextmenu, i) in contextmenus"
          :key="`contextmenu-item-${i}`"
          @click="contextmenu.click"
        >
          <v-list-item-content>
            <v-list-item-title>{{ contextmenu.text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>

    <v-dialog v-model="isPropertiesOpen"
      :persistent="isPropertiesOpen"
      max-width="450"
    >
      <v-card>
        <v-card-title>속성</v-card-title>
        <v-card-text>

          <v-subheader>별칭</v-subheader>
          <p class="text-caption">
            별칭을 정합니다. 프로그래밍에서 이용됩니다.
          </p>
          <v-text-field
            v-model="propertyAlias"
            @keydown.stop
            type="text"
            filled
            rounded
            dense
          />
          
          <v-divider />
          <v-subheader>비율</v-subheader>
          <p class="text-caption">
            가로세로비를 유지한 채 크기를 조절합니다.
          </p>
          <v-text-field
            v-model="propertyScale"
            @keydown.stop
            :rules="[ propertyOnlyPositiveNumber ]"
            type="number"
            filled
            rounded
            dense
          />

          <v-divider />
          <v-subheader>센서</v-subheader>
          <p class="text-caption">
            실제로 충돌하지 않지만, 이벤트를 얻어낼 수 있습니다.
            <br>
            이는 지역에 들어오면 작동을 하도록 프로그래밍하는데 사용됩니다.
          </p>
          <v-switch
            v-model="propertyIsSensor"
            label="센서"
            inset
            dense
          />

        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="savePropertiesSetting">완료</v-btn>
          <v-btn text @click="closePropertiesSetting">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isBuilding"
      :persistent="isBuilding"
      max-width="500"
      scrollable
    >
      <v-card :loading="isBuilding && !isBuiltFail">

        <div v-if="!isBuiltFail">
          <v-card-title>씬 파렛트 준비 중</v-card-title>
          <v-card-subtitle>필요한 내용을 준비하는 중입니다. 잠시만 기다려주세요.</v-card-subtitle>
        </div>
        <div v-else>
          <v-card-title class="red--text">씬 파렛트 준비 실패</v-card-title>
          <v-card-subtitle>
            빌드 도중 오류가 발생했습니다.
            <br>
            아래 내용을 기반으로 오류를 수정해주세요.
          </v-card-subtitle>
        </div>

        <v-card-text>
          <channel-component channel="build" />
        </v-card-text>

        <div v-if="isBuilding && isBuiltFail">
          <v-divider />
          <v-card-actions>
            <v-spacer />

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  @click="goBack('씬 준비에 실패했습니다')"
                  v-on="on"
                  icon
                >
                  <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
              </template>
              <span>뒤로가기</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn
                  @click="start"
                  v-on="on"
                  icon
                >
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </template>
              <span>재시도</span>
            </v-tooltip>

            <v-spacer />
          </v-card-actions>
        </div>

      </v-card>
    </v-dialog>

    <v-dialog v-model="isTooltipOpen"
      max-width="800"
    >
      <v-card>
        <v-card-title>기본 사용법</v-card-title>
        <v-card-subtitle>
          씬 파렛트를 이용하여 씬을 GUI 환경에서 디자인할 수 있습니다.
          <br>
          만들어둔 스프라이트나 이미지, 액터 데이터를 사용합니다.
        </v-card-subtitle>
        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>화면 이동</v-list-item-title>
                <v-list-item-subtitle>키보드 W, A, S, D 키를 이용하여 화면을 움직이세요</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>확대/축소</v-list-item-title>
                <v-list-item-subtitle>키보드 Q, R 키를 이용하여 확대/축소할 수 있습니다</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Shift키 사용</v-list-item-title>
                <v-list-item-subtitle>키보드 Shift키를 이용하여 직선으로 설치할 수 있습니다</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>맵의 경계</v-list-item-title>
                <v-list-item-subtitle>
                  <p>
                    씬의 맵 크기에는 한계가 있습니다. 큰 맵은 성능 저하를 유발합니다.
                    <br>
                    일반적으로 1000 ~ 3000이 적당합니다.
                  </p>
                  <p>
                    경계는 파란선으로 보이며, 다이아몬드(◇) 모양으로 되어 있습니다. 이 내부를 꾸미세요.
                  </p>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isMapResizerOpen"
      max-width="500"
    >
      <v-card>
        <v-card-title>맵의 크기를 지정하세요</v-card-title>
        <v-card-subtitle>맵의 한 변의 크기를 지정합니다. 큰 맵은 성능 저하를 유발합니다.</v-card-subtitle>
        <v-card-text>
          <v-text-field
            v-model="map.side"
            type="number"
            filled
            rounded
            suffix="px"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="isAssetMissingOpen"
      fullscreen
      persistent
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card
        tile
        flat
      >
        <v-card-title>씬 파렛트 에셋 누락</v-card-title>
        <v-card-subtitle>{{ missingAssets.length }}개의 에셋 누락 문제를 해결하십시오.</v-card-subtitle>
        <v-card-text>

          <p>
            씬에서 사용된 에셋의 경로가 변경되었거나, 삭제된 것 같습니다.
            <br>
            해당 내용을 기반으로 에셋의 위치를 확인하고 고치십시오.
          </p>

          <v-container>
            <v-row>
              <v-col>
                <v-subheader>에셋의 위치가 변경되었을 경우</v-subheader>
                <p class="text-caption">
                  옵션 중 <strong>추측되는 에셋으로 바꾸기</strong> 기능으로 변경할 수 있습니다.
                  <br>
                  비슷한 이름의 에셋을 찾아주지만, 정확한 것이 아닙니다.
                </p>
              </v-col>

              <v-col>
                <v-subheader>에셋을 삭제했을 경우</v-subheader>
                <p class="text-caption">
                  옵션 중 <strong>씬에서 제거</strong> 기능으로 삭제할 수 있습니다.
                  <br>
                  씬에서 영구적으로 삭제됩니다.
                </p>
              </v-col>

              <v-col>
                <v-subheader>직접 고치기</v-subheader>
                <p class="text-caption">
                  두 옵션 모두 마음에 들지 않을 수 있습니다.
                  <br>
                  목록을 클릭하여 열린 파일의 경로를 직접 수정한 후, 옵션 중 <strong>직접 고쳤으므로 무시하겠습니다</strong> 기능을 선택합니다.
                </p>
              </v-col>
            </v-row>
          </v-container>

          <v-subheader>목록</v-subheader>
          <v-list v-for="missingAsset in missingAssets"
            :key="`preview-scene-missingasset-${missingAsset}`"
          >
            <v-list-item-group>
              <v-list-item two-line>
                <v-list-item-content @click="showSimilarPath(missingAsset, allDatasPath)">
                  <v-list-item-title>{{ missingAsset }}</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">{{ getSimilarPath(missingAsset, allDatasPath) }} 아닌가요?</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action class="flex-row">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        class="text-caption"
                        v-on="on"
                        @click="requestChangeAssetPath(missingAsset, getSimilarPath(missingAsset, allDatasPath))"
                      >
                        <v-icon>mdi-find-replace</v-icon>
                      </v-btn>
                    </template>
                    <span>추측되는 에셋으로 바꾸기</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        class="text-caption"
                        v-on="on"
                        @click="requestDeleteMissingAsset(missingAsset)"
                      >
                        <v-icon>mdi-delete-forever</v-icon>
                      </v-btn>
                    </template>
                    <span>씬에서 제거</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        class="text-caption"
                        v-on="on"
                        @click="deleteMissingAsset(missingAsset)"
                      >
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </template>
                    <span>직접 고쳤으므로 무시하겠습니다</span>
                  </v-tooltip>
                </v-list-item-action>
              </v-list-item>
            </v-list-item-group>
          </v-list>

        </v-card-text>

        <v-divider />

        <v-card-actions class="m-flex justify-center">
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on"
                icon
                :disabled="missingAssets.length > 0"
                @click="saveAndRestart"
              >
                <v-icon>mdi-content-save</v-icon>
              </v-btn>
            </template>
            <span>저장</span>
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on"
                icon
                @click="goBack('사용자가 작업을 취소했습니다')"
              >
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
            </template>
            <span>취소</span>
          </v-tooltip>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <section v-show="isBrushExplorerOpen"
      class="preview-brush-explorerwrapper"
      @click.self="showBrushExplorer(false)"
    >
      <v-card class="preview-brush-explorer"
        tile
        flat
        elevation="1"
      >
        <v-card-title>브러쉬 선택</v-card-title>
        <v-card-subtitle>캔버스에 칠할 브러쉬 이미지를 선택해주십시오</v-card-subtitle>
        <explorer-component v-if="isImageBrushSelected"
          :cwd="imageDataDirectory"
          :openFile="onSelectBrush"
        />
        <explorer-component v-else-if="isAnimationBrushSelected"
          :cwd="animationDataDirectory"
          :openFile="onSelectBrush"
        />
      </v-card>
    </section>
      
  </section>
</template>

<script lang="ts">
import path from 'path'
import fs from 'fs-extra'
import { ipcRenderer } from 'electron'

import glob from 'fast-glob'
import normalize from 'normalize-path'
import Phaser from 'phaser'
import { Vue, Component, Watch } from 'vue-property-decorator'
import NonReactivity from 'vue-nonreactivity-decorator'
import similarity from 'string-similarity'

import PreviewScene from './Phaser/_PreviewScene'
import GuiScene from './Phaser/GuiScene'
import createConfig from './Phaser/createConfig'
import { getStorageKeyFromFilename } from '@/Utils/getStorageKeyFromFilename'

import ExplorerComponent from '@/Renderer/components/FileSystem/Explorer.vue'
import ChannelComponent from '@/Renderer/components/Shell/Channel.vue'
import * as Types from './Phaser/Vars/Types'
import {
  PROJECT_SRC_DIRECTORY_NAME,
  PROJECT_SRC_DATA_DIRECTORY_NAME,
  PROJECT_SRC_DATA_IMAGE_DIRECTORY_NAME,
  PROJECT_SRC_DATA_ANIMATION_DIRECTORY_NAME,
  PROJECT_SRC_DATA_AUDIO_DIRECTORY_NAME
} from '@/Const'


interface ActionList {
  text: string
  click: (button: ActionButton) => void
}

interface ActionButton {
  icon: string
  description: string
  lists: ActionList[]
}

type Rule = (v: string) => string|boolean

@Component({
  components: {
    ExplorerComponent,
    ChannelComponent
  }
})
export default class SceneMapEditor extends Vue {
  @NonReactivity(null) private game!: Phaser.Game|null
  @NonReactivity(null) private scene!: PreviewScene|null

  private isSaving: boolean = false
  private isBuilding: boolean = false
  private isBuiltFail: boolean = false
  private isTooltipOpen: boolean = false
  private isBrushExplorerOpen: boolean = false
  private isMapResizerOpen: boolean = false
  private isContextmenuOpen: boolean = false
  private isPropertiesOpen: boolean = false
  private isAssetMissingOpen: boolean = false
  private isWillBeRestartAfterSave: boolean = false

  private contextmenuOffset: Types.Point2 = { x: 0, y: 0 }
  private propertyAlias: string = ''
  private propertyIsSensor: boolean = false
  private propertyScale: number = 1

  private missingAssets: string[] = []
  private allDatasPath: string[] = []

  private propertyOnlyPositiveNumber: Rule = (v: string) => {
    const n: any = v
    if (isNaN(n)) {
      return '숫자만 입력할 수 있습니다'
    }
    if (Number(n) <= 0) {
      return '0보다 큰 수만 입력할 수 있습니다'
    }
    return true
  }

  private map: Engine.GameProject.SceneMap = { side: 2000, walls: [], floors: [], audios: [] }
  private paletteImages: Types.PaletteImageAsset[]   = []
  private paletteSprites: Types.PaletteSpriteAsset[] = []
  private paletteAudios: Types.PaletteAudioAsset[] = []
  private paletteBrush: Types.PaletteImageAsset|null = null

  private selectionButton: ActionButton|null = null
  private selectionType: number = 0
  private brushType: number = 0
  private disposeBrush: Types.PalettePaintAsset|null = null

  private buttons: ActionButton[] = [
    {
      icon: 'mdi-cogs',
      description: '씬을 설정합니다',
      lists: [
        {
          text: '맵 크기 설정',
          click: (): void => {
            this.openMapResizer()
          }
        },
        {
          text: '저장하기',
          click: (): void => {
            this.requestSave()
          }
        }
      ]
    },
    {
      icon: 'mdi-wall',
      description: '액터가 지나갈 수 없는 벽을 설치합니다',
      lists: [
        {
          text: '벽 편집하기',
          click: (button): void => {
            this.setSelectionButton(button)
            this.setSelectionType(2)
          }
        }
      ]
    },
    {
      icon: 'mdi-floor-plan',
      description: '바닥 타일을 설치합니다',
      lists: [
        {
          text: '바닥 타일 편집하기',
          click: (button): void => {
            this.setSelectionButton(button)
            this.setSelectionType(3)
          }
        }
      ]
    },
    {
      icon: 'mdi-help',
      description: '툴팁을 엽니다',
      lists: [
        {
          text: '기본 사용법',
          click: (): void => {
            this.openTooltip()
          }
        }
      ]
    }
  ]

  private contextmenus: ActionList[] = [
    {
      text: '속성',
      click: (): void => {
        this.closeContextmenu()
        if (!this.isSelectionType(2)) {
          this.$store.dispatch('snackbar', '속성은 벽 타일만 사용할 수 있습니다')
          return
        }
        this.openPropertiesSetting()
      }
    },
    {
      text: '삭제',
      click: (): void => {
        this.closeContextmenu()
        this.requestDeleteSelection()
      }
    }
  ]

  private get filePath(): string {
    return decodeURIComponent(this.$route.params.filePath)
  }

  private get storageKey(): string {
    return getStorageKeyFromFilename(this.filePath)
  }

  private get projectDirectory(): string {
    return this.$store.state.projectDirectory
  }

  private get projectConfig(): Engine.GameProject.Config {
    return this.$store.state.projectConfig
  }

  private get dataDirectory(): string {
    return path.resolve(
      this.projectDirectory,
      PROJECT_SRC_DIRECTORY_NAME,
      PROJECT_SRC_DATA_DIRECTORY_NAME
    )
  }

  private get isImageBrushSelected(): boolean {
    return this.brushType === 0
  }

  private get isAnimationBrushSelected(): boolean {
    return this.brushType === 1
  }

  private get imageDataDirectory(): string {
    return path.resolve(this.dataDirectory, PROJECT_SRC_DATA_IMAGE_DIRECTORY_NAME)
  }

  private get animationDataDirectory(): string {
    return path.resolve(this.dataDirectory, PROJECT_SRC_DATA_ANIMATION_DIRECTORY_NAME)
  }

  private get canvasParent(): HTMLElement {
    return this.$refs['game-canvas'] as HTMLElement
  }

  private get palettes(): (Types.PalettePaintAsset)[] {
    return [
      ...Object.values(this.paletteSprites) as Types.PaletteSpriteAsset[],
      ...Object.values(this.paletteImages) as Types.PaletteImageAsset[],
      ...Object.values(this.paletteAudios) as Types.PaletteAudioAsset[]
    ]
  }

  private goBack(message: string): void {
    this.$store.dispatch('snackbar', message)
    this.$router.replace('/manager/scene').catch(() => null)
  }

  private async createGame(): Promise<void> {
    const [ width, height ] = this.projectConfig.gameDisplaySize

    const previewScene = new PreviewScene(this.projectDirectory, this.storageKey)
    const config = createConfig(width, height, [ previewScene, GuiScene ], this.canvasParent)

    this.game   = new Phaser.Game(config)
    this.scene  = previewScene

    this.scene.transfer.emit('receive-image-list', this.paletteImages)
    this.scene.transfer.emit('receive-sprite-list', this.paletteSprites)

    this.scene.transfer
    .on('load-map-fail', (message: string): void => {
      this.goBack(message)
    })
    .on('load-map-success', (map: Engine.GameProject.SceneMap, missingAssets: string[]): void => {
      this.map.side = map.side

      if (missingAssets.length > 0) {
        this.isAssetMissingOpen = true
        this.missingAssets = missingAssets
      }
    })
    .on('save-map-fail', (message: string): void => {
      this.isSaving = false
      this.$store.dispatch('snackbar', message)
    })
    .on('save-map-success', (): void => {
      this.isSaving = false
      this.$store.dispatch('snackbar', '저장되었습니다!')

      if (this.isWillBeRestartAfterSave) {
        this.restart()
      }
    })

    this.resizeCanvas()
  }

  private destroyGame(): void {
    if (!this.game) {
      return
    }

    const sceneKeys = [ ...this.game.plugins.scenePlugins ]
    for (const sceneKey of sceneKeys) {
      this.game.plugins.removeScenePlugin(sceneKey)
    }

    this.game.destroy(true)
    this.game = null
    this.scene = null
  }

  private showBrushExplorer(visible: boolean): void {
    this.isBrushExplorerOpen = visible
  }

  private openTooltip(): void {
    this.isTooltipOpen = true
  }

  private openMapResizer(): void {
    this.isMapResizerOpen = true
  }

  private openContextmenu(e: MouseEvent): void {
    if (this.disposeBrush) {
      return
    }

    const appbarHeight = 64
    const fixedHeight = 30
    const { offsetX, offsetY } = e

    this.contextmenuOffset.x = offsetX
    this.contextmenuOffset.y = offsetY - (appbarHeight + fixedHeight)
    this.isContextmenuOpen = true
  }

  private closeContextmenu(): void {
    this.isContextmenuOpen = false
  }

  private openPropertiesSetting(): void {
    if (!this.selectionType) {
      return
    }

    if (!this.scene) {
      return
    }
    
    let alias: string
    let scale: number
    let isSensor: boolean

    const size = this.scene.selectionWalls.size
    if (size === 0) {
      this.$store.dispatch('snackbar', '먼저 대상을 선택해주세요')
      return
    }

    else {
      const std = [ ...this.scene.selectionWalls ][0]
      let isOverlap = true

      for (const wall of this.scene.selectionWalls) {
        if (wall.data.get('alias') !== std.data.get('alias')) {
          isOverlap = false
          break
        }
        if (wall.scale !== std.scale) {
          isOverlap = false
          break
        }
        if (wall.isSensor() !== std.isSensor()) {
          isOverlap = false
          break
        }
      }

      // 선택된 모든 오브젝트의 속성이 완벽히 겹칠 경우
      if (isOverlap) {
        alias       = std.data.get('alias') ?? ''
        scale       = std.scale
        isSensor    = std.isSensor()
      }
      // 하나의 오브젝트의 속성이라도 일치하지 않을 경우 기본값 보여주기
      else {
        alias       = ''
        scale       = 1
        isSensor    = false
      }
    }

    this.propertyAlias      = alias
    this.propertyScale      = scale
    this.propertyIsSensor   = isSensor

    this.isPropertiesOpen   = true
  }

  private savePropertiesSetting(): void {
    if (!this.scene) {
      return
    }

    this.scene.transfer.emit('receive-wall-properties', {
      alias: this.propertyAlias,
      scale: this.propertyScale,
      isSensor: this.propertyIsSensor
    })

    this.closePropertiesSetting()
  }

  private closePropertiesSetting(): void {
    this.isPropertiesOpen = false
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

  private onMouseLeftButtonClick(e: MouseEvent): void {
    this.closeContextmenu()
  }

  private onMouseRightButtonClick(e: MouseEvent): void {
    this.openContextmenu(e)
    this.setDisposeBrush(null)
  }

  private requestSave(): void {
    if (!this.scene) {
      return
    }
    if (this.isSaving) {
      return
    }

    this.isSaving = true
    this.scene.transfer.emit('receive-save-request')
  }

  private checkKeyExists(): boolean {
    if (!this.storageKey) {
      this.$router.replace('/manager/scene').catch(() => null)
      return false
    }
    return true
  }

  private isSelectedButton(button: ActionButton): boolean {
    return button === this.selectionButton
  }

  private setSelectionButton(button: ActionButton): void {
    this.selectionButton = button
  }

  private setSelectionType(type: number): void {
    if (!this.scene) {
      return
    }
    this.selectionType = type
    this.scene.transfer.emit('receive-selection-type', type)
  }

  private isSelectionType(...types: number[]): boolean {
    let ret: boolean = false
    for (const type of types) {
      if (type === this.selectionType) {
        return true
      }
    }
    return false
  }

  private setDisposeBrush(brush: Types.PalettePaintAsset|null): void {
    if (!this.scene) {
      return
    }
    this.disposeBrush = brush
    this.scene.transfer.emit('receive-dispose-brush', brush)
  }

  private getBrushKey(key: string): string {
    const cwd = normalize(path.join(PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME))
    return normalize(path.relative(cwd, key))
  }

  private setBrushType(type: number): void {
    this.brushType = type
  }

  private changeBrushType(type: number): void {
    this.setBrushType(type)
    this.showBrushExplorer(true)
  }

  private onSelectBrush(filePath: string): void {
    let brush: Types.PalettePaintAsset|null = null
    for (const palette of this.palettes) {
      const assetPath = path.resolve(this.projectDirectory, palette.key)
      if (normalize(filePath) === normalize(assetPath)) {
        brush = palette
        break
      }
    }

    this.showBrushExplorer(false)
    
    if (brush === null) {
      this.$store.dispatch('snackbar', '해당 에셋은 위치에 존재하지 않습니다.')
      this.setDisposeBrush(null)
      return
    }
    this.setDisposeBrush(brush)
  }

  private setMapSide(side: number): void {
    if (!this.scene) {
      return
    }
    this.scene.transfer.emit('receive-map-side', this.map.side)
  }

  private async showItem(filePath: string): Promise<void> {
    ipcRenderer.invoke('show-item', filePath)
  }

  private showSimilarPath(assetPath: string, allDatasPath: string[]): void {
    const similarPath = this.getSimilarPath(assetPath, allDatasPath)
    const fullPath = path.resolve(this.$store.state.projectDirectory, similarPath)

    this.showItem(fullPath)
  }

  private requestDeleteSelection(): void {
    if (!this.scene) {
      return
    }
    this.scene.transfer.emit('receive-delete-selection')
  }

  private async start(): Promise<void> {
    this.isBuilding = false
    this.isBuiltFail = false

    if (!this.checkKeyExists()) {
      return
    }

    this.isBuilding = true

    const built: Engine.GameProject.GeneratePreviewListSuccess|Engine.GameProject.GeneratePreviewListFail = await ipcRenderer.invoke('build-gen', this.projectDirectory)
    if (!built.success) {
      this.isBuiltFail = true
      return
    }

    try {
      const spriteModulePath = path.resolve(built.path, 'sprite.js')
      const imageModulePath = path.resolve(built.path, 'image.js')
      const audioModulePath = path.resolve(built.path, 'audio.js')

      // 모듈 캐시 삭제
      delete __non_webpack_require__.cache[__non_webpack_require__.resolve(spriteModulePath)]
      delete __non_webpack_require__.cache[__non_webpack_require__.resolve(imageModulePath)]
      delete __non_webpack_require__.cache[__non_webpack_require__.resolve(audioModulePath)]

      const spriteModule = __non_webpack_require__(spriteModulePath)
      const imageModule = __non_webpack_require__(imageModulePath)
      const audioModule = __non_webpack_require__(audioModulePath)

      const checkAssetExists = (rawModuledata: unknown) => {
        const { key } = rawModuledata as Types.PalettePaintAsset
        const filePath = path.resolve(this.$store.state.projectDirectory, key)
        return fs.existsSync(filePath)
      }

      this.paletteSprites = Object.values(spriteModule).filter(checkAssetExists) as Types.PaletteSpriteAsset[]
      this.paletteImages = Object.values(imageModule).filter(checkAssetExists) as Types.PaletteImageAsset[]
      this.paletteAudios = Object.values(audioModule).filter(checkAssetExists) as Types.PaletteAudioAsset[]
    } catch (e) {
      this.isBuiltFail = true
      return
    }

    this.isBuilding = false
    this.isBuiltFail = false

    this.createGame()
    this.openTooltip()
    this.watchResizeWindow()
  }

  private async restart(): Promise<void> {
    const location = this.$route.fullPath
    await this.$router.replace('/manager/engine/home')
    await this.$router.replace(location)
  }

  private saveAndRestart(): void {
    this.isWillBeRestartAfterSave = true
    this.requestSave()
  }

  private async setAllDatasPath(): Promise<void> {
    const root: string = this.$store.state.projectDirectory
    const dataRoot = path.resolve(root, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME)
    const imageDirectory = path.resolve(dataRoot, PROJECT_SRC_DATA_IMAGE_DIRECTORY_NAME)
    const animationDirectory = path.resolve(dataRoot, PROJECT_SRC_DATA_ANIMATION_DIRECTORY_NAME)
    const audioDirectory = path.resolve(dataRoot, PROJECT_SRC_DATA_AUDIO_DIRECTORY_NAME)

    const images = await glob('**/*.ts', { cwd: imageDirectory, onlyFiles: true, absolute: true })
    const animations = await glob('**/*.ts', { cwd: animationDirectory, onlyFiles: true, absolute: true })
    const audios = await glob('**/*.ts', { cwd: audioDirectory, onlyFiles: true, absolute: true })
    const changeToRelative = (assetPath: string): string => {
      return path.relative(root, assetPath)
    }

    this.allDatasPath = [
      ...images.map(changeToRelative),
      ...animations.map(changeToRelative),
      ...audios.map(changeToRelative)
    ]
  }

  private getSimilarPath(main: string, samples: string[]): string {
    return similarity.findBestMatch(main, samples).bestMatch.target
  }

  private requestChangeAssetPath(before: string, after: string): void {
    this.scene?.transfer.emit('receive-change-asset-path', before, after)
    this.deleteMissingAsset(before)
  }

  private requestDeleteMissingAsset(assetPath: string): void {
    // 정말로 이 에셋을 씬에서 제거하시겠습니까? 이 작업은 복구할 수 없습니다.
    this.scene?.transfer.emit('receive-delete-asset', assetPath)
    this.deleteMissingAsset(assetPath)
  }

  private deleteMissingAsset(assetPath: string): void {
    const i = this.missingAssets.indexOf(assetPath)
    if (i !== -1) {
      this.missingAssets.splice(i, 1)
    }
  }

  @Watch('map.side')
  private onChanageMapSceneSide(): void {
    this.setMapSide(this.map.side)
  }

  async mounted(): Promise<void> {
    await this.setAllDatasPath()
    await this.start()
  }

  beforeDestroy(): void {
    this.unwatchResizeWindow()
    this.destroyGame()
  }
}
</script>

<style lang="scss" scoped>
.game-canvas {
  width: 100%;
  height: calc(100vh - 64px);
  position: absolute;
  top: 64px;
  left: 0;
}

.canvas-toolbar {
  background: transparent !important;
  box-shadow: 0 0 0 !important;
}

.preview-brush-explorerwrapper {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  backdrop-filter: blur(5px);
}
.preview-brush-explorer {
  min-width: 500px;
  max-width: 100vh !important;
  height: calc(100vh - 64px);
  position: absolute;
  top: 64px;
  right: 0;
}
</style>