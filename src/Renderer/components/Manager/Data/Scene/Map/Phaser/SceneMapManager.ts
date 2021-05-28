import normalize from 'normalize-path'
import { TypedEmitter } from 'tiny-typed-emitter'

interface TypedEvents {
  'change-wall':  (wall: Engine.GameProject.SceneMapWall) => void
  'change-floor': (floor: Engine.GameProject.SceneMapFloor) => void
  'change-audio': (audio: Engine.GameProject.SceneMapAudio) => void
}

export class SceneMapManager extends TypedEmitter<TypedEvents> {
  protected side: number
  protected readonly walls: Map<string, Engine.GameProject.SceneMapWall>
  protected readonly floors: Map<string, Engine.GameProject.SceneMapFloor>
  protected readonly audios: Map<string, Engine.GameProject.SceneMapAudio>

  constructor(mapData: Engine.GameProject.SceneMap) {
    super()
    const { side, walls, floors, audios } = mapData

    this.side = side
    
    this.walls = new Map(
      walls.map((wall) => [this.createKey(wall.x, wall.y), wall])
    )
    this.floors = new Map(
      floors.map((floor) => [this.createKey(floor.x, floor.y), floor])
    )
    this.audios = new Map(
      audios.map((audio) => [this.createKey(audio.x, audio.y), audio])
    )
  }

  get data(): Engine.GameProject.SceneMap {
    const { side, walls, floors, audios } = this

    return {
      side,
      walls: Array.from(walls.values()),
      floors: Array.from(floors.values()),
      audios: Array.from(audios.values())
    }
  }
  
  createKey(x: number, y: number): string {
    return `${x},${y}`
  }

  setSide(side: number): this {
    this.side = side

    return this
  }

  setWall(wall: Engine.GameProject.SceneMapWall): this {
    const { x, y } = wall
    const key = this.createKey(x, y)

    this.walls.set(key, wall)
    this.emit('change-wall', wall)

    return this
  }

  setFloor(floor: Engine.GameProject.SceneMapFloor): this {
    const { x, y } = floor
    const key = this.createKey(x, y)
    
    this.floors.set(key, floor)
    this.emit('change-floor', floor)

    return this
  }

  setAudio(audio: Engine.GameProject.SceneMapAudio): this {
    const { x, y } = audio
    const key = this.createKey(x, y)

    this.audios.set(key, audio)
    this.emit('change-audio', audio)

    return this 
  }

  getSide(): number {
    return this.side
  }

  getWallFromPosition(x: number, y: number): Engine.GameProject.SceneMapWall|null {
    const key = this.createKey(x, y)
    
    return this.walls.get(key) ?? null
  }

  getFloorFromPosition(x: number, y: number): Engine.GameProject.SceneMapFloor|null {
    const key = this.createKey(x, y)

    return this.floors.get(key) ?? null
  }

  getAudioFromPosition(x: number, y: number): Engine.GameProject.SceneMapAudio|null {
    const key = this.createKey(x, y)

    return this.audios.get(key) ?? null
  }

  deleteWallFromPosition(x: number, y: number): boolean {
    const key = this.createKey(x, y)
    
    return this.walls.delete(key)
  }

  deleteFloorFromPosition(x: number, y: number): boolean {
    const key = this.createKey(x, y)
    
    return this.floors.delete(key)
  }

  deleteAudioFromPosition(x: number, y: number): boolean {
    const key = this.createKey(x, y)
    
    return this.audios.delete(key)
  }

  getWallFromPaintKey(paintKey: string): Engine.GameProject.SceneMapWall|null {
    const normalizedPaintKey = normalize(paintKey)
    const walls = Array.from(this.walls.values())

    return walls.find((wall) => normalize(wall.key) === normalizedPaintKey) ?? null
  }

  getFloorFromPaintKey(paintKey: string): Engine.GameProject.SceneMapFloor|null {
    const normalizedPaintKey = normalize(paintKey)
    const floors = Array.from(this.floors.values())

    return floors.find((floor) => normalize(floor.key) === normalizedPaintKey) ?? null
  }

  getAudioFromPaintKey(paintKey: string): Engine.GameProject.SceneMapAudio|null {
    const normalizedPaintKey = normalize(paintKey)
    const audios = Array.from(this.audios.values())

    return audios.find((audio) => normalize(audio.key) === normalizedPaintKey) ?? null
  }
  
  deleteWallFromPaintKey(paintKey: string): boolean {
    const wall = this.getWallFromPaintKey(paintKey)
    
    if (!wall) {
      return false
    }

    if (normalize(wall.key) !== normalize(paintKey)) {
      return false
    }

    return this.deleteWallFromPosition(wall.x, wall.y)
  }

  deleteFloorFromPaintKey(paintKey: string): boolean {
    const floor = this.getFloorFromPaintKey(paintKey)
    
    if (!floor) {
      return false
    }

    if (normalize(floor.key) !== normalize(paintKey)) {
      return false
    }

    return this.deleteFloorFromPosition(floor.x, floor.y)
  }

  deleteAudioFromPaintKey(paintKey: string): boolean {
    const audio = this.getAudioFromPaintKey(paintKey)
    
    if (!audio) {
      return false
    }

    if (normalize(audio.key) !== normalize(paintKey)) {
      return false
    }

    return this.deleteAudioFromPosition(audio.x, audio.y)
  }

  changeWallPaintKey(beforeKey: string, afterKey: string): boolean {
    const wall = this.getWallFromPaintKey(beforeKey)

    if (!wall) {
      return false
    }
    wall.key = afterKey
    return true
  }

  changeFloorPaintKey(beforeKey: string, afterKey: string): boolean {
    const floor = this.getFloorFromPaintKey(beforeKey)

    if (!floor) {
      return false
    }
    floor.key = afterKey
    return true
  }

  changeAudioPaintKey(beforeKey: string, afterKey: string): boolean {
    const audio = this.getAudioFromPaintKey(beforeKey)

    if (!audio) {
      return false
    }
    audio.key = afterKey
    return true
  }
}