<template>
  <v-dialog :value="isPaintExplorerOpen"
    class="preview-paint-explorerwrapper"
    max-width="500"
    @click:outside="showPaintExplorer(false)"
  >
    <v-card class="preview-paint-explorer"
      flat
      tile
      elevation="1"
    >
      <v-card-title>브러쉬 선택</v-card-title>
      <v-card-subtitle>캔버스에 배치할 에셋을 선택해주십시오</v-card-subtitle>
      <explorer-component v-if="isImageMode"
        :cwd="imageDirectory"
        :openFile="selectPaint"
      />
      <explorer-component v-else-if="isAnimationMode"
        :cwd="animsDirectory"
        :openFile="selectPaint"
      />
      <explorer-component v-else-if="isAudioMode"
        :cwd="audioDirectory"
        :openFile="selectPaint"
      />
      <v-card-text v-else>
        <div>선택된 파렛트 타입이 없습니다.</div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import path from 'path'

import { Vue, Component } from 'vue-property-decorator'
import normalize from 'normalize-path'

import { Palette, PalettePaintAsset } from './Phaser/Vars/Types'
import {
  PROJECT_SRC_DIRECTORY_NAME,
  PROJECT_SRC_DATA_DIRECTORY_NAME,
  PROJECT_SRC_DATA_IMAGE_DIRECTORY_NAME,
  PROJECT_SRC_DATA_ANIMATION_DIRECTORY_NAME,
  PROJECT_SRC_DATA_AUDIO_DIRECTORY_NAME
} from '@/Const'

import ExplorerComponent from '@/Renderer/components/FileSystem/Explorer.vue'

@Component({
  components: {
    ExplorerComponent
  },
  props: {
    isPaintExplorerOpen: {
      type: Boolean,
      required: true
    },
    paletteType: {
      type: Number,
      required: true
    },
    palette: {
      type: Object as () => Palette,
      required: true
    }
  }
})
export default class AssetPaletteComponent extends Vue {
  protected isPaintExplorerOpen!: boolean
  protected paletteType!: number
  protected palette!: Palette

  private dataRootDirectory: string = path.resolve(this.$store.state.projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME)
  private imageDirectory: string = path.resolve(this.dataRootDirectory, PROJECT_SRC_DATA_IMAGE_DIRECTORY_NAME)
  private animsDirectory: string = path.resolve(this.dataRootDirectory, PROJECT_SRC_DATA_ANIMATION_DIRECTORY_NAME)
  private audioDirectory: string = path.resolve(this.dataRootDirectory, PROJECT_SRC_DATA_AUDIO_DIRECTORY_NAME)

  private get isImageMode(): boolean {
    return this.paletteType === 1
  }

  private get isAnimationMode(): boolean {
    return this.paletteType === 2
  }

  private get isAudioMode(): boolean {
    return this.paletteType === 3
  }

  private get paints(): PalettePaintAsset[] {
    const { images, sprites, audios } = this.palette
    return [
      ...images,
      ...sprites,
      ...audios
    ]
  }

  private selectPaint(assetPath: string): void {
    const paint: PalettePaintAsset|null = this.paints.find((paint) => {
      const comparePath = path.resolve(this.$store.state.projectDirectory, paint.key)
      return normalize(assetPath) === normalize(comparePath)
    }) ?? null

    this.showPaintExplorer(false)

    if (paint === null) {
      this.$store.dispatch('snackbar', '해당 에셋은 위치에 존재하지 않습니다.')
    }

    this.setPaint(paint)
  }

  private showPaintExplorer(visible: boolean): void {
    this.$emit('send-data', 'isPaintExplorerOpen', visible)
  }

  private setPaint(paint: PalettePaintAsset|null): void {
    this.$emit('send-data', 'selectedPaint', paint)
  }
}
</script>

<style lang="scss" scoped>
// .preview-paint-explorerwrapper {
//   width: 100%;
//   height: 100%;
//   position: fixed;
//   top: 0;
//   left: 0;
//   backdrop-filter: blur(5px);
//   z-index: 2;
// }

// .preview-paint-explorer {
//   width: 500px;
//   height: calc(100vh - 64px);
//   position: absolute;
//   top: 64px;
//   right: 0;
// }
</style>