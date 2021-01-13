<template>
    <v-card flat tile>
        <section ref="game-canvas"></section>
    </v-card>
</template>

<script lang="ts">
import path from 'path'
import { ipcRenderer } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import Phaser from 'phaser'
import { Plugin as ActorPlugin, Actor } from 'eriengine-core-plugin-actor'
import { Plugin as IsometricScenePlugin } from 'eriengine-core-plugin-isometric-scene'
import { Plugin as IsometricCursorPlugin } from 'eriengine-core-plugin-isometric-cursor'
import { Plugin as FogOfWarPlugin } from 'eriengine-core-plugin-fog-of-war'
import { Plugin as DialoguePlugin } from 'eriengine-core-plugin-dialogue'
import Logo from '@/Renderer/assets/logo.png'

class TestActor extends Actor {
    start(): void {
        this.bubble.of('name').setOffset('top').emotion('ANNOY')
        console.log(1)
    }

    update(): void {
    }

    end(): void {

    }
}

class PreviewScene extends Phaser.Scene {
    private isometric!: IsometricScenePlugin
    private cursor!: IsometricCursorPlugin
    private actor!: ActorPlugin
    private fow!: FogOfWarPlugin
    private dialogue!: DialoguePlugin

    private player: TestActor|null = null

    preload(): void {
        this.load.image('test', Logo)
    }

    create(): void {
        this.player = this.actor.addActor(TestActor, this, 300, 300, 'test')

        this.cursor.enable(true)
        // this.fow.setRevealer(this.player, 0x000000, (object): boolean => {
        //     return object instanceof Actor
        // })
        
        this.dialogue.say(null, 'asdfasdfasdfasdl;kfjas;ldkjf;lkasdjfl;jasl;djf;asdkjlfja;sdjfklaj;sdfkl')
    }
}

@Component
export default class SceneMapEditor extends Vue {
    private map!: Engine.GameProject.SceneMap
    private game: Phaser.Game|null = null

    private get sceneKey(): string {
        return this.$route.params.key || ''
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

    private async getMap(): Promise<Engine.GameProject.SceneMap> {
        const defaultMap: Engine.GameProject.SceneMap = { walls: [], floors: [], actors: [] }
        if (!this.sceneKey) {
            return defaultMap
        }
        const jsonRead: Engine.GameProject.ReadSceneMapSuccess|Engine.GameProject.ReadSceneMapFail = await ipcRenderer.invoke('read-scene-map', this.projectDirectory, this.sceneKey)
        if (!jsonRead.success) {
            this.$store.dispatch('snackbar', jsonRead.message)
            return defaultMap
        }

        return jsonRead.content
    }

    private async createGame(): Promise<void> {
        const [ width, height ] = this.projectConfig.GAME_DISPLAY_SIZE

        this.game = new Phaser.Game({
            type: Phaser.WEBGL,
            width,
            height,
            scene: [ PreviewScene ],
            scale: {
                parent: this.canvasParent,
                fullscreenTarget: this.canvasParent,
                zoom: 1
            },
            dom: {
                createContainer: true
            },
            plugins: {
                global: [
                    {
                        key: 'DialoguePlugin',
                        mapping: 'dialogue',
                        plugin: DialoguePlugin
                    }
                ],
                scene: [
                    {
                        key: 'ActorPlugin',
                        mapping: 'actor',
                        plugin: ActorPlugin
                    },
                    {
                        key: 'IsometricScenePlugin',
                        mapping: 'isometric',
                        plugin: IsometricScenePlugin
                    },
                    {
                        key: 'IsometricCursorPlugin',
                        mapping: 'cursor',
                        plugin: IsometricCursorPlugin,
                    },
                    {
                        key: 'FogOfWarPlugin',
                        mapping: 'fow',
                        plugin: FogOfWarPlugin,
                    }
                ]
            },
            physics: {
                default: 'matter',
                matter: {
                    gravity: {
                        x: 0,
                        y: 0
                    }
                }
            }
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