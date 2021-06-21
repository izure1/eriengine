<template>
  <v-dialog v-model="isNeedShowing"
    persistent
    scrollable
    max-width="500"
  >
    <v-card :loading="isBuilding && !isBuiltFail">

      <div v-if="isBuiltFail">
        <v-card-title class="red--text">씬 파렛트 준비 실패</v-card-title>
        <v-card-subtitle>
          빌드 도중 오류가 발생했습니다.
          <br>
          아래 내용을 기반으로 오류를 수정해주세요.
        </v-card-subtitle>
      </div>
      <div v-else>
        <v-card-title>씬 파렛트 준비 중</v-card-title>
        <v-card-subtitle>필요한 내용을 준비하는 중입니다. 잠시만 기다려주세요.</v-card-subtitle>
      </div>
      

      <v-card-text>
        <channel-component channel="build" />
      </v-card-text>

      <div v-if="isBuiltFail">
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
                @click="reload"
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
</template>

<script lang="ts">
import fs from 'fs-extra'
import path from 'path'

import { ipcRenderer } from 'electron'
import { Vue, Component } from 'vue-property-decorator'

import { Palette, PalettePaintAsset, PaletteImageAsset, PaletteSpriteAsset, PaletteAudioAsset } from './Phaser/Vars/Types'

import ChannelComponent from '@/Renderer/components/Shell/Channel.vue'

@Component({
  components: {
    ChannelComponent
  }
})
export default class AssetLoaderComponent extends Vue {
  private isBuilding: boolean = false
  private isBuiltFail: boolean = false

  private get isNeedShowing(): boolean {
    return this.isBuilding || this.isBuiltFail
  }

  private goBack(message: string): void {
    this.$emit('send-call', 'goBack', message)
  }

  async read(): Promise<Palette|null> {
    this.isBuilding = true
    this.isBuiltFail = false

    const paletteCreate = await this.createPalette()
    if (paletteCreate === null) {
      this.isBuiltFail = true
    }

    this.isBuilding = false
    return paletteCreate
  }

  private async createPalette(): Promise<Palette|null> {
    const built: Engine.GameProject.GeneratePreviewListSuccess|Engine.GameProject.GeneratePreviewListFail = await ipcRenderer.invoke('build-gen', this.$store.state.projectDirectory)
    if (!built.success) {
      console.log(built)
      return null
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
        const { key } = rawModuledata as PalettePaintAsset
        const filePath = path.resolve(this.$store.state.projectDirectory, key)
        return fs.existsSync(filePath)
      }

      const sprites = Object.values(spriteModule).filter(checkAssetExists) as PaletteSpriteAsset[]
      const images = Object.values(imageModule).filter(checkAssetExists) as PaletteImageAsset[]
      const audios = Object.values(audioModule).filter(checkAssetExists) as PaletteAudioAsset[]

      return {
        sprites,
        images,
        audios
      }
    } catch (reason) {
      return null
    }
  }

  private reload(): void {
    this.$emit('send-call', 'reload')
  }
}
</script>