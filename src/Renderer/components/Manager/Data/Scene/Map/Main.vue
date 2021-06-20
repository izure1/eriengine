<template>
  <section class="scene-palette-wrapper">
    <asset-loader-component ref="asset-loader"
      @send-data="receiveData"
      @send-call="receiveCall"
    />
    <asset-missing-component ref="asset-missing"
      :palette="palette"
      :savedMap="savedMap"
      @send-data="receiveData"
      @send-call="receiveCall"
    />
    <asset-palette-component ref="asset-palette"
      :paletteType="paletteType"
      :palette="palette"
      :isPaintExplorerOpen="isPaintExplorerOpen"
      @send-data="receiveData"
      @send-call="receiveCall"
    />
    <scene-map-io-component ref="scene-map-io"
      @send-data="receiveData"
      @send-call="receiveCall"
    />
    <dispose-panel-component ref="dispose-pannel"
      :disposeType="disposeType"
      :disposeButtons="disposeButtons"
      :palette="palette"
      :paletteType="paletteType"
      :scene="scene"
      @send-data="receiveData"
      @send-call="receiveCall"
    />
    <scene-component ref="scene"
      :scene="scene"
      :selectedPaint="selectedPaint"
      :disposeType="disposeType"
      @send-data="receiveData"
      @send-call="receiveCall"
    />
    <scene-input-component ref="scene-input"
      :isSceneConfigOpen="isSceneConfigOpen"
      :isPropertiesConfigOpen="isPropertiesConfigOpen"
      :isSpreadConfigOpen="isSpreadConfigOpen"
      :disposeType="disposeType"
      :scene="scene"
      @send-data="receiveData"
      @send-call="receiveCall"
    />
  </section>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

import { PreviewScene } from './Phaser/PreviewScene'
import { Palette, PalettePaintAsset } from './Phaser/Vars/Types'

import AssetMissingComponent from './AssetMissing.vue'
import AssetPaletteComponent from './AssetPalette.vue'
import AssetLoaderComponent from './AssetLoader.vue'
import SceneComponent from './Scene.vue'
import SceneMapIoComponent from './SceneMapIO.vue'
import SceneInputComponent from './SceneInput.vue'
import DisposePanelComponent, { DisposeButton } from './DisposePanel.vue'

@Component({
  components: {
    AssetMissingComponent,
    AssetPaletteComponent,
    AssetLoaderComponent,
    SceneComponent,
    SceneMapIoComponent,
    SceneInputComponent,
    DisposePanelComponent
  }
})
export default class ScenePaletteComponent extends Vue {
  protected scene: PreviewScene|null = null
  protected savedMap: Engine.GameProject.SceneMap = { side: 2000, walls: [], floors: [], audios: [] }
  protected missingAssets: string[] = []

  protected disposeType: number = 0
  protected disposeButtons: DisposeButton[] = [
    {
      type: 1,
      icon: 'mdi-wall',
      description: '액터가 지나갈 수 없는 벽을 관리합니다',
      allowPalettes: [1, 2]
    },
    {
      type: 2,
      icon: 'mdi-floor-plan',
      description: '바닥 타일을 관리합니다',
      allowPalettes: [1, 2]
    },
    {
      type: 3,
      icon: 'mdi-volume-high',
      description: '특정 지역에서 들리는 오디오를 관리합니다',
      allowPalettes: [3]
    }
  ]
  /** 씬의 맵에 배치할 오브젝트의 에셋의 파일탐색기를 위해 사용됩니다. */
  protected paletteType: number = 0
  /** 씬에서 사용될 에셋의 종류입니다. 이미지, 스프라이트, 오디오가 있습니다. */
  protected palette: Palette = {
    images: [],   // paletteType = 1
    sprites: [],  // paletteType = 2
    audios: []    // paletteType = 3
  }
  protected isSceneConfigOpen: boolean = false
  protected isPropertiesConfigOpen: boolean = false
  protected isSpreadConfigOpen: boolean = false
  protected isPaintExplorerOpen: boolean = false
  protected selectedPaint: PalettePaintAsset|null = null

  private receiveData(key: keyof this, value: any): void {
    this[key] = value
  }

  private receiveCall(key: keyof this, ...params: any): void {
    const fn = this[key] as unknown
    const isFunction = (fn: any): fn is Function => {
      return fn.call
    }

    if (isFunction(fn)) {
      fn.call(this, ...params)
    }
    else {
      throw new Error('Not function')
    }
  }

  private async reload(): Promise<void> {
    const location = this.$route.fullPath
    await this.$router.replace('/manager/engine/home')
    await this.$router.replace(location)
  }

  private async save(map: Engine.GameProject.SceneMap): Promise<boolean> {
    const isWriteSuccess = await this.component<SceneMapIoComponent>('scene-map-io').write(map)

    if (!isWriteSuccess) {
      this.$store.dispatch('snackbar', '씬 저장에 실패했습니다.')
    }

    this.$store.dispatch('snackbar', '맵 데이터가 저장되었습니다.')

    return isWriteSuccess
  }

  private async saveAndReload(map: Engine.GameProject.SceneMap): Promise<void> {
    const saveSuccess = await this.save(map)
    if (saveSuccess) {
      this.reload()
    }
  }

  private goBack(message: string): void {
    this.$store.dispatch('snackbar', message)
    this.$router.replace('/manager/scene').catch(() => null)
  }

  private component<T extends Vue>(refName: string): T {
    return this.$refs[refName] as T
  }
  
  async mounted(): Promise<void> {
    // 이미지, 스프라이트, 오디오 등, 프로젝트에 추가된 모든 에셋를 불러와 데이터로 만듬
    const palette = await this.component<AssetLoaderComponent>('asset-loader').read()
    if (palette === null) {
      return
    }
    this.palette = palette

    // 해당 씬에서 참조하고 있는 맵데이터 파일을 읽어옴.
    const savedMap = await this.component<SceneMapIoComponent>('scene-map-io').read()
    if (savedMap === null) {
      return
    }
    this.savedMap = savedMap

    await this.$nextTick()
    await this.component<SceneComponent>('scene').create(this.palette, savedMap)
  }
}
</script>

<style lang="scss" scoped>
.scene-palette-wrapper {
  background-color: black;
}
</style>