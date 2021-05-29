<template>
  <div>
    <modal-form-component ref="modal-config" :value="isSceneConfigOpen" />
    <modal-form-component ref="modal-properties" :value="isPropertiesConfigOpen" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'

import { PreviewScene } from './Phaser/PreviewScene'
import ModalFormComponent, { ModalInputResult } from '@/Renderer/components/Modal/Form.vue'

@Component({
  components: {
    ModalFormComponent
  },
  props: {
    isSceneConfigOpen: {
      type: Boolean,
      required: true
    },
    isPropertiesConfigOpen: {
      type: Boolean,
      required: true
    },
    disposeType: {
      type: Number,
      required: true
    },
    scene: {
      type: Object as () => PreviewScene,
      default: null
    }
  }
})
export default class SceneInputComponent extends Vue {
  protected isSceneConfigOpen!: boolean
  protected isPropertiesConfigOpen!: boolean
  protected disposeType!: number
  protected scene!: PreviewScene

  private component<T extends Vue>(refName: string): T {
    return this.$refs[refName] as T
  }

  private saveConfig(config: ModalInputResult): void {
    const side = config.side as number
    if (isNaN(side)) {
      return
    }
    this.scene.setMapSize(side)
  }

  private closeSceneConfig(): void {
    this.$emit('send-data', 'isSceneConfigOpen', false)
  }

  private closePropertiesConfig(): void {
    this.$emit('send-data', 'isPropertiesConfigOpen', false)
  }

  /**
   * 동일한 속성을 가진 객체들 사이에서, 모든 객체의 속성값이 일치하면 일치한 속성값을 반환합니다.
   * 만일 한 오브젝트라도 속성값이 일치하지 않는다면, 기본 속성값을 반환하도록 합니다.
   * 이는 씬 맵에 배치된 오브젝트들의 속성을 한 번에 수정할 때, 사용됩니다.
   * @param propertiesSubjects 동일한 속성을 가진 객체들의 목록입니다.
   * @param defaultProperties 한 오브젝트라도 속성값이 일치하지 않는다면, 이 매개변수를 반환합니다.
   * @param instpects 검사할 속성 목록입니다.
   */
  private getStandardPropertiesValue<T>(propertiesSubjects: T[], defaultProperties: T, inspects: (keyof T)[] = Object.keys(defaultProperties) as (keyof T)[]): T {
    let isOverlap = true
    const standard = propertiesSubjects[0]
    
    for (const prop of inspects) {
      for (const subjects of propertiesSubjects) {
        if (subjects[prop] !== standard[prop]) {
          isOverlap = false
          break
        }
      }
      if (!isOverlap) {
        break
      }
    }

    // 선택된 모든 오브젝트의 속성이 완벽히 겹칠 경우
    if (isOverlap) {
      return standard
    }
    // 하나의 오브젝트의 속성이라도 일치하지 않을 경우 기본값 보여주기
    else {
      return defaultProperties
    }
  }

  @Watch('isSceneConfigOpen', { immediate: true })
  private onChangeIsSceneConfigOpen(): void {
    if (!this.isSceneConfigOpen) {
      return
    }
  
    this.component<ModalFormComponent>('modal-config')
      .setTitle('씬 설정하기')
      .setSubtitle('씬에 대한 상세 내용을 설정합니다')
      .setInputs([
        {
          key: 'side',
          type: 'number',
          text: '맵 크기',
          description: '맵의 한 변의 길이를 지정합니다. 1000 ~ 3000이 적당합니다.',
          defaultValue: this.scene.mapDataManager.getSide()
        }
      ])
      .setButtons([
        {
          text: '완료',
          click: (result) => {
            this.saveConfig(result)
            this.closeSceneConfig()
          }
        }
      ])
  }

  @Watch('isPropertiesConfigOpen', { immediate: true })
  private onChangeIsPropertiesConfigOpen(): void {
    if (!this.isPropertiesConfigOpen) {
      return
    }

    const { walls, audios } = this.scene.selectedMapObjects

    switch (this.disposeType) {
      case 1: {
        const {
          alias,
          scale,
          isSensor
        } = this.getStandardPropertiesValue(
          walls,
          this.scene.defaultWallData,
          ['alias', 'scale', 'isSensor']
        )

        this.component<ModalFormComponent<Engine.GameProject.SceneMapWall>>('modal-properties')
          .setTitle('오브젝트 속성')
          .setSubtitle('선택한 오브젝트의 속성을 수정합니다')
          .setInputs([
            {
              key: 'alias',
              type: 'string',
              text: '별칭',
              description: '별칭을 정합니다. 프로그래밍에서 이용됩니다.',
              defaultValue: alias
            },
            {
              key: 'scale',
              type: 'number',
              text: '비율',
              description: '가로세로비를 유지한 채 크기를 조절합니다.',
              defaultValue: scale
            },
            {
              key: 'isSensor',
              type: 'boolean',
              text: '센서',
              description: '실제로 충돌하지 않지만, 이벤트를 얻어낼 수 있습니다. 이는 지역에 들어오면 작동을 하도록 프로그래밍하는데 사용됩니다.',
              defaultValue: isSensor
            }
          ]).setButtons([
            {
              text: '완료',
              click: (result) => {
                const { alias, scale, isSensor } = result
                for (const wall of walls) {
                  this.scene.mapDataManager.setWall({ ...wall, alias, scale, isSensor })
                }
                this.closePropertiesConfig()
              }
            }
          ])
        break
      }

      case 2: {
        // 바닥 타일은 사용할 수 없음
        this.$store.dispatch('snackbar', '이 타입의 오브젝트는 속성을 관리할 수 없습니다.')
        this.closePropertiesConfig()
        break
      }
      case 3: {
        const {
          thresholdRadius,
          volume,
          loop
        } = this.getStandardPropertiesValue(
          audios,
          this.scene.defaultAudioData,
          ['thresholdRadius', 'volume', 'loop']
        )

        this.component<ModalFormComponent<Engine.GameProject.SceneMapAudio>>('modal-properties')
          .setTitle('오브젝트 속성')
          .setSubtitle('선택한 오브젝트의 속성을 수정합니다')
          .setInputs([
            {
              key: 'thresholdRadius',
              type: 'number',
              text: '한계 거리',
              description: '소리를 들을 수 있는 최대 반지름 거리입니다.',
              defaultValue: thresholdRadius
            },
            {
              key: 'volume',
              type: 'number',
              text: '볼륨',
              description: '볼륨의 크기를 지정합니다. 0 ~ 1의 값을 입력할 수 있습니다.',
              defaultValue: volume
            },
            {
              key: 'loop',
              type: 'boolean',
              text: '반복',
              description: '음악이 반복 재생될지 여부를 지정합니다.',
              defaultValue: loop
            }
          ]).setButtons([
            {
              text: '완료',
              click: (result) => {
                const { thresholdRadius, volume, loop } = result
                for (const audio of audios) {
                  this.scene.mapDataManager.setAudio({ ...audio, thresholdRadius, volume, loop })
                }
                this.closePropertiesConfig()
              }
            }
          ])
        break
      }
      default: {
        // 알 수 없는 타입의 맵 오브젝트
        this.$store.dispatch('snackbar', '알 수 없는 타입의 오브젝트입니다. 다시 선택해주세요.')
        this.closePropertiesConfig()
        break
      }
    }
  }
}
</script>