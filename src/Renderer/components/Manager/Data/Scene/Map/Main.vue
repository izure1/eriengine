<template>
    <section>
        <section
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
        <v-dialog
            v-model="isBuilding"
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
        <v-dialog
            v-model="isCursorResizerOpen"
            max-width="500"
        >
            <v-card>
                <v-card-title>커서 크기를 지정하세요</v-card-title>
                <v-card-subtitle>커서 크기를 지정합니다. 작으면 더 촘촘하게 배치할 수 있습니다.</v-card-subtitle>
                <v-card-text>
                    <v-text-field
                        v-model="mapCursorSide"
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
import path from 'path'
import normalize from 'normalize-path'
import Phaser from 'phaser'
import { ipcRenderer } from 'electron'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { getStorageKeyFromFilename } from '@/Utils/getStorageKeyFromFilename'
import NonReactivity from 'vue-nonreactivity-decorator'

import PreviewScene from './Phaser/PreviewScene'
import createConfig from './Phaser/createConfig'

import ChannelComponent from '@/Renderer/components/Shell/Channel.vue'
import {
    PaletteImage,
    PaletteSprite
} from './Phaser/PreviewScene'
import {
    PROJECT_SRC_DATA_DIRECTORY_NAME,
    PROJECT_SRC_DIRECTORY_NAME
} from '@/Const'


interface ActionList {
    text: string
    click: () => void
}

interface ActionButton {
    icon: string
    description: string
    lists: ActionList[]
}

@Component({
    components: {
        ChannelComponent
    }
})
export default class SceneMapEditor extends Vue {
    @NonReactivity(null) private game!: Phaser.Game|null
    @NonReactivity(null) private scene!: PreviewScene|null

    private isBuilding: boolean = false
    private isBuiltFail: boolean = false
    private isTooltipOpen: boolean = false
    private isMapResizerOpen: boolean = false
    private isCursorResizerOpen: boolean = false

    private paletteImages: PaletteImage[]   = []
    private paletteSprites: PaletteSprite[] = []
    private paletteBrush: PaletteImage|null = null

    private disposeMode: number = 0
    private disposeSource: PaletteImage|PaletteSprite|null = null
    private mapSceneSide: number = 2000
    private mapCursorSide: number = 100

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
                    text: '커서 크기 설정',
                    click: (): void => {
                        this.openCursorResizer()
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

    private get palettes(): (PaletteImage|PaletteSprite)[] {
        return [
            ...Object.values(this.paletteSprites) as PaletteSprite[],
            ...Object.values(this.paletteImages) as PaletteImage[]
        ]
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

        this.scene.transfer.emit('receive-image-list', this.paletteImages)
        this.scene.transfer.emit('receive-sprite-list', this.paletteSprites)

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

    private openCursorResizer(): void {
        this.isCursorResizerOpen = true
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

    private onMouseRightButtonClick(): void {
        this.setDisposeMode(0, null)
    }


    private checkKeyExists(): boolean {
        if (!this.storageKey) {
            this.$router.replace('/manager/scene').catch(() => null)
            return false
        }
        return true
    }

    private setDisposeMode(mode: number, src: PaletteImage|PaletteSprite|null): void {
        if (!this.scene) {
            return
        }
        this.disposeMode = mode
        this.disposeSource = src
        this.scene.transfer.emit('receive-dispose-mode', mode, src)
    }

    private setCursorSide(side: number): void {
        if (!this.scene) {
            return
        }
        this.scene.transfer.emit('receive-cursor-side', side)
    }

    private setMapSide(side: number): void {
        if (!this.scene) {
            return
        }
        this.scene.transfer.emit('receive-map-side', this.mapSceneSide)
    }

    private wait(interval: number): Promise<void> {
        return new Promise((resolve): void => {
            setTimeout(resolve, interval)
        })
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

            const spriteModulePath: string = path.resolve(built.path, 'sprite.js')
            const imageModulePath: string = path.resolve(built.path, 'image.js')

            // 모듈 캐시 삭제
            delete __non_webpack_require__.cache[__non_webpack_require__.resolve(spriteModulePath)]
            delete __non_webpack_require__.cache[__non_webpack_require__.resolve(imageModulePath)]

            const spriteModule  = __non_webpack_require__(spriteModulePath)
            const imageModule   = __non_webpack_require__(imageModulePath)

            this.paletteSprites = Object.values(spriteModule) as PaletteSprite[]
            this.paletteImages  = Object.values(imageModule) as PaletteImage[]

        } catch(e) {
            this.isBuiltFail = true
            return
        }

        this.isBuilding = false
        this.isBuiltFail = false

        this.createGame()
        this.openTooltip()
        this.watchResizeWindow()
    }


    @Watch('mapSceneSide')
    private onChanageMapSceneSide(): void {
        this.setMapSide(this.mapSceneSide)
    }

    @Watch('mapCursorSide')
    private onChangeMapCursorSide(): void {
        this.setCursorSide(this.mapCursorSide)
    }

    @Watch('palettes', { immediate: true })
    private onChangePalettes(): void {
        const walls = this.buttons[2]
        const tiles = this.buttons[3]
        const dataDirPath: string = path.join(PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME)

        const setWallMap = (src: PaletteImage|PaletteSprite) => {
            return {
                text: normalize(path.relative(dataDirPath, src.key)),
                click: (): void => {
                    this.setDisposeMode(2, src)
                }
            }
        }

        const setTileMap = (src: PaletteImage|PaletteSprite) => {
            return {
                text: normalize(path.relative(dataDirPath, src.key)),
                click: (): void => {
                    this.setDisposeMode(3, src)
                }
            }
        }

        walls.lists = this.palettes.map(setWallMap)
        tiles.lists = this.palettes.map(setTileMap)
    }

    mounted(): void {
        this.start()
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