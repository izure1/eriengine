import path from 'path'

import normalize from 'normalize-path'
import { nanoid } from 'nanoid'
import { Scene } from 'phaser'
import { Plugin as IsometricScenePlugin } from '@eriengine/plugin-isometric-scene'
import { PointerPlugin, SelectPlugin } from '@eriengine/plugin-isometric-cursor'
import { Plugin as OptimizationPlugin } from '@eriengine/plugin-optimization'

import { PreviewAudioVisualizer } from './PreviewAudioVisualizer'
import { SceneMapManager } from './SceneMapManager'
import { Palette, PaletteImageAsset, PalettePaintAsset, PaletteSpriteAsset } from './Vars/Types'
import {
  PROJECT_SRC_DIRECTORY_NAME,
  PROJECT_SRC_ASSET_DIRECTORY_NAME
} from '@/Const'

import IcoPaletteAudio from '@/Renderer/assets/ico-palette-audio.png'

type FillableObject = Phaser.GameObjects.GameObject&Phaser.GameObjects.Components.Tint

export class PreviewScene extends Scene {
  readonly map!: IsometricScenePlugin
  readonly cursor!: PointerPlugin
  readonly select!: SelectPlugin
  readonly optimization!: OptimizationPlugin

  protected readonly assetDirectory: string
  
  protected readonly palette: Palette
  protected readonly projectDirectory: string
  protected readonly mapDataState: Engine.GameProject.SceneMap
  readonly mapDataManager: SceneMapManager
  protected selectedPaint: PalettePaintAsset|null
  protected disposeType: number
  
  private dragStartOffset: Point2 = { x: 0, y: 0 }
  
  private cameraControl: Phaser.Cameras.Controls.SmoothedKeyControl|null = null
  private leftKey: Phaser.Input.Keyboard.Key|null = null
  private rightKey: Phaser.Input.Keyboard.Key|null = null
  private upKey: Phaser.Input.Keyboard.Key|null = null
  private downKey: Phaser.Input.Keyboard.Key|null = null

  private waitCreatedPromise: Promise<void>
  private waitCreatedResolver: ((_value: void|PromiseLike<void>) => void)|null = null

  constructor(palette: Palette, mapDataState: Engine.GameProject.SceneMap, projectDirectory: string, config: string|Phaser.Types.Scenes.SettingsConfig) {
    super(config)

    this.palette = palette
    this.projectDirectory = projectDirectory
    this.assetDirectory = normalize(
      path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME)
    )

    this.selectedPaint = null
    this.disposeType = 0

    this.mapDataState = this.copy(mapDataState)
    this.mapDataManager = new SceneMapManager(this.mapDataState)

    // Map Data Manager에서 setWall, setFloor, setAudio, deleteWall, deleteFloor, deleteAudio 등과의 메서드로 데이터가 변경되었을 때
    // 실제 씬에서 이 데이터를 기반으로 다시 그리기 (re-rendering) 해야 합니다.

    this.mapDataManager.on('set-side', (side) => {
      this.setMapSize(side)
    })

    // 벽이 추가/수정/제거되었을 경우, 벽의 비주얼을 수정합니다.
    this.mapDataManager
      .on('add-wall', (wall) => {
        this.drawWall(wall)
      })
      .on('set-wall', (wall) => {
        this.eraseWall(wall.id)
        this.drawWall(wall)
      })
      .on('delete-wall', (wall) => {
        this.eraseWall(wall.id)
      })
    // 바닥이 추가/수정/제거되었을 경우, 바닥의 비주얼을 수정합니다.
    this.mapDataManager
      .on('add-floor', (floor) => {
        this.drawFloor(floor)
      })
      .on('set-floor', (floor) => {
        this.eraseFloor(floor.id)
        this.drawFloor(floor)
      })
      .on('delete-floor', (floor) => {
        this.eraseFloor(floor.id)
      })
    // 오디오가 추가/수정/제거되었을 경우, 오디오의 비주얼을 수정합니다.
    this.mapDataManager
      .on('add-audio', (audio) => {
        this.drawAudio(audio)
      })
      .on('set-audio', (audio) => {
        this.eraseAudio(audio.id)
        this.drawAudio(audio)
      })
      .on('delete-audio', (audio) => {
        this.eraseAudio(audio.id)
      })

    // 씬이 preload 단계를 넘어 create 되었을 때 해결될 프로미스입니다. 이는 `waitCreated` 메서드에서 이용됩니다.
    this.waitCreatedPromise = new Promise((resolve) => {
      this.waitCreatedResolver = resolve
    })
  }

  /** 벽 타일의 기본 데이터를 반환합니다. */
  get defaultWallData(): Engine.GameProject.SceneMapWall {
    return {
      id: nanoid(),
      key: '',
      x: 0,
      y: 0,
      alias: '',
      scale: 1,
      isSensor: false
    }
  }

  /** 바닥 타일의 기본 데이터를 반환합니다. */
  get defaultFloorData(): Engine.GameProject.SceneMapFloor {
    return {
      id: nanoid(),
      key: '',
      x: 0,
      y: 0
    }
  }

  /** 오디오 타일의 기본 데이터를 반환합니다. */
  get defaultAudioData(): Engine.GameProject.SceneMapAudio {
    return {
      id: nanoid(),
      key: '',
      x: 0,
      y: 0,
      loop: true,
      thresholdRadius: 1000,
      volume: 1,
      delay: 0
    }
  }

  /** 씬에 설치된 벽의 게임 오브젝트 목록을 배열로 반환합니다. */
  get wallObjects() {
    return this.map.walls
  }
  
  /** 씬에 설치된 바닥 타일의 게임 오브젝트 목록을 배열로 반환합니다. */
  get floorObjects() {
    return this.map.floors
  }
  
  /** 씬에 설치된 오디오의 게임 오브젝트 목록을 배열로 반환합니다. */
  get audioObjects(): PreviewAudioVisualizer[] {
    return this.children.list.filter((object) => object instanceof PreviewAudioVisualizer) as PreviewAudioVisualizer[]
  }

  /**
   * 드래그로 선택된 맵 오브젝트 정보를 반환합니다.
   */
  get selectedMapObjects() {
    const selected: {
      walls: Engine.GameProject.SceneMapWall[],
      floors: Engine.GameProject.SceneMapFloor[],
      audios: Engine.GameProject.SceneMapAudio[]
    } = {
      walls: [],
      floors: [],
      audios: []
    }

    for (const object of this.select.selects) {
      const { name } = object
      switch (this.disposeType) {
        case 1: {
          const wall = this.mapDataManager.getWallFromId(name)
          if (wall) selected.walls.push(wall)
          break
        }
        case 2: {
          const floor = this.mapDataManager.getFloorFromId(name)
          if (floor) selected.floors.push(floor)
          break
        }
        case 3: {
          const audio = this.mapDataManager.getAudioFromId(name)
          if (audio) selected.audios.push(audio)
          break
        }
      }
    }

    return selected
  }

  /** 씬 맵에서 오브젝트를 선택 중인지 여부를 반환합니다. 1개 이상의 오브젝트를 선택 중이라면 참을 반환합니다. */
  get isSelectedMapObject(): boolean {
    return this.select.selects.length > 0
  }

  private copy<T extends object>(jsonData: T): T {
    return JSON.parse(JSON.stringify(jsonData))
  }

  createCloneMapObject<T extends Engine.GameProject.SceneMapObject>(data: T): T {
    const id = nanoid()
    const clone = JSON.parse(JSON.stringify(data)) as T
    return {
      ...clone,
      id
    }
  }

  preload(): void {
    // this.load.image('ico-palette-audio', IcoPaletteAudio)
    this.textures.addBase64('ico-palette-audio', IcoPaletteAudio)

    for (const { key, asset } of this.palette.images) {
      const assetPath = path.join(this.assetDirectory, asset)
      this.load.image(key, assetPath)
    }
    
    for (const { key, asset, frameWidth, frameHeight } of this.palette.sprites) {
      const assetPath = path.join(this.assetDirectory, asset)
      this.load.spritesheet(key, assetPath, { frameWidth, frameHeight })
    }
    
    for (const { key, asset } of this.palette.audios) {
      const assetPath = path.join(this.assetDirectory, asset)
      this.load.audio(key, assetPath)
    }
  }

  create(): void {
    this.resolveWait()

    this.generateAnimation()
    this.setCameraControl()

    this.setMapSize(this.mapDataState.side)
    this.deploy()

    // 맵 배치 기능을 위해 이벤트를 할당합니다.
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (e: Phaser.Input.Pointer) => {
      this.dragStartOffset = { x: e.worldX, y: e.worldY }

      switch (e.buttons) {
        // 좌클릭 했다면 현재 selectedPaint, disposeType를 기준으로 맵에 오브젝트 배치를 시도합니다.
        case 1: {
          // 선택된 페인트가 있는 상태에서 좌클릭은 그리기를 의미하므로, 그리기를 시작했을 때 데이터를 저장합니다.
          if (this.selectedPaint !== null) {
            this.mapDataManager.saveState()
          }

          const { x, y } = this.cursor.pointer
          this.disposeSelectedPaint(Math.round(x), Math.round(y))

          // shift키를 누르지 않았다면, 이전에 선택되었던 리스트를 제거합니다.
          if (!e.event.shiftKey) {
            this.unselectObjects()
          }
          break
        }
      }
    })

    this.input.on(Phaser.Input.Events.POINTER_MOVE, (e: Phaser.Input.Pointer) => {
      switch (e.buttons) {
        // 좌클릭 상태로 드래그할 경우, 현재 배치모드라면 맵에 오브젝트를 배치합니다.
        case 1: {
          if (this.selectedPaint !== null) {
            let { x, y } = this.cursor.calcCursorOffset({ x: e.worldX, y: e.worldY })

            // 쉬프트키와 함께 사용하고 있다면, 맵에 오브젝트를 대각선으로 배치합니다.
            if (e.event.shiftKey) {
              const startOffset = this.dragStartOffset
              const currentOffset = { x, y }

              const offset = this.calcStraightDisposeOffset(startOffset, currentOffset)
              x = offset.x
              y = offset.y
            }

            this.disposeSelectedPaint(Math.round(x), Math.round(y))
          }
          break
        }
      }
    })

    // 맵 배치 삭제 및 선택 기능을 위해 이벤트를 할당합니다.
    this.select.events.on('drag-end', (_e, selection) => {
      switch (this.disposeType) {
        case 1: {
          this.select.select(selection, this.map.walls)
          break
        }
        case 2: {
          this.select.select(selection, this.map.floors)
          break
        }
        case 3: {
          this.select.select(selection, this.children.list.filter((object) => object instanceof PreviewAudioVisualizer))
          break
        }
      }
      
      const color = Phaser.Display.Color.GetColor(255, 0, 0)

      for (const object of this.select.selects) {
        const item: FillableObject = object as FillableObject
        item.setTint(color)
      }
    })

    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP, false)
    this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN, false)
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT, false)
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT, false)

    this.upKey.on('up', () => this.updateSelectsMapDataPosition())
    this.downKey.on('up', () => this.updateSelectsMapDataPosition())
    this.leftKey.on('up', () => this.updateSelectsMapDataPosition())
    this.rightKey.on('up', () => this.updateSelectsMapDataPosition())

    // 씬이 파괴되면 모든 키 핸들링을 제거합니다.
    this.events.on(Phaser.Scenes.Events.DESTROY, () => {
      this.input.keyboard.removeAllKeys(true)
    })
  }

  update(_time: number, delta: number): void {
    this.updateCamera(delta)
    this.updateKeyboard(delta)
  }

  /**
   * 씬이 에셋 로드를 포함한 모든 작업(preload)가 끝나고, 실행 가능(create) 상태가 될 때 까지 대기합니다.
   * @returns 실행 가능 상태가 될 때 해결될 프로미스 인스턴스입니다.
   */
  waitCreated(): Promise<void> {
    return this.waitCreatedPromise
  }

  private resolveWait(): void {
    if (!this.waitCreatedResolver) {
      return
    }
    this.waitCreatedResolver()
  }

  private generateAnimation(): void {
    for (const anims of this.palette.sprites) {
      const { key, frameRate, start, end } = anims
      if (this.anims.exists(key)) {
        continue
      }
      this.anims.create({
        key,
        frameRate,
        frames: this.anims.generateFrameNumbers(key, { start, end }),
        repeat: -1
      })
    }
  }

  /**
   * 맵 배치 방향키 기능을 위해 이벤트를 할당합니다.
   * 성능 향상을 위해서 방향키에서 마우스를 땐 시점에만 저장하도록 설정합니다.
   * 그리고 현재 오브젝트의 정보를 받아오기 위해 select.selects 목록에서 `name` 속성을 가져옵니다. 이 속성은 mapDataManager에서 설정한 id 값과 동일하기 때문입니다.
   * 자세한 내용은 `drawWall`, `drawFloor` 등의 메서드의 구현을 참조하십시오.
   */
  private updateSelectsMapDataPosition(): void {
    const getGameObjectFromId = <T extends Phaser.GameObjects.GameObject>(list: T[], id: string) => {
      return list.find(({ name }) => name === id) ?? null
    }

    const { walls, floors, audios } = this.selectedMapObjects
    const selects = this.select.selects as (Phaser.GameObjects.GameObject&Phaser.GameObjects.Components.Transform)[]

    walls.forEach((wall) => {
      const obj = getGameObjectFromId(selects, wall.id)
      if (obj) {
        const { x, y } = obj
        this.mapDataManager.setWall({ ...wall, x, y }, false)
      }
    })

    floors.forEach((floor) => {
      const obj = getGameObjectFromId(selects, floor.id)
      if (obj) {
        const { x, y } = obj
        this.mapDataManager.setFloor({ ...floor, x, y }, false)
      }
    })

    audios.forEach((audio) => {
      const obj = getGameObjectFromId(selects, audio.id)
      if (obj) {
        const { x, y } = obj
        this.mapDataManager.setAudio({ ...audio, x, y }, false)
      }
    })
  }

  /**
   * Map.json으로부터 저장된 모든 오브젝트 데이터를 기반으로 맵을 초기화합니다.
   */
  private deploy(): void {
    const { walls, floors, audios } = this.mapDataState

    walls.forEach((wall) => this.drawWall(wall))
    floors.forEach((floor) => this.drawFloor(floor))
    audios.forEach((audio) => this.drawAudio(audio))
  }

  /**
   * 쉬프트를 누른 상태에서 드래그하면 대각선으로 블록을 배치할 수 있습니다.
   * 이는 드래그를 시작한 위치에서, 현재 마우스의 위치를 고려하여 블록이 어느 좌표에 배치되어야하는지 계산하는 메서드입니다.
   * @param dragStartOffset 드래그를 시작헀던 커서의 좌표입니다.
   * @param currentCursorOffset 현재 커서의 좌표입니다.
   * @returns 계산 결과, 블록이 배치될 씬의 월드 좌표입니다.
   */
  private calcStraightDisposeOffset(dragStartOffset: Point2, currentCursorOffset: Point2): Point2 {
    const startOffset = this.cursor.calcCursorOffset(dragStartOffset)
    const distanceX = currentCursorOffset.x - startOffset.x
    const distanceY = currentCursorOffset.y - startOffset.y
    
    let deg: number
    const distance = Phaser.Math.Distance.Between(0, 0, distanceX, distanceY)

    // ↗
    if (distanceX > 0 && distanceY < 0) {
      deg = -26.57
    }
    // ↘
    else if (distanceX > 0 && distanceY > 0) {
      deg = 26.57
    }
    // ↙
    else if (distanceX < 0 && distanceY > 0) {
      deg = 180 - 26.57
    }
    // ↖
    else {
      deg = 180 + 26.57
    }

    const rad = Phaser.Math.DegToRad(deg)
    const offset = this.cursor.calcCursorOffset({
      x: Math.cos(rad) * distance,
      y: Math.sin(rad) * distance
    })

    const x = startOffset.x + offset.x
    const y = startOffset.y + offset.y

    return { x, y }
  }

  /**
   * 해당 에셋이 어떤 파렛트 타입인지를 반환합니다.
   * 이미지 에셋일 경우 1, 스프라이트 에셋일 경우 2, 오디오 에셋일 경우 3을 반환하며, 어느 곳에도 속하지 않는다면 -1을 반환합니다.
   * @param key 에셋의 키입니다.
   */
  private getPaletteType(key: string): number {
    const { images, sprites, audios } = this.palette

    if (images.find((image) => image.key === key)) {
      return 1
    }

    if (sprites.find((sprite) => sprite.key === key)) {
      return 2
    }

    if (audios.find((audio) => audio.key === key)) {
      return 3
    }

    return -1
  }
  
  /**
   * 사용된 에셋 키를 기반으로 파렛트에서 정보를 반환합니다.
   * 해당 에셋이 없거나 누락되었다면, `null`을 반환합니다.
   * @param key 에셋의 키입니다.
   */
  private getPaint(key: string): PalettePaintAsset|null {
    const { images, sprites, audios } = this.palette

    return images.find((image) => image.key === key) ??
      sprites.find((sprite) => sprite.key === key) ??
      audios.find((audio) => audio.key === key) ?? null
  }

  /**
   * 씬 맵 오브젝트 정보로부터 맵에 벽 오브젝트를 배치합니다.
   * @param data Map.json에 저장된 씬 벽 오브젝트 정보입니다. 최소 `key`, `x`, `y` 정보를 가지고 있어야 합니다. `key`가 `palette` 정보에 없다면 무시됩니다.
   */
  private drawWall(data: Engine.GameProject.SceneMapWall): void {
    const { id, key, x, y, scale, isSensor } = data
    const paletteType = this.getPaletteType(key)

    // 없는 에셋이거나 누락되었다면 무시합니다
    if (paletteType === -1) {
      return
    }

    const animationKey: string|undefined = paletteType === 2 ? key : undefined

    const wall = this.map.setWallTile(id, x, y, key, undefined, animationKey)
    wall.setName(id)

    this.optimization.add(wall)

    wall.setScale(scale).setSensor(isSensor)
    wall.setToSleep()
  }

  /**
   * 씬 맵 오브젝트 정보로부터 맵에 바닥타일 오브젝트를 배치합니다.
   * @param data Map.json에 저장된 씬 바닥타일 오브젝트 정보입니다. 최소 `key`, `x`, `y` 정보를 가지고 있어야 합니다. `key`가 `palette` 정보에 없다면 무시됩니다.
   */
  private drawFloor(data: Engine.GameProject.SceneMapFloor): void {
    const { id, key, x, y } = data
    const paletteType = this.getPaletteType(key)

    // 없는 에셋이거나 누락되었다면 무시합니다
    if (paletteType === -1) {
      return
    }

    const animationKey: string|undefined = paletteType === 2 ? key : undefined

    const floor = this.map.setFloorTile(id, x, y, key, undefined, animationKey)
    floor.setName(id)

    this.optimization.add(floor)
  }

  /**
   * 씬 맵 오브젝트 정보로부터 맵에 오디오 오브젝트를 배치합니다.
   * @param data Map.json에 저장된 씬 오디오 오브젝트 정보입니다. 최소 `key`, `x`, `y` 정보를 가지고 있어야 합니다. `key`가 `palette` 정보에 없다면 무시됩니다.
   */
  private drawAudio(data: Engine.GameProject.SceneMapAudio): void {
    const { id, key, x, y, thresholdRadius } = data
    const paletteType = this.getPaletteType(key)

    // 없는 에셋이거나 누락되었다면 무시합니다
    if (paletteType === -1) {
      return
    }

    const visualizer = new PreviewAudioVisualizer(this, id, x, y, { key, thresholdRadius })
    this.add.existing(visualizer)
  }

  /**
   * 현재 선택된 페인트(selectedPaint)와 배치 타입(disposeType)을 기준으로 좌표에 오브젝트를 배치합니다.
   * @param x 배치할 x좌표입니다
   * @param y 배치할 y좌표입니다.
   */
  private disposeSelectedPaint(x: number, y: number): void {
    if (!this.selectedPaint) {
      return
    }

    const { key } = this.selectedPaint

    // 배치할 때, 이전과 같은 장소에 같은 키를 가지고 있는 에셋이 있다면 중복으로 처리하여 배치하지 않습니다.
    switch (this.disposeType) {
      case 1: {
        const exists = this.mapDataManager.getWall(key, x, y)!
        if (exists) {
          this.mapDataManager.deleteWallFromId(exists.id)
        }
        this.mapDataManager.addWall({ ...this.defaultWallData, key, x, y })
        break
      }
      case 2: {
        const exists = this.mapDataManager.getFloor(key, x, y)
        if (exists) {
          this.mapDataManager.deleteFloorFromId(exists.id)
        }
        this.mapDataManager.addFloor({ ...this.defaultFloorData, key, x, y })
        break
      }
      case 3: {
        const exists = this.mapDataManager.getAudio(key, x, y)
        if (exists) {
          this.mapDataManager.deleteAudioFromId(exists.id)
        }
        this.mapDataManager.addAudio({ ...this.defaultAudioData, key, x, y })
        break
      }
    }
  }

  /**
   * 설치된 벽을 제거합니다. 맵 데이터와, 씬의 오브젝트 모두 삭제됩니다.
   * @param id 제거하고자 하는 벽의 고유값입니다.
   */
  eraseWall(id: string): void {
    this.map.removeWallTile(id)
  }

  /**
   * 설치된 바닥 타일을 제거합니다. 맵 데이터와, 씬의 오브젝트 모두 삭제됩니다.
   * @param id 제거하고자 하는 바닥 타일의 고유값입니다.
   */
  eraseFloor(id: string): void {
    this.map.removeFloorTile(id)
  }

  /**
   * 설치된 오디오를 제거합니다. 맵 데이터와, 씬의 오브젝트 모두 삭제됩니다.
   * @param id 제거하고자 하는 오디오의 고유값입니다.
   */
  eraseAudio(id: string): void {
    this.children.list.filter((gameObject) => {
      // 오디오 객체가 아닌 게임 오브젝트 제외
      if ( !(gameObject instanceof PreviewAudioVisualizer) ) {
        return false
      }
      // 삭제하고자 하는 사운드가 배치된 위치가 다른 오디오 제외
      if (gameObject.name !== id) {
        return false 
      }
      return true
    }).forEach((audio) => {
      audio.destroy()
    })
  }

  /**
   * 선택된 맵 오브젝트를 선택 취소합니다.
   * 선택된 틴트 색이 제거됩니다.
   */
  private unselectObjects(): void {
    for (const object of this.select.selects) {
      const item = object as FillableObject
      item.clearTint()
    }
    this.select.unselect()
  }

  /**
   * 페인트의 키를 기반으로 에셋의 사이드 크기를 계산하여 가져옵니다.
   * 만일 해당 키를 가지고 있는 에셋이 없다면 0을 반환합니다.
   * @param key 에셋의 키입니다.
   */
  getTextureSideFromKey(key: string): number {
    let width: number
    let height: number

    const paint = this.getPaint(key)

    switch (this.getPaletteType(key)) {
      // 이미지 파렛트일 경우
      case 1: {
        if (paint === null) {
          return 0
        }
        const image = paint as PaletteImageAsset
        const texture = this.textures.get(image.key)
        
        // 만일 일치하는 텍스쳐가 오류를 포함해 로드되지 않았거나, 누락되었을 경우 0을 반환합니다.
        if (!texture) {
          return 0
        }

        width = texture.source[0].width
        height = texture.source[0].height

        // 가로, 세로 너비 중 하나라도 0일 경우, 오류로 판단합니다. 이미지의 크기는 0이 될 수 없기 때문입니다.
        if (!width || !height) {
          return 0
        }
        break
      }
      // 스프라이트 파렛트일 경우
      case 2: {
        if (paint === null) {
          return 0
        }
        const sprite = paint as PaletteSpriteAsset
        width = sprite.frameWidth
        height = sprite.frameHeight
        break
      }
      // 오디오 파렛트일 경우
      case 3: {
        width = 30
        height = 30
        break
      }
      // 그 외 오류일 경우
      default: {
        width = 0
        height = 0
      }
    }

    const halfWidth = width / 2

    const rad = Phaser.Math.DegToRad(26.57)
    const cosSide = Math.cos(rad)

    const cursorSide = halfWidth / cosSide
    return cursorSide
  }

  /**
   * 현재 배치모드라면, 선택된 페인트의 크기에 맞는 커서 크기를 반환합니다.
   * 그렇지 않다면 0을 반환합니다.
   */
  private get cursorSize(): number {
    if (this.disposeType === 0) {
      return 0
    }

    if (!this.selectedPaint) {
      return 0
    }

    return this.getTextureSideFromKey(this.selectedPaint.key)
  }

  private setCameraControl(): void {
    // 카메라 설정
    const camera = this.cameras.main
    const acceleration = 0.05
    const drag = 0.0005
    const maxSpeed = 1

    this.cameraControl = new Phaser.Cameras.Controls.SmoothedKeyControl({
      camera,
      left:       this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false),
      right:      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false),
      up:         this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false),
      down:       this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false),
      zoomIn:     this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q, false),
      zoomOut:    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E, false),
      acceleration,
      drag,
      maxSpeed
    })

    camera.pan(0, 0, 0)
  }

  private updateCamera(delta: number): void {
    this.cameraControl?.update(delta)
    
    // 카메라 축소/확대 최대치 설정
    if (this.cameras.main.zoom < 0.25)  this.cameras.main.zoom = 0.25
    if (this.cameras.main.zoom > 1)     this.cameras.main.zoom = 1
  }

  private updateKeyboard(_delta: number): void {
    if (this.upKey?.isDown) {
      this.moveSelectedMapObject(0, -1)
    }
    if (this.downKey?.isDown) {
      this.moveSelectedMapObject(0, 1)
    }
    if (this.leftKey?.isDown) {
      this.moveSelectedMapObject(-1, 0)
    }
    if (this.rightKey?.isDown) {
      this.moveSelectedMapObject(1, 0)
    }
  }

  private moveSelectedMapObject(addX: number, addY: number): void {
    this.select.selects.forEach((gameObject) => {
      const selected = gameObject as Phaser.GameObjects.GameObject&Phaser.GameObjects.Components.Transform
      selected.x += addX
      selected.y += addY
    })
  }

  /**
   * 월드의 맵 크기를 설정합니다. 이는 한 변의 길이를 의미합니다.
   * @param side 한 변의 길이입니다. 단위는 `px`입니다.
   */
  setMapSize(side: number): void {
    this.map.setWorldSize(side)
  }

  /**
   * 월드에 배치할 페인트를 지정합니다. 그리고 이후 마우스를 클릭하여 월드에 해당 페인트를 배치할 수 있습니다.
   * @param paint 페인트 정보입니다.
   */
  setDisposePaint(paint: PalettePaintAsset|null): void {
    this.unselectObjects()
    
    this.selectedPaint = paint
    this.select.enable(false)

    if (this.disposeType === 0) {
      this.cursor.enable(false)
      this.select.enable(false)
      return
    }

    if (paint === null) {
      this.cursor.enable(false)
      this.select.enable(true)
      return
    }

    this.cursor.enable(true)
    this.cursor.setGridSide(this.cursorSize)
  }

  /**
   * 월드에 배치할 페인트의 타입입니다. 벽, 바닥타일, 오디오 등을 의미합니다. `selectedPaint`로 지정된 페인트가 어떤 타입으로 배치될 것인지를 지정하기 위함입니다.
   * @param type 페인트의 타입입니다.
   */
  setDisposeType(type: number): void {
    this.disposeType = type

    // 배치 타입을 변경하면 이전에 선택했던 리스트를 전부 복구합니다.
    this.unselectObjects()

    if (this.disposeType === 0) {
      this.cursor.enable(false)
      this.select.enable(false)
    }
    else {
      if (!this.selectedPaint) {
        this.select.enable(true)
      }
      else {
        this.select.enable(false)
      }
    }
  }
}