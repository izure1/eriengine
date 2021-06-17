import path from 'path'
import Phaser from 'phaser'
import { ipcRenderer } from 'electron'
import { Plugin as ActorPlugin } from '@eriengine/plugin-actor'
import { DialoguePlugin } from '@eriengine/plugin-dialogue'
import { Plugin as FogOfWarPlugin } from '@eriengine/plugin-fog-of-war'
import { Plugin as IsometricScenePlugin } from '@eriengine/plugin-isometric-scene'
import { PointerPlugin as IsometricCursorPlugin, SelectPlugin as IsometricSelectPlugin } from '@eriengine/plugin-isometric-cursor'

import * as Types from './Vars/Types'
import { SceneDataTransfer } from './_SceneDataTransfer'
import { SceneMapManager } from './_SceneMapManager'

import {
  PROJECT_SRC_DIRECTORY_NAME,
  PROJECT_SRC_ASSET_DIRECTORY_NAME
} from '@/Const'

export default class PreviewScene extends Phaser.Scene {
  private isometric!: IsometricScenePlugin
  private cursor!: IsometricCursorPlugin
  private select!: IsometricSelectPlugin
  private actor!: ActorPlugin
  private fow!: FogOfWarPlugin
  private dialogue!: DialoguePlugin

  readonly transfer: SceneDataTransfer = new SceneDataTransfer
  readonly map: SceneMapManager = new SceneMapManager({ side: 2000, walls: [], floors: [], audios: [] })

  private projectDirectory: string = ''
  private storageKey: string = ''
  private cameraControl: Phaser.Cameras.Controls.SmoothedKeyControl|null = null

  private requireImages:  Types.PaletteImageAsset[] = []
  private requireSprites: Types.PaletteSpriteAsset[] = []
  private disposeBrush: Types.PaletteImageAsset|Types.PaletteSpriteAsset|null = null

  private shiftKey: Phaser.Input.Keyboard.Key|null = null

  private dragStartOffset: Types.Point2 = { x: 0, y: 0 }
  private selectionType: number = 0
  readonly selectionWalls: Set<Phaser.Physics.Matter.Sprite> = new Set
  readonly selectionFloors: Set<Phaser.GameObjects.Sprite> = new Set

  constructor(projectDirectory: string, storageKey: string) {
    super({ key: '__preview-scene__', active: false })

    this.projectDirectory = projectDirectory
    this.storageKey = storageKey

    this.transfer
    .on('receive-image-list', (list): void => {
      this.requireImages = list
    })
    .on('receive-sprite-list', (list): void => {
      this.requireSprites = list
    })
  }

  private get assetDirectory(): string {
    return path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME)
  }

  private get isDisposeEnable(): boolean {
    if (!this.selectionType) {
      return false
    }
    if (!this.disposeBrush) {
      return false
    }
    if (!this.textures.exists(this.disposeBrush.key)) {
      return false
    }
    return true
  }

  private get cursorSide(): number {
    if (!this.isDisposeEnable) {
      return 0
    }

    let width: number
    let height: number

    if (this.isAnimationPalette(this.disposeBrush!.key)) {
      const brush: Types.PaletteSpriteAsset = this.disposeBrush as Types.PaletteSpriteAsset
      width   = brush.frameWidth
      height  = brush.frameHeight
    }
    else {
      const texture = this.textures.get(this.disposeBrush!.key)
      if (!texture) {
        return 0
      }
      width = texture.source[0].width
      height = texture.source[0].height

      if (!width || !height) {
        return 0
      }
    }

    return this.getIsometricSideFromWidth(width / 2)
  }

  private getPaletteFromKey(key: string): Types.PaletteImageAsset|Types.PaletteSpriteAsset|null {
    const map: Map<string, Types.PaletteImageAsset|Types.PaletteSpriteAsset> = new Map

    for (const image of this.requireImages) {
      map.set(image.key, image)
    }
    for (const sprite of this.requireSprites) {
      map.set(sprite.key, sprite)
    }

    if (!map.has(key)) {
      return null
    }
    
    return map.get(key)!
  }

  private isAnimationPalette(key: string): boolean {
    const palette: Types.PaletteImageAsset|Types.PaletteSpriteAsset|null = this.getPaletteFromKey(key)
    if (!palette) {
      return false
    }
    return Object.prototype.hasOwnProperty.call(this.getPaletteFromKey(key)!, 'frameWidth')
  }

  private setCameraMoving(): void {
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

  private setSelectionType(type: number): void {
    this.selectionType = type
    this.unselectObjects()
  }

  private setDisposeBrush(brush: Types.PaletteImageAsset|Types.PaletteSpriteAsset|null): void {
    this.disposeBrush = brush

    if (!this.selectionType) {
      this.select.enable(false)
    }
    else {
      this.select.enable(!brush)
    }
  }

  private updateDisposeCursor(): void {
    this.cursor.enable(false)
    if (!this.isDisposeEnable) {
      return
    }
    this.cursor.enable(true)
    this.cursor.setGridSide(this.cursorSide)
  }

  private getDiagonal(width: number, height: number): number {
    return Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))
  }

  private getIsometricSideFromWidth(width: number): number {
    const rad = Phaser.Math.DegToRad(26.57)
    return width / Math.cos(rad)
  }

  private unselectObjects(): void {
    this.select.unselect()

    for (const wall of this.selectionWalls) {
      wall.clearTint()
    }
    for (const floor of this.selectionFloors) {
      floor.clearTint()
    }

    this.selectionWalls.clear()
    this.selectionFloors.clear()
  }

  private selectObjects(e: Phaser.Input.Pointer, selection: Types.Rect): void {
    if (!this.selectionType) {
      return
    }
    if (this.disposeBrush) {
      return
    }

    const fillColor = Phaser.Display.Color.GetColor(255, 0, 0)

    switch (this.selectionType) {
      case 1:
        break
      case 2: {
        const walls: Phaser.Physics.Matter.Sprite[] = this.select.select(selection, this.isometric.walls) as Phaser.Physics.Matter.Sprite[]
        for (const wall of walls) {
          wall.setTint(fillColor)
          this.selectionWalls.add(wall)
        }
        break
      }
      case 3: {
        const floors: Phaser.GameObjects.Sprite[] = this.select.select(selection, this.isometric.floors) as Phaser.GameObjects.Sprite[]
        for (const floor of floors) {
          floor.setTint(fillColor)
          this.selectionFloors.add(floor)
        }
        break
      }
    }
  }

  private deleteSelectionObjects(): void {
    this.selectionWalls.forEach((wall): void => {
      this.map.dropWallData(wall)
      wall.destroy()
    })

    this.selectionFloors.forEach((floor): void => {
      this.map.dropFloorData(floor)
      floor.destroy()
    })

    this.selectionWalls.clear()
    this.selectionFloors.clear()
  }

  private setWallProperties(wall: Phaser.Physics.Matter.Sprite, { alias, scale, isSensor }: Types.PaletteProperties): void {
    scale = Number(scale)
    isSensor = Boolean(isSensor)

    // 올바르지 않은 값이 넘어왔을 경우 객체를 삭제하고 데이터에서도 제거함
    if (isNaN(scale) || typeof scale !== 'number') {
      this.map.dropWallData(wall)
      wall.destroy()
      return
    }

    wall.setScale(scale)
    wall.setSensor(isSensor)
    wall.data.set('alias', alias)

    this.map.modifyWallData(wall)
  }

  private calcStraightDisposeOffset(x: number, y: number): Types.Point2 {
    const startOffset = this.cursor.calcCursorOffset(this.dragStartOffset)
    const distanceX = x - startOffset.x
    const distanceY = y - startOffset.y
    
    let deg: number
    const distance = this.getDiagonal(distanceX, distanceY)

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

    x = startOffset.x + offset.x
    y = startOffset.y + offset.y

    return { x, y }
  }

  private dispose(x: number, y: number, type: number, brushKey: string, insertData: boolean = true): Phaser.GameObjects.GameObject|null {
    if (!this.getPaletteFromKey(brushKey)) {
      return null
    }

    let animsKey: string|undefined = undefined

    if (this.isAnimationPalette(brushKey)) {
      animsKey = brushKey
    }

    switch (type) {
      case 1:
        break
      
      case 2: {
        const wall = this.isometric.setWalltile(x, y, brushKey, undefined, animsKey)
        wall.setDataEnabled()
        if (insertData) {
          this.map.insertWallData(wall)
        }
        return wall
      }

      case 3: {
        const floor = this.isometric.setFloortile(x, y, brushKey, undefined, animsKey)
        if (insertData) {
          this.map.insertFloorData(floor)
        }
        return floor
      }
    }

    return null
  }

  private updateCamera(delta: number): void {
    this.cameraControl?.update(delta)
    
    // 카메라 축소/확대 최대치 설정
    if (this.cameras.main.zoom < 0.25)  this.cameras.main.zoom = 0.25
    if (this.cameras.main.zoom > 1)     this.cameras.main.zoom = 1
  }

  private destroyCamera(): void {
    this.cameraControl?.destroy()
  }

  private generateAnimation(): void {
    for (const anims of this.requireSprites) {
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

  private updateDragStartOffset({ worldX, worldY }: Phaser.Input.Pointer): void {
    this.dragStartOffset = { x: worldX, y: worldY }
  }

  private onMouseLeftDown(e: Phaser.Input.Pointer): void {
    this.updateDragStartOffset(e)

    // dispose brush
    if (this.disposeBrush) {
      let { x, y } = this.cursor.calcCursorOffset({ x: e.worldX, y: e.worldY })
      if (e.event.shiftKey) {
        const offset = this.calcStraightDisposeOffset(x, y)
        x = offset.x
        y = offset.y
      }
      this.dispose(x, y, this.selectionType, this.disposeBrush.key)
    }
    if (!e.event.shiftKey) {
      this.unselectObjects()
    }
  }

  private onMouseLeftDrag(e: Phaser.Input.Pointer): void {
    // dispose brush
    if (this.disposeBrush) {
      let { x, y } = this.cursor.calcCursorOffset({ x: e.worldX, y: e.worldY })
      if (e.event.shiftKey) {
        const offset = this.calcStraightDisposeOffset(x, y)
        x = offset.x
        y = offset.y
      }
      this.dispose(x, y, this.selectionType, this.disposeBrush.key)
    }
  }

  private onMouseLeftUp(_e: Phaser.Input.Pointer): void {
  }
  
  private onMouseRightDown(_e: Phaser.Input.Pointer): void {
  }

  private onMouseRightUp(_e: Phaser.Input.Pointer): void {
  }

  private async generateMapData(): Promise<boolean> {
    const sceneMapRead: Engine.GameProject.ReadSceneMapSuccess|Engine.GameProject.ReadSceneMapFail = await ipcRenderer.invoke('read-scene-map', this.projectDirectory, this.storageKey)
    if (!sceneMapRead.success) {
      this.transfer.emit('load-map-fail', sceneMapRead.message)
      return false
    }

    const { side, walls, floors, audios } = sceneMapRead.content

    this.setWorldSize(side)

    const missingAssets: Set<string> = new Set

    for (const prop of walls) {
      const wall = this.dispose(prop.x, prop.y, 2, prop.key, false)
      // 맵데이터 파일에는 기록되어있지만, 에셋이 삭제되었을 경우 에셋을 목록에서 제거합니다.
      if (!wall) {
        missingAssets.add(prop.key)
        continue
      }
      // 벽의 정보를 설정합니다. 센서, 비율, 이름 등의 정보를 게임 오브젝트에 삽입합니다.
      // 이후 씬에서 우클릭으로 오브젝트를 선택했을 때, 해당 오브젝트에서 이 정보를 읽어옵니다.
      this.setWallProperties(wall as Phaser.Physics.Matter.Sprite, prop)
    }

    for (const prop of floors) {
      const floor = this.dispose(prop.x, prop.y, 3, prop.key, false)
      // 맵데이터 파일에는 기록되어있지만, 에셋이 삭제되었을 경우 에셋을 목록에서 제거합니다.
      if (!floor) {
        missingAssets.add(prop.key)
      }
    }

    // 읽어들인 원본 맵 데이터를 기반으로 씬 파렛트 맵 데이터 인스턴스 생성
    this.map.setData({ side, walls, floors, audios })
    this.transfer.emit('load-map-success', this.map, [...missingAssets.values()])

    return true
  }

  private attachMouseEvent(): void {
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (e: Phaser.Input.Pointer): void => {
      switch (e.button) {
        case 0:
          this.onMouseLeftDown(e)
          break
        case 2:
          this.onMouseRightDown(e)
          break
      }
    })

    this.input.on(Phaser.Input.Events.POINTER_UP, (e: Phaser.Input.Pointer): void => {
      switch (e.button) {
        case 0:
          this.onMouseLeftUp(e)
          break
        case 2:
          this.onMouseRightUp(e)
          break
      }
    })

    this.input.on(Phaser.Input.Events.POINTER_MOVE, (e: Phaser.Input.Pointer): void => {
      switch (e.buttons) {
        case 1:
          this.onMouseLeftDrag(e)
          break
      }
    })
  }

  private attachKeyboardEvent(): void {
    if (this.shiftKey) {
      this.shiftKey.destroy()
    }
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
  }

  private attachTransferEvent(): void {
    // 데이터 송수신 인스턴스 이벤트 할당
    this.transfer
    .on('receive-map-side', (side: number): void => {
      this.setWorldSize(side)
    })
    .on('receive-selection-type', (type: number): void => {
      this.setSelectionType(type)
      this.setDisposeBrush(this.disposeBrush)
      this.updateDisposeCursor()
    })
    .on('receive-dispose-brush', (brush: Types.PaletteImageAsset|Types.PaletteSpriteAsset|null): void => {
      this.setDisposeBrush(brush)
      this.updateDisposeCursor()
    })
    .on('receive-delete-selection', (): void => {
      this.deleteSelectionObjects()
    })
    .on('receive-wall-properties', (properties: Types.PaletteProperties): void => {
      for (const wall of this.selectionWalls) {
        this.setWallProperties(wall, properties)
      }
    })
    .on('receive-save-request', (): void => {
      this.save()
    })
    .on('receive-change-asset-path', (before: string, after: string): void => {
      this.changeAssetPath(before, after)
    })
    .on('receive-delete-asset', (assetPath: string): void => {
      this.deleteAssetPath(assetPath)
    })
  }

  private setWorldSize(side: number): void {
    this.map.modifySide(side)
    this.isometric.setWorldSize(side)
  }

  private async save(): Promise<void> {
    const mapData = this.map.data
    const mapWrite: Engine.GameProject.WriteSceneMapSuccess|Engine.GameProject.WriteSceneMapFail = await ipcRenderer.invoke('write-scene-map', this.projectDirectory, this.storageKey, mapData)
    if (!mapWrite.success) {
      this.transfer.emit('save-map-fail', mapWrite.message)
      return
    }
    this.transfer.emit('save-map-success', mapData)
  }

  private async changeAssetPath(before: string, after: string): Promise<void> {
    this.map.changeAssetPath(before, after)
  }

  private async deleteAssetPath(assetPath: string): Promise<void> {
    this.map.deleteAssetPath(assetPath)
  }

  init(): void {
    this.plugins.installScenePlugin('ActorPlugin', ActorPlugin, 'actor', this)
    this.plugins.installScenePlugin('IsometricScenePlugin', IsometricScenePlugin, 'isometric', this)
    this.plugins.installScenePlugin('IsometricCursorPlugin', IsometricCursorPlugin, 'cursor', this)
    this.plugins.installScenePlugin('IsometricSelectPlugin', IsometricSelectPlugin, 'select', this)
    this.plugins.installScenePlugin('FogOfWarPlugin', FogOfWarPlugin, 'fow', this)
  }

  preload(): void {
    this.load.setBaseURL(this.assetDirectory)
    for (const { key, asset } of this.requireImages) {
      this.load.image(key, asset)
    }
    for (const { key, asset, frameWidth, frameHeight } of this.requireSprites) {
      this.load.spritesheet(key, asset, { frameWidth, frameHeight })
    }
  }

  create(): void {
    this.generateMapData().then((success: boolean): void => {
      if (!success) {
        return
      }

      // 맵 파일 감지 시작
      this.generateAnimation()
      
      // 씬 기능 시작
      this.setCameraMoving()
      this.setSelectionType(0)
      this.setDisposeBrush(null)

      // 이벤트 할당
      this.attachMouseEvent()
      this.attachKeyboardEvent()
      this.attachTransferEvent()

      // 플러그인 설정
      this.cursor.enableCoordinate(true)
      this.select.enable(false)

      this.select.events.on('drag-end', this.selectObjects.bind(this))

      // gui 씬 생성
      this.scene.launch('__gui-scene__', this)
    })

    this.events.once(Phaser.Scenes.Events.DESTROY, this.onDestroy.bind(this))
  }

  update(time: number, delta: number): void {
    this.updateCamera(delta)
  }

  private onDestroy(): void {
    this.destroyCamera()
  }
}