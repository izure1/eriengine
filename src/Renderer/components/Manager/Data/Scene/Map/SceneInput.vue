<template>
  <div>
    <modal-form-component ref="modal-config" :value="isSceneConfigOpen" />
    <modal-form-component ref="modal-properties" :value="isPropertiesConfigOpen" />
    <modal-form-component ref="modal-spread" :value="isSpreadConfigOpen" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'

import { PreviewScene } from './Phaser/PreviewScene'
import ModalFormComponent, { ModalInputResult } from '@/Renderer/components/Modal/Form.vue'


// 씬의 데이터를 변경하기 전에 this.scene.mapDataManager.saveState 메서드를 호출하여 상태를 저장해야 합니다.
// 이후 사용자가 undo를 하여 해당 위치로 돌아갈 수 있게 하기 위함입니다.

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
    isSpreadConfigOpen: {
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
  protected isSpreadConfigOpen!: boolean
  protected disposeType!: number
  protected scene!: PreviewScene

  private lastSpreadRadius: number = 500
  private lastSpreadRepeat: number = 5

  private component<T extends Vue>(refName: string): T {
    return this.$refs[refName] as T
  }

  private saveConfig(config: ModalInputResult): void {
    const side = config.side as number
    if (isNaN(side)) {
      return
    }
    this.scene.mapDataManager.setSide(side)
  }

  private closeSceneConfig(): void {
    this.$emit('send-data', 'isSceneConfigOpen', false)
  }

  private closePropertiesConfig(): void {
    this.$emit('send-data', 'isPropertiesConfigOpen', false)
  }

  private closeSpreadConfig(): void {
    this.$emit('send-data', 'isSpreadConfigOpen', false)
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
            this.scene.mapDataManager.saveState()

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
                this.scene.mapDataManager.saveState()
                
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
          loop,
          delay
        } = this.getStandardPropertiesValue(
          audios,
          this.scene.defaultAudioData,
          ['thresholdRadius', 'volume', 'loop', 'delay']
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
            },
            {
              key: 'delay',
              type: 'number',
              text: '지연',
              description: '음악이 반복 재생될 때, 지연될 시간을 지정합니다. 이는 주기적으로 들리는 소리를 만들 때 유용합니다.',
              defaultValue: delay
            }
          ]).setButtons([
            {
              text: '완료',
              click: (result) => {
                this.scene.mapDataManager.saveState()

                const { thresholdRadius, volume, loop, delay } = result
                for (const audio of audios) {
                  this.scene.mapDataManager.setAudio({ ...audio, thresholdRadius, volume, loop, delay })
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

  @Watch('isSpreadConfigOpen', { immediate: true })
  private onChangeIsSpreadConfigOpen(): void {
    if (!this.isSpreadConfigOpen) {
      return
    }
  
    this.component<ModalFormComponent>('modal-spread')
      .setTitle('흩뿌리기')
      .setSubtitle('현재 선택한 오브젝트를 씬에 주변에 산개시켜 흩뿌립니다. 이는 풀, 나무 등을 배치하는데 좋습니다.')
      .setInputs([
        {
          key: 'radius',
          type: 'number',
          text: '반지름',
          description: '흩뿌릴 범위의 반지름을 설정합니다. 현재 오브젝트의 좌표를 중심으로 해당 반지름 안에 페인트가 랜덤하게 배치됩니다.',
          defaultValue: this.lastSpreadRadius
        },
        {
          key: 'repeat',
          type: 'number',
          text: '반복',
          description: '선택한 오브젝트를 몇 회 산개할 것인지 지정합니다.',
          defaultValue: this.lastSpreadRepeat
        },
        {
          key: 'grid',
          type: 'boolean',
          text: '격자',
          description: '오브젝트의 크기를 맵의 격자에 맞추어 배치합니다.',
          defaultValue: true
        }
      ])
      .setButtons([
        {
          text: '완료',
          click: (result) => {
            this.scene.mapDataManager.saveState()

            const radius = result.radius as number
            const repeat = result.repeat as number
            const isGrid = result.grid as boolean

            this.lastSpreadRadius = radius
            this.lastSpreadRepeat = repeat

            const getRandomSpotOffset = (center: Point2, radius: number): Point2 => {
              const addX = Phaser.Math.Between(-radius, radius)
              const addY = Phaser.Math.Between(-radius, radius)

              const x = center.x + addX
              const y = center.y + addY
              
              return { x, y }
            }

            const getSpreadedObject = <T extends Engine.GameProject.SceneMapObject>(object: T, radius: number, side: number): T => {
              const { x, y } = getRandomSpotOffset(object, radius)
              const clone = JSON.parse(JSON.stringify(object)) as T
              const point = { x, y }

              if (isGrid) {
                const grid = this.scene.cursor.calcCursorOffset({ x, y }, side)
                point.x = Math.round(grid.x)
                point.y = Math.round(grid.y)
              }

              return {
                ...clone,
                ...point
              }
            }

            for (let i = 0; i < repeat; i++) {
              const { walls, floors, audios } = this.scene.selectedMapObjects

              for (const wall of walls) {
                const side = this.scene.getTextureSideFromKey(wall.key)
                const clone = getSpreadedObject(wall, radius, side)

                this.scene.mapDataManager.setWall(clone)
              }
              for (const floor of floors) {
                const side = this.scene.getTextureSideFromKey(floor.key)
                const clone = getSpreadedObject(floor, radius, side)

                this.scene.mapDataManager.setFloor(clone)
              }
              for (const audio of audios) {
                const side = this.scene.getTextureSideFromKey(audio.key)
                const clone = getSpreadedObject(audio, radius, side)
                
                this.scene.mapDataManager.setAudio(clone)
              }
            }

            this.closeSpreadConfig()
          }
        }
      ])
  }
}
</script>