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

    private getItemKey(x: number, y: number): string {
        return `${x},${y}`
    }

    setData(sceneMap: Engine.GameProject.SceneMap): this {
        this.side = sceneMap.side
        this.walls = sceneMap.walls
        this.floors = sceneMap.floors
        return this
    }

    private getItem(x: number, y: number, items: Engine.GameProject.SceneMapWall[]|Engine.GameProject.SceneMapFloor[]): Engine.GameProject.SceneMapWall|Engine.GameProject.SceneMapFloor|null {
        const key: string = this.getItemKey(x, y)
        const item = items.find(({ x, y }): boolean => {
            const itemKey: string = this.getItemKey(x, y)
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
        const alias: string = '' // TODO
        const isSensor: boolean = object.isSensor()

        return { key: object.texture.key, alias, x, y, scale, isSensor }
    }

    private createFloorData(object: Phaser.GameObjects.Sprite): Engine.GameProject.SceneMapFloor {
        const { x, y } = object
        return { key: object.texture.key, x, y }
    }

    insertWallData(object: Phaser.Physics.Matter.Sprite): this {
        const has: boolean = !!this.getWall(object.x, object.y)
        if (has) {
            this.modifyWallData(object)
            return this
        }
        const data: Engine.GameProject.SceneMapWall = this.createWallData(object)
        this.walls.push(data)
        return this
    }

    insertFloorData(object: Phaser.GameObjects.Sprite): this {
        const has: boolean = !!this.getFloor(object.x, object.y)
        if (has) {
            this.modifyFloorData(object)
            return this
        }
        const data: Engine.GameProject.SceneMapFloor = this.createFloorData(object)
        this.floors.push(data)
        return this
    }

    modifySide(side: number): this {
        this.side = side
        return this
    }

    modifyWallData(object: Phaser.Physics.Matter.Sprite): this {
        const key: string = this.getItemKey(object.x, object.y)

        this.walls = this.walls.map((wall: Engine.GameProject.SceneMapWall): Engine.GameProject.SceneMapWall => {
            if (key !== this.getItemKey(wall.x, wall.y)) {
                return wall
            }
            return this.createWallData(object)
        })

        return this
    }

    modifyFloorData(object: Phaser.GameObjects.Sprite): this {
        const key: string = this.getItemKey(object.x, object.y)

        this.floors = this.floors.map((floor: Engine.GameProject.SceneMapFloor): Engine.GameProject.SceneMapFloor => {
            if (key !== this.getItemKey(floor.x, floor.y)) {
                return floor
            }
            return this.createFloorData(object)
        })

        return this
    }

    dropWallData({ x, y }: Phaser.Physics.Matter.Sprite): this {
        const wall: Engine.GameProject.SceneMapWall|null = this.getWall(x, y)
        if (!wall) {
            return this
        }

        const index: number = this.walls.indexOf(wall)
        this.walls.splice(index, 1)
        return this
    }

    dropFloorData({ x, y }: Phaser.GameObjects.Sprite): this {
        const floor: Engine.GameProject.SceneMapFloor|null = this.getFloor(x, y)
        if (!floor) {
            return this
        }

        const index: number = this.floors.indexOf(floor)
        this.floors.splice(index, 1)
        return this
    }
}