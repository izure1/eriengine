<template>
    <section>
        <section ref="game-canvas"></section>
        <v-dialog
            v-model="isTooltipOpen"
            persistent
            max-width="800"
        >
            <v-card>
                <v-card-title>사용법</v-card-title>
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
                    </v-list>
                </v-card-text>
                <v-divider />
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click.stop="isTooltipOpen = false">알겠습니다</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </section>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { getStorageKeyFromFilename } from '@/Utils/getStorageKeyFromFilename'
import NonReactivity from 'vue-nonreactivity-decorator'

import Phaser from 'phaser'
import PreviewScene from './Phaser/PreviewScene'
import createConfig from './Phaser/createConfig'

@Component
export default class SceneMapEditor extends Vue {
    @NonReactivity(null) private game!: Phaser.Game|null
    private map!: Engine.GameProject.SceneMap
    private isTooltipOpen: boolean = true

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

    private async setMap(): Promise<void> {
        if (!this.storageKey) {
            this.$store.dispatch('snackbar', '씬 파일 이름에 스토리지 정보가 없습니다')
            this.$router.replace('/manager/scene').catch(() => null)
            return
        }
        const sceneMapRead: Engine.GameProject.ReadSceneMapSuccess|Engine.GameProject.ReadSceneMapFail = await ipcRenderer.invoke('read-scene-map', this.projectDirectory, this.storageKey)
        if (!sceneMapRead.success) {
            this.$store.dispatch('snackbar', sceneMapRead.message)
            this.$router.replace('/manager/scene').catch(() => null)
            return
        }

        this.map = sceneMapRead.content
    }

    private async createGame(): Promise<void> {
        const [ width, height ] = this.projectConfig.gameDisplaySize

        const config = createConfig(width, height, [ PreviewScene ], this.canvasParent)
        this.game = new Phaser.Game(config)

        await this.setMap()
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

    private checkKey(): void {
        if (this.storageKey) {
            return
        }
        this.$router.replace('/manager/scene').catch(() => null)
    }

    created(): void {
        this.checkKey()
    }

    mounted(): void {
        this.watchResizeWindow()
        this.createGame()
    }

    beforeDestroy(): void {
        this.unwatchResizeWindow()
        this.destroyGame()
    }
}
</script>

<style lang="scss" scoped>
section {
    width: 100%;
    height: 100%;
}
</style>