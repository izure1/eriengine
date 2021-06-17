import normalize from 'normalize-path'
import { TypedEmitter } from 'tiny-typed-emitter'

interface TypedEvents {
  'set-side': (_side: number) => void
  'set-wall':  (_wall: Engine.GameProject.SceneMapWall) => void
  'set-floor': (_floor: Engine.GameProject.SceneMapFloor) => void
  'set-audio': (_audio: Engine.GameProject.SceneMapAudio) => void
  'delete-wall': (_wall: Engine.GameProject.SceneMapWall) => void
  'delete-floor': (_floor: Engine.GameProject.SceneMapFloor) => void
  'delete-audio': (_audio: Engine.GameProject.SceneMapAudio) => void
}

export class SceneMapManager extends TypedEmitter<TypedEvents> {
  protected side: number = 0
  protected readonly walls: Map<string, Engine.GameProject.SceneMapWall> = new Map
  protected readonly floors: Map<string, Engine.GameProject.SceneMapFloor> = new Map
  protected readonly audios: Map<string, Engine.GameProject.SceneMapAudio> = new Map
  
  protected cacheStates: Engine.GameProject.SceneMap[] = []

  constructor(mapData: Engine.GameProject.SceneMap) {
    super()
    
    this.setDataState(mapData)
    this.saveState()
  }

  /**
   * 맵 데이터를 반환합니다.
   * 이 데이터는 깊은 복사가 이루어진 데이터이므로, 직접 수정하여도 영향을 미치지 않습니다.
   */
  get data(): Engine.GameProject.SceneMap {
    const { side, walls, floors, audios } = this

    return this.copy<Engine.GameProject.SceneMap>({
      side,
      walls: Array.from(walls.values()),
      floors: Array.from(floors.values()),
      audios: Array.from(audios.values())
    })
  }

  private copy<T>(data: T): T {
    return JSON.parse(JSON.stringify(data))
  }

  /**
   * 데이터를 기반으로 인스턴스를 초기화합니다.
   * @param data 초기화하고자 하는 데이터입니다.
   */
   protected setDataState(data: Engine.GameProject.SceneMap): void {
    const { side, walls, floors, audios } = data

    this.side = side

    for (const wall of walls) {
      this.walls.set(this.createKey(wall.x, wall.y), wall)
    }

    for (const floor of floors) {
      this.floors.set(this.createKey(floor.x, floor.y), floor)
    }

    for (const audio of audios) {
      this.audios.set(this.createKey(audio.x, audio.y), audio)
    }
  }
  
  /**
   * 좌표를 기준으로 맵 데이터의 키를 생성하여 반환합니다.
   * @param x x좌표입니다.
   * @param y y좌표입니다.
   * @returns 생성한 맵데이터의 키입니다. `${x},${y}` 의 문자열입니다.
   */
  createKey(x: number, y: number): string {
    return `${x},${y}`
  }

  /**
   * 맵의 크기를 지정합니다. 한 변의 길이를 인수로 받습니다.
   * @param side 맵의 한 변의 길이입니다. 이 값을 기준으로 마름모의 아이소메트릭 씬이 생성됩니다.
   */
  setSide(side: number): this {
    this.side = side

    this.emit('set-side', side)
    return this
  }

  /**
   * 해당 좌표에 벽 타일 데이터를 지정합니다.
   * @param wall 벽 타일의 정보입니다.
   */
  setWall(wall: Engine.GameProject.SceneMapWall): this {
    const { x, y } = wall
    const key = this.createKey(x, y)

    this.walls.set(key, wall)
    this.emit('set-wall', wall)

    return this
  }

  /**
   * 해당 좌표에 바닥 타일 데이터를 지정합니다.
   * @param floor 바닥 타일의 정보입니다.
   */
  setFloor(floor: Engine.GameProject.SceneMapFloor): this {
    const { x, y } = floor
    const key = this.createKey(x, y)
    
    this.floors.set(key, floor)
    this.emit('set-floor', floor)

    return this
  }

  /**
   * 해당 좌표에 오디오 데이터를 지정합니다.
   * @param audio 오디오의 정보입니다.
   */
  setAudio(audio: Engine.GameProject.SceneMapAudio): this {
    const { x, y } = audio
    const key = this.createKey(x, y)

    this.audios.set(key, audio)
    this.emit('set-audio', audio)

    return this 
  }

  /**
   * `setSide` 메서드로 지정한 맵의 크기를 반환합니다.
   * @returns 지정된 맵의 한 변의 길이입니다.
   */
  getSide(): number {
    return this.side
  }

  /**
   * 해당 좌표에 `setWall` 메서드로 지정한 벽 타일 정보를 반환합니다.
   * @param x 지정한 벽 타일의 x좌표입니다.
   * @param y 지정한 벽 타일의 y좌표입니다.
   * @returns 해당 좌표에 있는 벽 타일의 데이터 정보입니다. 이 정보를 직접 수정하지 마십시오.
   */
  getWallFromPosition(x: number, y: number): Engine.GameProject.SceneMapWall|null {
    const key = this.createKey(x, y)
    
    return this.walls.get(key) ?? null
  }

  /**
   * 해당 좌표에 `setFloor` 메서드로 지정한 바닥 타일 정보를 반환합니다.
   * @param x 지정한 바닥 타일의 x좌표입니다.
   * @param y 지정한 바닥 타일의 y좌표입니다.
   * @returns 해당 좌표에 있는 바닥 타일의 데이터 정보입니다. 이 정보를 직접 수정하지 마십시오.
   */
  getFloorFromPosition(x: number, y: number): Engine.GameProject.SceneMapFloor|null {
    const key = this.createKey(x, y)

    return this.floors.get(key) ?? null
  }

  /**
   * 해당 좌표에 `setAudio` 메서드로 지정한 오디오 정보를 반환합니다.
   * @param x 지정한 오디오의 x좌표입니다.
   * @param y 지정한 오디오의 y좌표입니다.
   * @returns 해당 좌표에 있는 오디오의 데이터 정보입니다. 이 정보를 직접 수정하지 마십시오.
   */
  getAudioFromPosition(x: number, y: number): Engine.GameProject.SceneMapAudio|null {
    const key = this.createKey(x, y)

    return this.audios.get(key) ?? null
  }

  /**
   * 해당 좌표에 `setWall` 메서드로 지정한 벽 타일 정보를 삭제합니다.
   * @param x 지정한 벽 타일의 x좌표입니다.
   * @param y 지정한 벽 타일의 y좌표입니다.
   * @returns 해당 좌표에 벽 타일의 정보가 있었다면 `true`, 없었다면 `false`를 반환합니다.
   */
  deleteWallFromPosition(x: number, y: number): boolean {
    const key = this.createKey(x, y)
    const wall = this.walls.get(key) ?? null

    if (wall !== null) {
      this.walls.delete(key)
      this.emit('delete-wall', wall)
    }
    
    return !!wall
  }

  /**
   * 해당 좌표에 `setFloor` 메서드로 지정한 바닥 타일 정보를 삭제합니다.
   * @param x 지정한 바닥 타일의 x좌표입니다.
   * @param y 지정한 바닥 타일의 y좌표입니다.
   * @returns 해당 좌표에 바닥 타일의 정보가 있었다면 `true`, 없었다면 `false`를 반환합니다.
   */
  deleteFloorFromPosition(x: number, y: number): boolean {
    const key = this.createKey(x, y)
    const floor = this.floors.get(key) ?? null

    if (floor !== null) {
      this.floors.delete(key)
      this.emit('delete-floor', floor)
    }
    
    return !!floor
  }

  /**
   * 해당 좌표에 `setAudio` 메서드로 지정한 오디오 정보를 삭제합니다.
   * @param x 지정한 오디오의 x좌표입니다.
   * @param y 지정한 오디오의 y좌표입니다.
   * @returns 해당 좌표에 오디오의 정보가 있었다면 `true`, 없었다면 `false`를 반환합니다.
   */
  deleteAudioFromPosition(x: number, y: number): boolean {
    const key = this.createKey(x, y)
    const audio = this.audios.get(key) ?? null

    if (audio !== null) {
      this.audios.delete(key)
      this.emit('delete-audio', audio)
    }
    
    return !!audio
  }

  /**
   * `setWall` 메서드로 지정한 벽 타일 정보 중, 해당하는 페인트키로 생성된 정보만을 배열로 반환합니다.
   * @param paintKey 해당 데이터의 `key` 데이터 값입니다.
   * @returns 해당하는 페인트키로 생성된 정보를 배열로 반환합니다.
   */
  getWallFromPaintKey(paintKey: string): Engine.GameProject.SceneMapWall[] {
    const normalizedPaintKey = normalize(paintKey)
    const walls = Array.from(this.walls.values())

    return walls.filter((wall) => normalize(wall.key) === normalizedPaintKey)
  }

  /**
   * `setFloor` 메서드로 지정한 바닥 타일 정보 중, 해당하는 페인트키로 생성된 정보만을 배열로 반환합니다.
   * @param paintKey 해당 데이터의 `key` 데이터 값입니다.
   * @returns 해당하는 페인트키로 생성된 정보를 배열로 반환합니다.
   */
  getFloorFromPaintKey(paintKey: string): Engine.GameProject.SceneMapFloor[] {
    const normalizedPaintKey = normalize(paintKey)
    const floors = Array.from(this.floors.values())

    return floors.filter((floor) => normalize(floor.key) === normalizedPaintKey)
  }

  /**
   * `setAudio` 메서드로 지정한 오디오 정보 중, 해당하는 페인트키로 생성된 정보만을 배열로 반환합니다.
   * @param paintKey 해당 데이터의 `key` 데이터 값입니다.
   * @returns 해당하는 페인트키로 생성된 정보를 배열로 반환합니다.
   */
  getAudioFromPaintKey(paintKey: string): Engine.GameProject.SceneMapAudio[] {
    const normalizedPaintKey = normalize(paintKey)
    const audios = Array.from(this.audios.values())

    return audios.filter((audio) => normalize(audio.key) === normalizedPaintKey)
  }
  
  /**
   * `setWall` 메서드로 지정한 벽 타일 정보 중, 해당하는 페인트키로 생성한 정보만을 전부 제거합니다.
   * @param paintKey 해당 데이터의 `key` 데이터 값입니다.
   */
  deleteWallsFromPaintKey(paintKey: string): void {
    const walls = this.getWallFromPaintKey(paintKey)
    
    if (walls.length === 0) {
      return
    }

    for (const wall of walls) {
      if (normalize(wall.key) !== normalize(paintKey)) {
        return
      }
  
      this.deleteWallFromPosition(wall.x, wall.y)
    }
  }

  /**
   * `setFloor` 메서드로 지정한 바닥 타일 정보 중, 해당하는 페인트키로 생성한 정보만을 전부 제거합니다.
   * @param paintKey 해당 데이터의 `key` 데이터 값입니다.
   */
  deleteFloorsFromPaintKey(paintKey: string): void {
    const floors = this.getFloorFromPaintKey(paintKey)
    
    if (floors.length === 0) {
      return
    }

    for (const floor of floors) {
      if (normalize(floor.key) !== normalize(paintKey)) {
        return
      }

      this.deleteFloorFromPosition(floor.x, floor.y)
    }
  }

  /**
   * `setAudio` 메서드로 지정한 바닥 타일 정보 중, 해당하는 페인트키로 생성한 정보만을 전부 제거합니다.
   * @param paintKey 해당 데이터의 `key` 데이터 값입니다.
   */
  deleteAudiosFromPaintKey(paintKey: string): void {
    const audios = this.getAudioFromPaintKey(paintKey)
    
    if (audios.length === 0) {
      return
    }
    
    for (const audio of audios) {
      if (normalize(audio.key) !== normalize(paintKey)) {
        return
      }
  
      this.deleteAudioFromPosition(audio.x, audio.y)
    }
  }

  /**
   * `setWall` 메서드로 지정한 벽 타일 정보 중, `beforeKey`를 페인트키로 사용하는 정보를 `afterKey` 페인트키로 변환합니다.
   * 이는 에셋이 삭제되어서 새로운 에셋으로 대체하는 과정에서 사용하기에 유용합니다.
   * @param beforeKey 이전에 사용하던 데이터의 `key` 데이터 값입니다.
   * @param afterKey 변경할 `key` 데이터 값입니다.
   */
  changeWallsPaintKey(beforeKey: string, afterKey: string): void {
    const walls = this.getWallFromPaintKey(beforeKey)

    if (walls.length === 0) {
      return
    }

    for (const wall of walls) {
      wall.key = afterKey
      this.emit('set-wall', wall)
    }
  }

  /**
   * `setFloor` 메서드로 지정한 바닥 타일 정보 중, `beforeKey`를 페인트키로 사용하는 정보를 `afterKey` 페인트키로 변환합니다.
   * 이는 에셋이 삭제되어서 새로운 에셋으로 대체하는 과정에서 사용하기에 유용합니다.
   * @param beforeKey 이전에 사용하던 데이터의 `key` 데이터 값입니다.
   * @param afterKey 변경할 `key` 데이터 값입니다.
   */
  changeFloorsPaintKey(beforeKey: string, afterKey: string): void {
    const floors = this.getFloorFromPaintKey(beforeKey)

    if (floors.length === 0) {
      return
    }
    
    for (const floor of floors) {
      floor.key = afterKey
      this.emit('set-floor', floor)
    }
  }

  /**
   * `setAudio` 메서드로 지정한 오디오 정보 중, `beforeKey`를 페인트키로 사용하는 정보를 `afterKey` 페인트키로 변환합니다.
   * 이는 에셋이 삭제되어서 새로운 에셋으로 대체하는 과정에서 사용하기에 유용합니다.
   * @param beforeKey 이전에 사용하던 데이터의 `key` 데이터 값입니다.
   * @param afterKey 변경할 `key` 데이터 값입니다.
   */
  changeAudiosPaintKey(beforeKey: string, afterKey: string): void {
    const audios = this.getAudioFromPaintKey(beforeKey)

    if (audios.length === 0) {
      return
    }

    for (const audio of audios) {
      audio.key = afterKey
      this.emit('set-audio', audio)
    }
  }

  /**
   * 현재 데이터의 상태를 저장합니다.
   * 이 메서드로 저장된 데이터는 `undo` 메서드를 이용하여 다시 되돌릴 수 있습니다.
   * @returns 저장된 현재 데이터의 상태입니다.
   */
  saveState(): Engine.GameProject.SceneMap {
    const clone = this.data

    this.cacheStates.push(clone)
    return clone
  }

  /**
   * `U`, `A` 두 배열을 받고, `U` 배열에는 있으나, `A` 배열에는 없는 씬 오브젝트를 찾습니다. 이른바 `A`의 여집합을 반환합니다.
   * 찾는 기준은 `x`, `y` 좌표를 기준으로 찾습니다.
   * @param U 씬 오브젝트 배열입니다.
   * @param A 씬 오브젝트 배열입니다.
   * @returns `U`에는 있으나, `A`에는 존재하지 않는 씬 오브젝트 배열입니다. 
   */
  private getComplementSet<T extends Engine.GameProject.SceneMapObject>(U: T[], A: T[]): T[] {
    return U.filter((u) => {
      const same = A.find((a) => (u.x === a.x && u.y === a.y)) ?? null
      const exists = same !== null

      return !exists
    })
  }

  /**
   * `saveState` 메서드로 저장된 마지막으로 데이터를 복원합니다.
   * 더이상 복원할 데이터가 없다면 `null`를 반환합니다.
   * 되돌릴 때, `set-wall`, `set-floor`, `set-audio` 이벤트가 방출됩니다.
   * @returns 복원된 데이터입니다.
   */
  undo(): Engine.GameProject.SceneMap|null {
    const i = this.cacheStates.length - 1

    // 저장된 정보가 전혀 없을 경우, 무언가의 오류이므로 중지합니다.
    if (i < 0) {
      return null
    }
    
    const last = this.cacheStates.pop()
    const current = this.data
    
    // 배열에서 값을 빼왔지만, 무언가의 오류로 값이 없을 경우 중지합니다.
    if (!last) {
      return null
    }

    // 스택이 모두 비었다면, 초기화를 위해 최소한 1개의 스택을 다시 저장합니다.
    if (this.cacheStates.length <= 0) {
      const clone = this.copy(last)

      this.cacheStates.push(clone)
    }

    // 맵의 크기가 변경되었다면 이벤트를 호출합니다.

    if (last.side !== current.side) {
      this.setSide(last.side)
    }

    // 마지막 저장된 데이터에서 현재 데이터 중 없는 데이터를 조회하여 추가 이벤트를 발생시킵니다.
    // 이는 마지막에 저장한 후 삭제된 데이터이기 때문에, 되돌리는 과정에서 추가되므로 추가 이벤트를 발생시켜야 합니다.

    // this.getComplementSet(last.walls, current.walls).forEach((wall) => {
    //   this.setWall(wall)
    // })
    
    // this.getComplementSet(last.floors, current.floors).forEach((floor) => {
    //   this.setFloor(floor)
    // })
    
    // this.getComplementSet(last.audios, current.audios).forEach((audio) => {
    //   this.setAudio(audio)
    // })
    
    // 현재 데이터에서 마지막 저장된 데이터 중 없는 데이터를 조회하여 삭제 이벤트를 발생시킵니다.
    // 이는 마지막에 저장한 후 추가된 데이터이기 때문에, 되돌리는 과정에서 제거되므로 제거 이벤트를 발생시켜야 합니다.
    
    this.getComplementSet(current.walls, last.walls).forEach((wall) => {
      const { x, y } = wall
      this.deleteWallFromPosition(x, y)
    })

    this.getComplementSet(current.floors, last.floors).forEach((floor) => {
      const { x, y } = floor
      this.deleteFloorFromPosition(x, y)
    })

    this.getComplementSet(current.audios, last.audios).forEach((audio) => {
      const { x, y } = audio
      this.deleteAudioFromPosition(x, y)
    })

    // 그 외에 정보 (x, y, scale, isSensor, thrusholdRadius 등)의 정보는 추가/제거가 아닌 수정이므로
    // 수정된 정보에 대한 이벤트도 방출되어야 함.

    const { walls, floors, audios } = last
    walls.forEach((wall) => {
      this.setWall(wall)
    })
    floors.forEach((floor) => {
      this.setFloor(floor)
    })
    audios.forEach((audio) => {
      this.setAudio(audio)
    })

    return last
  }
}