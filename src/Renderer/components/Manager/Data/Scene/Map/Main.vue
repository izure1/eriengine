<template>
    <section>
        <section ref="game-canvas" class="game-canvas" />
        <v-toolbar
            class="canvas-toolbar ma-5"
            dark
            floating
            dense
        >

            <v-btn
                v-for="(button, i) in buttons"
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
                                        <v-btn icon>
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
                                @click="list.click"
                                width="100%"
                                text
                            >{{ list.text }}</v-btn>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-btn>
            
        </v-toolbar>
        <v-dialog
            v-model="isTooltipOpen"
            max-width="800"
        >
            <v-card>
                <v-card-title>기본 사용법</v-card-title>
                <v-card-subtitle>
                    씬 에디터를 이용하여 씬을 GUI 환경에서 디자인할 수 있습니다.
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
                                <v-list-item-title>맵의 경계</v-list-item-title>
                                <v-list-item-subtitle>
                                    씬의 맵 크기에는 한계가 있습니다. 큰 맵은 성능 저하를 유발합니다.
                                    <br>
                                    일반적으로 1000 ~ 3000이 적당합니다.
                                    <br>
                                    경계는 파란선으로 보이며, 다이아몬드(◇) 모양으로 되어 있습니다. 이 내부를 꾸미세요.
                                </v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-content>
                                <v-list-item-title>저장</v-list-item-title>
                                <v-list-item-subtitle>
                                    맵은 자동으로 저장됩니다.
                                </v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="isMapResizerOpen"
            max-width="500"
        >
            <v-card>
                <v-card-title>맵의 크기를 지정하세요</v-card-title>
                <v-card-subtitle>맵의 한 변의 크기를 지정합니다. 큰 맵은 성능 저하를 유발합니다.</v-card-subtitle>
                <v-card-text>
                    <v-text-field
                        v-model="mapSceneSide"
                        type="number"
                        filled
                        rounded
                        suffix="px"
                    />
                </v-card-text>
            </v-card>
        </v-dialog>
    </section>
</template>

<script lang="ts">
import Phaser from 'phaser'
import { ipcRenderer } from 'electron'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { getStorageKeyFromFilename } from '@/Utils/getStorageKeyFromFilename'
import NonReactivity from 'vue-nonreactivity-decorator'

import PreviewScene from './Phaser/PreviewScene'
import createConfig from './Phaser/createConfig'


interface ActionList {
    text: string
    click: () => void
}

interface ActionButton {
    icon: string
    description: string
    lists: ActionList[]
}

@Component
export default class SceneMapEditor extends Vue {
    @NonReactivity(null) private game!: Phaser.Game|null
    @NonReactivity(null) private scene!: PreviewScene|null

    private isTooltipOpen: boolean = false
    private isMapResizerOpen: boolean = false

    private mapSceneSide: number = 2000

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
                }
            ]
        },
        {
            icon: 'mdi-human-edit',
            description: '액터를 배치합니다',
            lists: []
        },
        {
            icon: 'mdi-wall',
            description: '액터가 지나갈 수 없는 벽을 설치합니다',
            lists: []
        },
        {
            icon: 'mdi-floor-plan',
            description: '바닥 타일을 설치합니다',
            lists: []
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

    private get canvasParent(): HTMLElement {
        return this.$refs['game-canvas'] as HTMLElement
    }

    private goBack(message: string): void {
        this.$store.dispatch('snackbar', message)
        this.$router.replace('/manager/scene').catch(() => null)
    }

    private async createGame(): Promise<void> {
        const [ width, height ] = this.projectConfig.gameDisplaySize

        const previewScene: PreviewScene = new PreviewScene(this.projectDirectory, this.storageKey, this.filePath)
        const config = createConfig(width, height, [ previewScene ], this.canvasParent)

        this.game   = new Phaser.Game(config)
        this.scene  = previewScene

        this.scene.transfer
        .on('load-map-fail', (message: string): void => {
            this.goBack(message)
        })
        .on('load-map-success', (map: Engine.GameProject.SceneMap): void => {
            this.mapSceneSide = map.side
        })

        this.resizeCanvas()
    }

    private destroyGame(): void {
        if (!this.game) {
            return
        }

        const sceneKeys: string[] = [ ...this.game.plugins.scenePlugins ]
        for (const sceneKey of sceneKeys) {
            this.game.plugins.removeScenePlugin(sceneKey)
        }

        const globalPlugins = [ ...this.game.plugins.plugins ]
        for (const plugin of globalPlugins) {
            this.game.plugins.removeGlobalPlugin(plugin.key)
        }

        this.game.destroy(true)
        this.game = null
        this.scene = null
    }


    private openTooltip(): void {
        this.isTooltipOpen = true
    }

    private openMapResizer(): void {
        this.isMapResizerOpen = true
    }


    private resizeCanvas(): void {
        if (!this.game) {
            return
        }

        const { width, height }     = getComputedStyle(this.canvasParent)
        const clientWidth: number   = parseFloat(width)
        const clientHeight: number  = parseFloat(height)
        
        this.game.scale.setGameSize(clientWidth, clientHeight)
    }

    private watchResizeWindow(): void {
        window.addEventListener('resize', this.resizeCanvas)
    }

    private unwatchResizeWindow(): void {
        window.removeEventListener('resize', this.resizeCanvas)
    }

    private checkKeyExists(): boolean {
        if (!this.storageKey) {
            this.$router.replace('/manager/scene').catch(() => null)
            return false
        }
        return true
    }


    @Watch('mapSceneSide')
    private onChanageMapSceneSide(): void {
        if (!this.scene) {
            return
        }
        this.scene.transfer.emit('set-map-side', this.mapSceneSide)
    }

    mounted(): void {
        if (this.checkKeyExists()) {
            this.createGame()
            this.openTooltip()
            this.watchResizeWindow()
        }
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
</style>