import normalize from 'normalize-path'
import { nanoid } from 'nanoid'
import { TypedEmitter } from 'tiny-typed-emitter'

interface TypedEvents {
  'set-side': (_side: number) => void
  'set-wall':  (_wall: Engine.GameProject.SceneMapWall) => void
  'set-floor': (_floor: Engine.GameProject.SceneMapFloor) => void
  'set-audio': (_audio: Engine.GameProject.SceneMapAudio) => void
  'add-wall':  (_wall: Engine.GameProject.SceneMapWall) => void
  'add-floor': (_floor: Engine.GameProject.SceneMapFloor) => void
  'add-audio': (_audio: Engine.GameProject.SceneMapAudio) => void
  'delete-wall': (_wall: Engine.GameProject.SceneMapWall) => void
  'delete-floor': (_floor: Engine.GameProject.SceneMapFloor) => void
  'delete-audio': (_audio: Engine.GameProject.SceneMapAudio) => void
}

export class SceneMapManager extends TypedEmitter<TypedEvents> {
  protected side: number = 0
  protected readonly floors: Set<Engine.GameProject.SceneMapFloor> = new Set
  protected readonly walls: Set<Engine.GameProject.SceneMapWall> = new Set
  protected readonly audios: Set<Engine.GameProject.SceneMapAudio> = new Set
  
  protected cacheStates: Engine.GameProject.SceneMap[] = []
  protected cacheExists: Map<string, Engine.GameProject.SceneMapObject> = new Map

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

  private compatible_ensureVersion<T extends Partial<Engine.GameProject.SceneMapObject>>(obj: T): T {
    const id = obj.id ?? nanoid()
    return {
      ...obj,
      id
    }
  }

  /**
   * 데이터를 기반으로 인스턴스를 초기화합니다.
   * @param data 초기화하고자 하는 데이터입니다.
   */
  protected setDataState(data: Engine.GameProject.SceneMap): void {
    const { side } = data
    let { walls, floors, audios } = data

    this.side = side
    this.walls.clear()
    this.floors.clear()
    this.audios.clear()

    // compatible
    walls = walls.map((wall) => this.compatible_ensureVersion(wall))
    floors = floors.map((floor) => this.compatible_ensureVersion(floor))
    audios = audios.map((audio) => this.compatible_ensureVersion(audio))

    walls.forEach((obj) => this.walls.add(obj))
    floors.forEach((obj) => this.floors.add(obj))
    audios.forEach((obj) => this.audios.add(obj))
  }

  protected getObjectFromId<T extends Engine.GameProject.SceneMapObject>(data: Set<T>, id: string): T|null {
    for (const obj of data) {
      if (obj.id === id) {
        return obj
      }
    }
    return null
  }

  protected getObjectFromKeyAndPosition<T extends Engine.GameProject.SceneMapObject>(data: Set<T>, key: string, x: number, y: number): T|null {
    for (const obj of data) {
      if (
        obj.key === key &&
        obj.x === x &&
        obj.y === y
      ) {
        return obj
      }
    }
    return null
  }

  protected deleteObjectFromId<T extends Engine.GameProject.SceneMapObject>(data: Set<T>, id: string): T|null {
    for (const obj of data) {
      if (obj.id === id) {
        data.delete(obj)
      }
    }
    return null
  }

  private createCacheKeyFromData<T extends { key: string, x: number, y: number }>(disposeType: number, data: T): string {
    return `${disposeType}:${data.key}:${data.x}:${data.y}`
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
   * 해당 좌표에 일치하는 에셋으로 된 벽 오브젝트가 있다면 반환합니다. 없다면 `null`을 반환합니다.
   * @param assetKey 오브젝트에 사용된 에셋키입니다.
   * @param x 오브젝트가 배치된 x좌표입니다.
   * @param y 오브젝트가 배치된 y좌표입니다.
   * @returns 배치된 오브젝트를 반환합니다.
   */
  getWall<T extends Engine.GameProject.SceneMapObject>(assetKey: string, x: number, y: number): T|null {
    const cacheKey = this.createCacheKeyFromData(1, { key: assetKey, x, y })
    const found = this.cacheExists.get(cacheKey) ?? null
    return found as T|null
  }

  /**
   * 해당 좌표에 일치하는 에셋으로 된 벽 오브젝트가 있는지 여부를 반환합니다.
   * 이는 완벽히 동일한 위치에 동일한 에셋이 중복으로 배치되는 것을 막기 위함입니다.
   * @param assetKey 오브젝트에 사용된 에셋키입니다.
   * @param x 오브젝트가 배치된 x좌표입니다.
   * @param y 오브젝트가 배치된 y좌표입니다.
   * @returns 배치 여부를 반환합니다.
   */
  hasWall(assetKey: string, x: number, y: number): boolean {
    return !!this.getWall(assetKey, x, y)
  }

  /**
   * 해당 좌표에 일치하는 에셋으로 된 바닥 타일 오브젝트가 있다면 반환합니다. 없다면 `null`을 반환합니다.
   * @param assetKey 오브젝트에 사용된 에셋키입니다.
   * @param x 오브젝트가 배치된 x좌표입니다.
   * @param y 오브젝트가 배치된 y좌표입니다.
   * @returns 배치된 오브젝트를 반환합니다.
   */
  getFloor<T extends Engine.GameProject.SceneMapObject>(assetKey: string, x: number, y: number): T|null {
    const cacheKey = this.createCacheKeyFromData(2, { key: assetKey, x, y })
    const found = this.cacheExists.get(cacheKey) ?? null
    return found as T|null
  }

  /**
   * 해당 좌표에 일치하는 에셋으로 된 바닥 타일 오브젝트가 있는지 여부를 반환합니다.
   * 이는 완벽히 동일한 위치에 동일한 에셋이 중복으로 배치되는 것을 막기 위함입니다.
   * @param assetKey 오브젝트에 사용된 에셋키입니다.
   * @param x 오브젝트가 배치된 x좌표입니다.
   * @param y 오브젝트가 배치된 y좌표입니다.
   * @returns 배치 여부를 반환합니다.
   */
  hasFloor(assetKey: string, x: number, y: number): boolean {
    return !!this.getFloor(assetKey, x, y)
  }

  /**
   * 해당 좌표에 일치하는 에셋으로 된 오디오 오브젝트가 있다면 반환합니다. 없다면 `null`을 반환합니다.
   * @param assetKey 오브젝트에 사용된 에셋키입니다.
   * @param x 오브젝트가 배치된 x좌표입니다.
   * @param y 오브젝트가 배치된 y좌표입니다.
   * @returns 배치된 오브젝트를 반환합니다.
   */
  getAudio<T extends Engine.GameProject.SceneMapObject>(assetKey: string, x: number, y: number): T|null {
    const cacheKey = this.createCacheKeyFromData(3, { key: assetKey, x, y })
    const found = this.cacheExists.get(cacheKey) ?? null
    return found as T|null
  }

  /**
   * 해당 좌표에 일치하는 에셋으로 된 오디오 오브젝트가 있는지 여부를 반환합니다.
   * 이는 완벽히 동일한 위치에 동일한 에셋이 중복으로 배치되는 것을 막기 위함입니다.
   * @param assetKey 오브젝트에 사용된 에셋키입니다.
   * @param x 오브젝트가 배치된 x좌표입니다.
   * @param y 오브젝트가 배치된 y좌표입니다.
   * @returns 배치 여부를 반환합니다.
   */
  hasAudio(assetKey: string, x: number, y: number): boolean {
    return !!this.getAudio(assetKey, x, y)
  }

  /**
   * 해당 좌표에 벽 타일 데이터를 지정합니다.
   * @param wall 벽 타일의 정보입니다.
   */
  addWall(wall: Engine.GameProject.SceneMapWall, emit = true): this {
    this.walls.add(wall)
    this.cacheExists.set(this.createCacheKeyFromData(1, wall), wall)
    if (emit) {
      this.emit('add-wall', wall)
    }

    return this
  }

  /**
   * 해당 좌표에 바닥 타일 데이터를 지정합니다.
   * @param floor 바닥 타일의 정보입니다.
   */
  addFloor(floor: Engine.GameProject.SceneMapFloor, emit = true): this {
    this.floors.add(floor)
    this.cacheExists.set(this.createCacheKeyFromData(2, floor), floor)
    if (emit) {
      this.emit('add-floor', floor)
    }

    return this
  }

  /**
   * 해당 좌표에 오디오 데이터를 지정합니다.
   * @param audio 오디오의 정보입니다.
   */
  addAudio(audio: Engine.GameProject.SceneMapAudio, emit = true): this {
    this.audios.add(audio)
    this.cacheExists.set(this.createCacheKeyFromData(3, audio), audio)
    if (emit) {
      this.emit('add-audio', audio)
    }

    return this 
  }

  /**
   * `addWall` 메서드로 추가된 오브젝트의 속성을 수정합니다. 존재하지 않는다면 추가하지 않습니다.
   * @param wall 오브젝트 속성입니다.
   */
  setWall(wall: Engine.GameProject.SceneMapWall, emit = true): this {
    const target = this.getObjectFromId(this.walls, wall.id)
    if (!target) {
      this.addWall(wall)
    }
    else {
      this.cacheExists.delete(this.createCacheKeyFromData(1, target))

      const { alias, isSensor, key, scale, x, y } = wall
      target.alias = alias
      target.isSensor = isSensor
      target.key = key
      target.scale = scale
      target.x = x
      target.y = y

      this.cacheExists.set(this.createCacheKeyFromData(1, target), target)
      if (emit) {
        this.emit('set-wall', target)
      }
    }
    return this
  }
  
  /**
   * `addFloor` 메서드로 추가된 오브젝트의 속성을 수정합니다. 존재하지 않는다면 추가하지 않습니다.
   * @param floor 오브젝트 속성입니다.
   */
  setFloor(floor: Engine.GameProject.SceneMapFloor, emit = true): this {
    const target = this.getObjectFromId(this.floors, floor.id)
    if (!target) {
      this.addFloor(floor)
    }
    else {
      this.cacheExists.delete(this.createCacheKeyFromData(2, target))

      const { key, x, y } = floor
      target.key = key
      target.x = x
      target.y = y

      this.cacheExists.set(this.createCacheKeyFromData(2, target), target)
      if (emit) {
        this.emit('set-floor', target)
      }
    }
    return this
  }
  
  /**
   * `addAudio` 메서드로 추가된 오브젝트의 속성을 수정합니다. 존재하지 않는다면 추가하지 않습니다.
   * @param audio 오브젝트 속성입니다.
   */
  setAudio(audio: Engine.GameProject.SceneMapAudio, emit = true): this {
    const target = this.getObjectFromId(this.audios, audio.id)
    if (!target) {
      this.addAudio(audio)
    }
    else {
      this.cacheExists.delete(this.createCacheKeyFromData(3, target))

      const { delay, loop, thresholdRadius, volume, x, y } = audio
      target.delay = delay
      target.loop = loop
      target.thresholdRadius = thresholdRadius
      target.volume = volume
      target.x = x
      target.y = y

      this.cacheExists.set(this.createCacheKeyFromData(3, target), target)
      if (emit) {
        this.emit('set-audio', target)
      }
    }
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
   * `addWall` 메서드로 추가된 오브젝트를 `id` 속성을 기반으로 찾습니다. 없으면 `null`을 반환합니다.
   * @param id 오브젝트의 고유값입니다.
   */
  getWallFromId(id: string): Engine.GameProject.SceneMapWall|null {
    return this.getObjectFromId(this.walls, id)
  }

  /**
   * `addFloor` 메서드로 추가된 오브젝트를 `id` 속성을 기반으로 찾습니다. 없으면 `null`을 반환합니다.
   * @param id 오브젝트의 고유값입니다.
   */
  getFloorFromId(id: string): Engine.GameProject.SceneMapFloor|null {
    return this.getObjectFromId(this.floors, id)
  }

  /**
   * `addAudio` 메서드로 추가된 오브젝트를 `id` 속성을 기반으로 찾습니다. 없으면 `null`을 반환합니다.
   * @param id 오브젝트의 고유값입니다.
   */
  getAudioFromId(id: string): Engine.GameProject.SceneMapAudio|null {
    return this.getObjectFromId(this.audios, id)
  }

  /**
   * `addWall` 메서드로 지정한 벽 타일 정보 중, 해당하는 페인트키로 생성된 정보만을 배열로 반환합니다.
   * @param paintKey 해당 데이터의 `key` 데이터 값입니다.
   * @returns 해당하는 페인트키로 생성된 정보를 배열로 반환합니다.
   */
  getWallsFromPaintKey(paintKey: string): Engine.GameProject.SceneMapWall[] {
    const normalizedPaintKey = normalize(paintKey)
    const walls = Array.from(this.walls.values())

    return walls.filter((wall) => normalize(wall.key) === normalizedPaintKey)
  }

  /**
   * `addFloor` 메서드로 지정한 바닥 타일 정보 중, 해당하는 페인트키로 생성된 정보만을 배열로 반환합니다.
   * @param paintKey 해당 데이터의 `key` 데이터 값입니다.
   * @returns 해당하는 페인트키로 생성된 정보를 배열로 반환합니다.
   */
  getFloorsFromPaintKey(paintKey: string): Engine.GameProject.SceneMapFloor[] {
    const normalizedPaintKey = normalize(paintKey)
    const floors = Array.from(this.floors.values())

    return floors.filter((floor) => normalize(floor.key) === normalizedPaintKey)
  }

  /**
   * `addAudio` 메서드로 지정한 오디오 정보 중, 해당하는 페인트키로 생성된 정보만을 배열로 반환합니다.
   * @param paintKey 해당 데이터의 `key` 데이터 값입니다.
   * @returns 해당하는 페인트키로 생성된 정보를 배열로 반환합니다.
   */
  getAudiosFromPaintKey(paintKey: string): Engine.GameProject.SceneMapAudio[] {
    const normalizedPaintKey = normalize(paintKey)
    const audios = Array.from(this.audios.values())

    return audios.filter((audio) => normalize(audio.key) === normalizedPaintKey)
  }

  deleteWallFromId(id: string, emit = true): void {
    const obj = this.getObjectFromId(this.walls, id)
    if (obj) {
      this.cacheExists.delete(this.createCacheKeyFromData(1, obj))
      this.deleteObjectFromId(this.walls, id)
      if (emit) {
        this.emit('delete-wall', obj)
      }
    }
  }

  deleteFloorFromId(id: string, emit = true): void {
    const obj = this.getObjectFromId(this.floors, id)
    if (obj) {
      this.cacheExists.delete(this.createCacheKeyFromData(2, obj))
      this.deleteObjectFromId(this.floors, id)
      if (emit) {
        this.emit('delete-floor', obj)
      }
    }
  }

  deleteAudioFromId(id: string, emit = true): void {
    const obj = this.getObjectFromId(this.audios, id)
    if (obj) {
      this.cacheExists.delete(this.createCacheKeyFromData(3, obj))
      this.deleteObjectFromId(this.audios, id)
      if (emit) {
        this.emit('delete-audio', obj)
      }
    }
  }
  
  /**
   * `setWall` 메서드로 지정한 벽 타일 정보 중, 해당하는 페인트키로 생성한 정보만을 전부 제거합니다.
   * @param paintKey 해당 데이터의 `key` 데이터 값입니다.
   */
  deleteWallsFromPaintKey(paintKey: string): void {
    const walls = this.getWallsFromPaintKey(paintKey)

    if (walls.length === 0) {
      return
    }

    for (const wall of walls) {
      if (normalize(wall.key) !== normalize(paintKey)) {
        return
      }
      this.deleteWallFromId(wall.id)
    }
  }

  /**
   * `setFloor` 메서드로 지정한 바닥 타일 정보 중, 해당하는 페인트키로 생성한 정보만을 전부 제거합니다.
   * @param paintKey 해당 데이터의 `key` 데이터 값입니다.
   */
  deleteFloorsFromPaintKey(paintKey: string): void {
    const floors = this.getFloorsFromPaintKey(paintKey)
    
    if (floors.length === 0) {
      return
    }

    for (const floor of floors) {
      if (normalize(floor.key) !== normalize(paintKey)) {
        return
      }
      this.deleteFloorFromId(floor.id)
    }
  }

  /**
   * `setAudio` 메서드로 지정한 바닥 타일 정보 중, 해당하는 페인트키로 생성한 정보만을 전부 제거합니다.
   * @param paintKey 해당 데이터의 `key` 데이터 값입니다.
   */
  deleteAudiosFromPaintKey(paintKey: string): void {
    const audios = this.getAudiosFromPaintKey(paintKey)
    
    if (audios.length === 0) {
      return
    }
    
    for (const audio of audios) {
      if (normalize(audio.key) !== normalize(paintKey)) {
        return
      }
      this.deleteAudioFromId(audio.id)
    }
  }

  /**
   * `addWall` 메서드로 지정한 벽 타일 정보 중, `beforeKey`를 페인트키로 사용하는 정보를 `afterKey` 페인트키로 변환합니다.
   * 이는 에셋이 삭제되어서 새로운 에셋으로 대체하는 과정에서 사용하기에 유용합니다.
   * @param beforeKey 이전에 사용하던 데이터의 `key` 데이터 값입니다.
   * @param afterKey 변경할 `key` 데이터 값입니다.
   */
  changeWallsPaintKey(beforeKey: string, afterKey: string): void {
    const walls = this.getWallsFromPaintKey(beforeKey)

    if (walls.length === 0) {
      return
    }

    for (const wall of walls) {
      this.cacheExists.delete(this.createCacheKeyFromData(1, wall))
      wall.key = afterKey
      this.cacheExists.set(this.createCacheKeyFromData(1, wall), wall)
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
    const floors = this.getFloorsFromPaintKey(beforeKey)

    if (floors.length === 0) {
      return
    }
    
    for (const floor of floors) {
      this.cacheExists.delete(this.createCacheKeyFromData(2, floor))
      floor.key = afterKey
      this.cacheExists.set(this.createCacheKeyFromData(2, floor), floor)
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
    const audios = this.getAudiosFromPaintKey(beforeKey)

    if (audios.length === 0) {
      return
    }

    for (const audio of audios) {
      this.cacheExists.delete(this.createCacheKeyFromData(3, audio))
      audio.key = afterKey
      this.cacheExists.set(this.createCacheKeyFromData(3, audio), audio)
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
      const same = A.find((a) => (u.id === a.id)) ?? null
      const exists = same !== null

      return !exists
    })
  }

  /**
   * `saveState` 메서드로 저장된 마지막으로 데이터를 복원합니다.
   * 더이상 복원할 데이터가 없다면 `null`를 반환합니다.
   * 되돌릴 때, `add-wall`, `add-floor`, `add-audio` 이벤트가 방출됩니다.
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
      this.deleteWallFromId(wall.id)
    })
    
    this.getComplementSet(current.floors, last.floors).forEach((floor) => {
      this.deleteFloorFromId(floor.id)
    })
    
    this.getComplementSet(current.audios, last.audios).forEach((audio) => {
      this.deleteAudioFromId(audio.id)
    })

    // 그 외에 정보 (x, y, scale, isSensor, thresholdRadius 등)의 정보는 추가/제거가 아닌 수정이므로
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