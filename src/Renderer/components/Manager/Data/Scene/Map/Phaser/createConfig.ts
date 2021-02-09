import Phaser from 'phaser'
import { Plugin as ActorPlugin } from '@eriengine/plugin-actor'
import { Plugin as DialoguePlugin } from '@eriengine/plugin-dialogue'
import { Plugin as FogOfWarPlugin } from '@eriengine/plugin-fog-of-war'
import { Plugin as IsometricScenePlugin } from '@eriengine/plugin-isometric-scene'
import { Plugin as IsometricCursorPlugin } from '@eriengine/plugin-isometric-cursor'

export default function(width: number, height: number, scene: Phaser.Scene[], parent: HTMLElement) {

   return {
        type: Phaser.AUTO,
        width,
        height,
        scene,
        scale: {
            parent,
            fullscreenTarget: parent,
            zoom: 1
        },
        dom: {
            createContainer: true
        },
        plugins: {
            global: [
                // {
                //     key: 'DialoguePlugin',
                //     mapping: 'dialogue',
                //     plugin: DialoguePlugin
                // }
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
                debug: true,
                gravity: {
                    x: 0,
                    y: 0
                }
            }
        }
    }

}