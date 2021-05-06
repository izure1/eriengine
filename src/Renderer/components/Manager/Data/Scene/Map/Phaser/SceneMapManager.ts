import { Engine } from 'matter'
import Phaser from 'phaser'
import * as Types from './Vars/Types'

export class SceneMapManager implements Engine.GameProject.SceneMap {
  side!: number
  walls!: Engine.GameProject.SceneMapWall[]
  floors!: Engine.GameProject.SceneMapFloor[]

  constructor(sceneMap: Engine.GameProject.SceneMap) {
    this.setData(sceneMap)
  }

  get data(): Engine.GameProject.SceneMap {
    const { side, walls, floors } = this
    return {
      side,
      walls,
      floors
    }
  }

  private getItemKey(x: number, y: number): string {
    return `${x}:${y}`
  }

  setData(sceneMap: Engine.GameProject.SceneMap): this {
    this.side = sceneMap.side
    this.walls = sceneMap.walls
    this.floors = sceneMap.floors
    return this
  }

  private getItem(x: number, y: number, items: Engine.GameProject.SceneMapWall[]|Engine.GameProject.SceneMapFloor[]): Engine.GameProject.SceneMapWall|Engine.GameProject.SceneMapFloor|null {
    const key = this.getItemKey(x, y)
    const item = items.find(({ x, y }): boolean => {
      const itemKey = this.getItemKey(x, y)
      return itemKey === key
    })

    if (!item) {
      return null
    }
    return item
  }

  getWall(x: number, y: number): Engine.GameProject.SceneMapWall|null {
    const wall = this.getItem(x, y, this.walls)
    if (!wall) {
      return null
    }
    return wall as Engine.GameProject.SceneMapWall
  }

  getFloor(x: number, y: number): Engine.GameProject.SceneMapFloor|null {
    const floor = this.getItem(x, y, this.floors)
    if (!floor) {
      return null
    }
    return floor as Engine.GameProject.SceneMapFloor
  }

  private hasWall(x: number, y: number): boolean {
    const key: string = this.getItemKey(x, y)
    const wall: Engine.GameProject.SceneMapWall|undefined = this.walls.find((wall: Engine.GameProject.SceneMapWall): boolean => {
      return key === this.getItemKey(wall.x, wall.y)
    })
    return !!wall
  }

  private createWallData(object: Phaser.Physics.Matter.Sprite): Engine.GameProject.SceneMapWall {
    const { x, y, scale } = object
    const alias = object.data.get('alias') || ''
    const isSensor = object.isSensor()

    return { key: object.texture.key, alias, x, y, scale, isSensor }
  }

  private createFloorData(object: Phaser.GameObjects.Sprite): Engine.GameProject.SceneMapFloor {
    const { x, y } = object
    return { key: object.texture.key, x, y }
  }

  insertWallData(object: Phaser.Physics.Matter.Sprite): this {
    const has = !!this.getWall(object.x, object.y)
    if (has) {
      this.dropWallData(object)
    }
    const data = this.createWallData(object)
    this.walls.push(data)
    return this
  }

  insertFloorData(object: Phaser.GameObjects.Sprite): this {
    const has = !!this.getFloor(object.x, object.y)
    if (has) {
      this.dropFloorData(object)
    }
    const data = this.createFloorData(object)
    this.floors.push(data)
    return this
  }

  modifySide(side: number): this {
    this.side = side
    return this
  }

  modifyWallData(object: Phaser.Physics.Matter.Sprite): this {
    const key = this.getItemKey(object.x, object.y)

    this.walls = this.walls.map((wall: Engine.GameProject.SceneMapWall): Engine.GameProject.SceneMapWall => {
      if (key !== this.getItemKey(wall.x, wall.y)) {
        return wall
      }
      return this.createWallData(object)
    })

    return this
  }

  modifyFloorData(object: Phaser.GameObjects.Sprite): this {
    const key = this.getItemKey(object.x, object.y)

    this.floors = this.floors.map((floor: Engine.GameProject.SceneMapFloor): Engine.GameProject.SceneMapFloor => {
      if (key !== this.getItemKey(floor.x, floor.y)) {
        return floor
      }
      return this.createFloorData(object)
    })

    return this
  }

  dropWallData({ x, y }: Phaser.Physics.Matter.Sprite): this {
    const wall = this.getWall(x, y)
    if (!wall) {
      return this
    }

    const index = this.walls.indexOf(wall)
    this.walls.splice(index, 1)
    return this
  }

  dropFloorData({ x, y }: Phaser.GameObjects.Sprite): this {
    const floor = this.getFloor(x, y)
    if (!floor) {
      return this
    }

    const index = this.floors.indexOf(floor)
    this.floors.splice(index, 1)
    return this
  }
}