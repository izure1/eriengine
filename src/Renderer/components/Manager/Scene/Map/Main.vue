<template>
    <v-card flat tile>
        <section ref="game-canvas"></section>
    </v-card>
</template>

<script lang="ts">
import path from 'path'
import { ipcRenderer } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { getStorageKeyFromFilename } from '@/Utils/getStorageKeyFromFilename'
import NonReactivity from 'vue-nonreactivity-decorator'

import Phaser from 'phaser'
import PreviewScene from './Phaser/PreviewScene'
import createConfig from './Phaser/createConfig'

import Logo from '@/Renderer/assets/logo.png'


@Component
export default class SceneMapEditor extends Vue {
    @NonReactivity(null) private game!: Phaser.Game|null
    private map!: Engine.GameProject.SceneMap

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
            this.$router.replace('/manager/scene')
            return
        }
        const sceneMapRead: Engine.GameProject.ReadSceneMapSuccess|Engine.GameProject.ReadSceneMapFail = await ipcRenderer.invoke('read-scene-map', this.projectDirectory, this.storageKey)
        if (!sceneMapRead.success) {
            this.$store.dispatch('snackbar', sceneMapRead.message)
            this.$router.replace('/manager/scene')
            return
        }

        this.map = sceneMapRead.content
    }

    private async createGame(): Promise<void> {
        const [ width, height ] = this.projectConfig.GAME_DISPLAY_SIZE

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
        this.$router.replace('/manager/scene')
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