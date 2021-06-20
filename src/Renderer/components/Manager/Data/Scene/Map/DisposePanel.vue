<template>
  <section>
    <!-- 씬 설정 메뉴 -->
    <v-toolbar
      class="canvas-toolbar ma-5"
      floating
      dark
      dense
    >
      <v-subheader>설정</v-subheader>
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
                    <v-icon>mdi-cogs</v-icon>
                  </v-btn>
                </div>
              </div>
            </template>
            <span class="caption">씬 설정을 합니다</span>
          </v-tooltip>
        </template>

        <v-list
          dense
          light
          min-width="150"
        >
          <v-list-item @click="showConfigModal">
            <v-list-item-title>맵 설정</v-list-item-title>
          </v-list-item>

          <v-divider />

          <v-list-item @click="save">
            <v-list-item-title>저장하기</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>

    <!-- 파렛트 선택 메뉴 -->
    <v-toolbar
      class="canvas-toolbar ma-5"
      floating
      dark
      dense
    >
      <v-subheader>꾸미기</v-subheader>
      <v-tooltip v-for="(button, i) in disposeButtons"
        :key="`canvas-toolbar-btn-${i}`"
        bottom
      >
        <template v-slot:activator="{ on }">
          <v-btn v-on="on"
            icon
            :color="isSelected(button.type) ? '#00FF00' : 'white'"
            @click="setDisposeType(button.type)"
          >
            <v-icon>{{ button.icon }}</v-icon>
          </v-btn>
        </template>
        <span class="text-caption">{{ button.description }}</span>
      </v-tooltip>

    </v-toolbar>

    <!-- 페인트 선택 메뉴 -->
    <v-toolbar
      class="canvas-toolbar ma-5"
      floating
      dark
      dense
    >
      <v-subheader>선택</v-subheader>
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
                  <v-btn icon
                    :disabled="!selectedButton"
                    color="#00FF00"
                  >
                    <v-icon>mdi-format-paint</v-icon>
                  </v-btn>
                </div>
              </div>
            </template>
            <span class="caption">칠할 브러쉬를 선택합니다</span>
          </v-tooltip>
        </template>

        <v-list v-if="selectedButton"
          dense
          light
          min-width="150"
        >
          <v-list-item v-for="(paletteType, i) in selectedButton.allowPalettes"
            :key="`canvas-toolbar-palette-allow-type-${i}`"
            @click="showPaintExplorer(paletteType)"
          >
            <v-list-item-title>{{ getPaletteNameFromType(paletteType) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar>
  </section>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { PreviewScene } from './Phaser/PreviewScene'
import { Palette } from './Phaser/Vars/Types'

export interface DisposeButton {
  type: number
  icon: string
  description: string
  allowPalettes: (1|2|3)[]
}

@Component({
  props: {
    disposeType: {
      type: Number,
      required: true
    },
    disposeButtons: {
      type: Array as () => DisposeButton[],
      required: true
    },
    palette: {
      type: Object as () => Palette,
      required: true
    },
    paletteType: {
      type: Number,
      required: true
    },
    scene: {
      type: Object as () => PreviewScene,
      default: null
    }
  }
})
export default class DisposePanelComponent extends Vue {
  protected disposeType!: number
  protected disposeButtons!: DisposeButton[]
  protected palette!: Palette
  protected paletteType!: number
  protected scene!: PreviewScene|null

  private get paletteTypes(): number[] {
    return [1, 2, 3]
  }

  private get selectedButton(): DisposeButton|null {
    return this.disposeButtons.find((button) => button.type === this.disposeType) ?? null
  }

  private isSelected(type: number): boolean {
    return this.disposeType === type
  }

  private getPaletteNameFromType(type: number): string|null {
    switch (type) {
      case 1:
        return '이미지'
      case 2:
        return '애니메이션'
      case 3:
        return '오디오'
      default:
        return null
    }
  }

  private setDisposeType(type: number): void {
    this.$emit('send-data', 'disposeType', type)
  }

  private setPaletteType(type: number): void {
    this.$emit('send-data', 'paletteType', type)
  }

  private showPaintExplorer(paletteType: number = this.paletteType): void {
    if (!this.paletteTypes.includes(paletteType)) {
      return
    }
    this.setPaletteType(paletteType)
    this.$emit('send-data', 'isPaintExplorerOpen', true)
  }

  private showConfigModal(): void {
    this.$emit('send-data', 'isSceneConfigOpen', true)
  }

  private save(): void {
    if (!this.scene) {
      this.$store.dispatch('snackbar', '씬 정보가 없습니다.')
      return
    }

    this.scene.waitCreated().then(() => {
      const map = this.scene?.mapDataManager.data ?? null
      if (map === null) {
        this.$store.dispatch('snackbar', '씬에서 맵 정보를 읽어올 수 없습니다.')
        return
      }
      this.$emit('send-call', 'save', map)
    })
  }
}
</script>

<style lang="scss" scoped>
.canvas-toolbar {
  background: transparent !important;
  box-shadow: 0 0 0 !important;
  z-index: 1;
}
</style>