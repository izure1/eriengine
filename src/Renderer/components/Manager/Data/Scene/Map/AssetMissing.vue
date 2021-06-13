<template>
  <v-dialog :value="isAssetMissingOpen"
    fullscreen
    persistent
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card
      flat
      tile
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
              <v-list-item-content @click="showSimilarPath(missingAsset)">
                <v-list-item-title>{{ missingAsset }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ getSimilarPath(missingAsset, allAssetKeys) }} 아닌가요?</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action class="flex-row">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn
                      icon
                      class="text-caption"
                      v-on="on"
                      @click="changeAssetPath(missingAsset, getSimilarPath(missingAsset, allAssetKeys))"
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
                      @click="deleteMissingAsset(missingAsset)"
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
                      @click="passMissingAsset(missingAsset)"
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
</template>

<script lang="ts">
import path from 'path'

import { ipcRenderer } from 'electron'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { findBestMatch } from 'string-similarity'
import normalize from 'normalize-path'

import { Palette, PalettePaintAsset } from './Phaser/Vars/Types'
import { SceneMapManager } from './Phaser/SceneMapManager'

@Component({
  props: {
    palette: {
      type: Object as () => Palette,
      required: true
    },
    savedMap: {
      type: Object as () => Engine.GameProject.SceneMap,
      required: true
    }
  }
})
export default class AssetMissingComponent extends Vue {
  protected palette!: Palette
  protected savedMap!: Engine.GameProject.SceneMap

  private passAssets: string[] = []

  private get paints(): PalettePaintAsset[] {
    const { images, sprites, audios } = this.palette
    return [
      ...images,
      ...sprites,
      ...audios
    ]
  }

  private get usedPaintKeys(): string[] {
    const { floors, walls, audios } = this.savedMap

    const floorAssets = floors.map((floor) => floor.key)
    const wallAssets = walls.map((wall) => wall.key)
    const audioAssets = audios.map((audio) => audio.key)

    return [
      ...floorAssets,
      ...wallAssets,
      ...audioAssets
    ]
  }

  private get allAssetKeys(): string[] {
    return this.paints.map((paint) => paint.key)
  }
  
  private get missingAssets(): string[] {
    const normalizedAllAssetKeys = this.allAssetKeys.map((assetKey) => normalize(assetKey))

    return this.usedPaintKeys.filter((usedPaintKey) => {
      const normalizedUsedPaintKey = normalize(usedPaintKey)
      const isPassedAsset = this.passAssets.includes(normalizedUsedPaintKey)
      return !isPassedAsset && !normalizedAllAssetKeys.includes(normalizedUsedPaintKey)
    })
  }

  private get isAssetMissingOpen(): boolean {
    return this.missingAssets.length > 0
  }

  private goBack(message: string): void {
    this.$emit('send-call', 'goBack', message)
  }

  private async showItem(filePath: string): Promise<void> {
    ipcRenderer.invoke('show-item', filePath)
  }

  private showSimilarPath(assetPath: string): void {
    const similarPath = this.getSimilarPath(assetPath, this.allAssetKeys)
    
    const fullPath = path.resolve(this.$store.state.projectDirectory, similarPath)
    const normalizeFullPath = normalize(fullPath)

    this.showItem(normalizeFullPath)
  }

  private getSimilarPath(main: string, samples: string[]): string {
    return findBestMatch(main, samples).bestMatch.target
  }

  private changeAssetPath(before: string, after: string): void {
    const map = new SceneMapManager(this.savedMap)

    map.changeWallsPaintKey(before, after)
    map.changeFloorsPaintKey(before, after)
    map.changeAudiosPaintKey(before, after)

    this.$emit('send-data', 'savedMap', map.data)
  }

  private deleteMissingAsset(assetPath: string): void {
    const map = new SceneMapManager(this.savedMap)

    map.deleteWallsFromPaintKey(assetPath)
    map.deleteFloorsFromPaintKey(assetPath)
    map.deleteAudiosFromPaintKey(assetPath)
    
    this.$emit('send-data', 'savedMap', map.data)
  }
  
  private passMissingAsset(assetPath: string): void {
    const normalizedAssetPath = normalize(assetPath)
    this.passAssets.push(normalizedAssetPath)
  }

  private saveAndReload(): void {
    this.$emit('send-call', 'saveAndReload', this.savedMap)
  }

  @Watch('missingAssets')
  private onChangeMissingAssets(after: string[], before: string[]): void {
    if (after.length !== before.length) {
      if (after.length === 0) {
        this.saveAndReload()
      }
    }
  }
}
</script>