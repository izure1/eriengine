import Phaser from 'phaser'
import { Plugin as ActorPlugin } from '@eriengine/plugin-actor'
import { DialoguePlugin } from '@eriengine/plugin-dialogue'
import { Plugin as FogOfWarPlugin } from '@eriengine/plugin-fog-of-war'
import { Plugin as IsometricScenePlugin } from '@eriengine/plugin-isometric-scene'
import { PointerPlugin, SelectPlugin } from '@eriengine/plugin-isometric-cursor'

export default function(width: number, height: number, scene: (Phaser.Scene|typeof Phaser.Scene)[], parent: HTMLElement): Phaser.Types.Core.GameConfig {

  return {
    type: Phaser.AUTO,
    width,
    height,
    scene: scene as any,
    scale: {
      parent,
      fullscreenTarget: parent,
      zoom: 1
    },
    dom: {
      createContainer: true
    },
    plugins: {
      scene: [
        {
          key: 'ActorPlugin',
          mapping: 'actor',
          plugin: ActorPlugin
        },
        {
          key: 'IsometricScenePlugin',
          mapping: 'map',
          plugin: IsometricScenePlugin
        },
        {
          key: 'PointerPlugin',
          mapping: 'cursor',
          plugin: PointerPlugin
        },
        {
          key: 'SelectPlugin',
          mapping: 'select',
          plugin: SelectPlugin
        },
        {
          key: 'FogOfWarPlugin',
          mapping: 'fow',
          plugin: FogOfWarPlugin
        },
        {
          key: 'DialoguePlugin',
          mapping: 'dialogue',
          plugin: DialoguePlugin
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