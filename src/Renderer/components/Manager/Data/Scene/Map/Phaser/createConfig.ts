import Phaser from 'phaser'
import { Plugin as IsometricScenePlugin } from '@eriengine/plugin-isometric-scene'
import { PointerPlugin, SelectPlugin } from '@eriengine/plugin-isometric-cursor'
import { Plugin as OptimizationPlugin } from '@eriengine/plugin-optimization'

export default function(width: number, height: number, scene: (Phaser.Scene|typeof Phaser.Scene)[], parent: HTMLElement): Phaser.Types.Core.GameConfig {

  return {
    type: Phaser.WEBGL,
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
    antialias: false,
    powerPreference: 'high-performance',
    plugins: {
      scene: [
        {
          key: 'IsometricScenePlugin',
          mapping: 'map',
          plugin: IsometricScenePlugin
        },
        {
          key: 'OptimizationPlugin',
          mapping: 'optimization',
          plugin: OptimizationPlugin
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
        }
      ]
    },
    physics: {
      default: 'matter',
      matter: {
        enableSleeping: true,
        debug: true,
        gravity: {
          x: 0,
          y: 0
        }
      }
    }
  }

}