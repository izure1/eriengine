<template>
    <section>
        <section
            @click.left="onMouseLeftButtonClick"
            @click.right="onMouseRightButtonClick"
            ref="game-canvas"
            class="game-canvas"
        />

        <v-toolbar
            class="canvas-toolbar ma-5"
            dark
            floating
            dense
        >

            <v-btn
                v-for="(button, i) in buttons"
                :key="`canvas-toolbar-btn-${i}`"
                icon
            >
                <v-menu
                    dark
                    offset-y
                    open-on-hover
                >
                    <template v-slot:activator="menu">
                        <v-tooltip top>
                            <template v-slot:activator="tooltip">
                                <div v-on="menu.on">
                                    <div v-on="tooltip.on">
                                        <v-btn
                                            :color="isSelectedButton(button) ? '#00FF00' : 'white'"
                                            icon
                                        >
                                            <v-icon>{{ button.icon }}</v-icon>
                                        </v-btn>
                                    </div>
                                </div>
                            </template>
                            <span class="caption">{{ button.description }}</span>
                        </v-tooltip>
                    </template>
                    <v-list
                        v-if="button.lists.length"
                        dense
                        light
                    >
                        <v-list-item
                            v-for="(list, i) in button.lists"
                            :key="`canvas-toolbar-btn-list-${i}`"
                            class="pa-0"
                        >
                            <v-btn
                                @click="list.click(button)"
                                width="100%"
                                class="text-sm-caption"
                                text
                            >
                                <div class="text-left">{{ list.text }}</div>
                                <v-spacer />
                            </v-btn>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-btn>
            
        </v-toolbar>

        <v-toolbar
            class="canvas-toolbar ma-5"
            dark
            floating
            dense
        >

            <v-btn
                :disabled="!selectionType"
                icon
            >
                <v-menu
                    dark
                    offset-y
                    open-on-hover
                >
                    <template v-slot:activator="menu">
                        <v-tooltip top>
                            <template v-slot:activator="tooltip">
                                <div v-on="menu.on">
                                    <div v-on="tooltip.on">
                                        <v-btn icon>
                                            <v-icon>mdi-format-paint</v-icon>
                                        </v-btn>
                                    </div>
                                </div>
                            </template>
                            <span class="caption">칠할 브러쉬를 선택합니다</span>
                        </v-tooltip>
                    </template>
                    <v-list
                        v-if="palettes.length"
                        dense
                        light
                    >
                        <v-list-item
                            v-for="(brush, i) in palettes"
                            :key="`canvas-brush-list-${i}`"
                            class="pa-0"
                        >
                            <v-btn
                                @click="setDisposeBrush(brush)"
                                width="100%"
                                class="text-sm-caption"
                                text
                            >
                                <div class="text-left">{{ getBrushKey(brush.key) }}</div>
                                <v-spacer />
                            </v-btn>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-btn>

            <v-btn
                v-if="isSaving"
                :loading="isSaving"
                :disabled="isSaving"
                text
            >
                저장 중...
            </v-btn>
            
        </v-toolbar>

        <v-card
            v-if="isContextmenuOpen"
            max-width="200"
            :style="{
                left: `${contextmenuOffset.x}px`,
                top: `${contextmenuOffset.y}px`
            }"
            dark
            tile
            flat
        >
            <v-list dense>
                <v-list-item
                    v-for="(contextmenu, i) in contextmenus"
                    :key="`contextmenu-item-${i}`"
                    @click="contextmenu.click"
                >
                    <v-list-item-content>
                        <v-list-item-title>{{ contextmenu.text }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-card>

        <v-dialog
            v-model="isPropertiesOpen"
            :persistent="isPropertiesOpen"
            max-width="450"
        >
            <v-card>
                <v-card-title>속성</v-card-title>
                <v-card-text>

                    <v-subheader>별칭</v-subheader>
                    <p class="text-caption">
                        별칭을 정합니다. 프로그래밍에서 이용됩니다.
                    </p>
                    <v-text-field
                        v-model="propertyAlias"
                        @keydown.stop
                        type="text"
                        filled
                        rounded
                        dense
                    />
                    
                    <v-divider />
                    <v-subheader>비율</v-subheader>
                    <p class="text-caption">
                        가로세로비를 유지한 채 크기를 조절합니다.
                    </p>
                    <v-text-field
                        v-model="propertyScale"
                        @keydown.stop
                        :rules="[ propertyOnlyPositiveNumber ]"
                        type="number"
                        filled
                        rounded
                        dense
                    />

                    <v-divider />
                    <v-subheader>센서</v-subheader>
                    <p class="text-caption">
                        실제로 충돌하지 않지만, 이벤트를 얻어낼 수 있습니다.
                        <br>
                        이는 지역에 들어오면 작동을 하도록 프로그래밍하는데 사용됩니다.
                    </p>
                    <v-switch
                        v-model="propertyIsSensor"
                        label="센서"
                        inset
                        dense
                    />

                </v-card-text>
                <v-divider />
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="savePropertiesSetting">완료</v-btn>
                    <v-btn text @click="closePropertiesSetting">취소</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog
            v-model="isBuilding"
            :persistent="isBuilding"
            max-width="500"
            scrollable
        >
            <v-card :loading="isBuilding && !isBuiltFail">

                <div v-if="!isBuiltFail">
                    <v-card-title>씬 파렛트 준비 중</v-card-title>
                    <v-card-subtitle>필요한 내용을 준비하는 중입니다. 잠시만 기다려주세요.</v-card-subtitle>
                </div>
                <div v-else>
                    <v-card-title class="red--text">씬 파렛트 준비 실패</v-card-title>
                    <v-card-subtitle>
                        빌드 도중 오류가 발생했습니다.
                        <br>
                        아래 내용을 기반으로 오류를 수정해주세요.
                    </v-card-subtitle>
                </div>

                <v-card-text>
                    <channel-component channel="build" />
                </v-card-text>

                <div v-if="isBuilding && isBuiltFail">
                    <v-divider />
                    <v-card-actions>
                        <v-spacer />

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    @click="goBack('씬 준비에 실패했습니다')"
                                    v-on="on"
                                    icon
                                >
                                    <v-icon>mdi-arrow-left</v-icon>
                                </v-btn>
                            </template>
                            <span>뒤로가기</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    @click="start"
                                    v-on="on"
                                    icon
                                >
                                    <v-icon>mdi-refresh</v-icon>
                                </v-btn>
                            </template>
                            <span>재시도</span>
                        </v-tooltip>

                        <v-spacer />
                    </v-card-actions>
                </div>

            </v-card>
        </v-dialog>

        <v-dialog
            v-model="isTooltipOpen"
            max-width="800"
        >
            <v-card>
                <v-card-title>기본 사용법</v-card-title>
                <v-card-subtitle>
                    씬 에디터를 이용하여 씬을 GUI 환경에서 디자인할 수 있습니다.
                    <br>
                    만들어둔 스프라이트나 이미지, 액터 데이터를 사용합니다.
                </v-card-subtitle>
                <v-card-text>
                    <v-list>
                        <v-list-item>
                            <v-list-item-content>
                                <v-list-item-title>화면 이동</v-list-item-title>
                                <v-list-item-subtitle>키보드 W, A, S, D 키를 이용하여 화면을 움직이세요</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-content>
                                <v-list-item-title>확대/축소</v-list-item-title>
                                <v-list-item-subtitle>키보드 Q, R 키를 이용하여 확대/축소할 수 있습니다</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-content>
                                <v-list-item-title>Shift키 사용</v-list-item-title>
                                <v-list-item-subtitle>키보드 Shift키를 이용하여 직선으로 설치할 수 있습니다</v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                            <v-list-item-content>
                                <v-list-item-title>맵의 경계</v-list-item-title>
                                <v-list-item-subtitle>
                                    <p>
                                        씬의 맵 크기에는 한계가 있습니다. 큰 맵은 성능 저하를 유발합니다.
                                        <br>
                                        일반적으로 1000 ~ 3000이 적당합니다.
                                    </p>
                                    <p>
                                        경계는 파란선으로 보이며, 다이아몬드(◇) 모양으로 되어 있습니다. 이 내부를 꾸미세요.
                                    </p>
                                </v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog
            v-model="isMapResizerOpen"
            max-width="500"
        >
            <v-card>
                <v-card-title>맵의 크기를 지정하세요</v-card-title>
                <v-card-subtitle>맵의 한 변의 크기를 지정합니다. 큰 맵은 성능 저하를 유발합니다.</v-card-subtitle>
                <v-card-text>
                    <v-text-field
                        v-model="mapSceneSide"
                        type="number"
                        filled
                        rounded
                        suffix="px"
                    />
                </v-card-text>
            </v-card>
        </v-dialog>
        
    </section>
</template>

<script lang="ts">
import path from 'path';
import normalize from 'normalize-path';
import Phaser from 'phaser';
import { ipcRenderer } from 'electron';
import { Vue, Component, Watch } from 'vue-property-decorator';
import { getStorageKeyFromFilename } from '@/Utils/getStorageKeyFromFilename';
import NonReactivity from 'vue-nonreactivity-decorator';

import PreviewScene from './Phaser/PreviewScene';
import GuiScene from './Phaser/GuiScene';
import createConfig from './Phaser/createConfig';

import ChannelComponent from '@/Renderer/components/Shell/Channel.vue';
import * as Types from './Phaser/Vars/Types';
import {
    PROJECT_SRC_DATA_DIRECTORY_NAME,
    PROJECT_SRC_DIRECTORY_NAME
} from '@/Const';


interface ActionList {
    text: string
    click: (button: ActionButton) => void
}

interface ActionButton {
    icon: string
    description: string
    lists: ActionList[]
}

type Rule = (v: string) => string|boolean;

@Component({
    components: {
        ChannelComponent
    }
})
export default class SceneMapEditor extends Vue {
    @NonReactivity(null) private game!: Phaser.Game|null;
    @NonReactivity(null) private scene!: PreviewScene|null;

    private isSaving: boolean = false;
    private isBuilding: boolean = false;
    private isBuiltFail: boolean = false;
    private isTooltipOpen: boolean = false;
    private isMapResizerOpen: boolean = false;
    private isContextmenuOpen: boolean = false;
    private isPropertiesOpen: boolean = false;

    private contextmenuOffset: Types.Point2 = { x: 0, y: 0 };
    private propertyAlias: string = '';
    private propertyIsSensor: boolean = false;
    private propertyScale: number = 1;

    private propertyOnlyPositiveNumber: Rule = (v: string) => {
        const n: any = v;
        if (isNaN(n)) {
            return '숫자만 입력할 수 있습니다';
        }
        if (Number(n) <= 0) {
            return '0보다 큰 수만 입력할 수 있습니다';
        }
        return true;
    }

    private paletteImages: Types.PaletteImage[]   = [];
    private paletteSprites: Types.PaletteSprite[] = [];
    private paletteBrush: Types.PaletteImage|null = null;

    private selectionButton: ActionButton|null = null;
    private selectionType: number = 0;
    private disposeBrush: Types.PaletteImage|Types.PaletteSprite|null = null;
    private mapSceneSide: number = 2000;

    private buttons: ActionButton[] = [
        {
            icon: 'mdi-cogs',
            description: '씬을 설정합니다',
            lists: [
                {
                    text: '맵 크기 설정',
                    click: (): void => {
                        this.openMapResizer();
                    }
                },
                {
                    text: '저장하기',
                    click: (): void => {
                        this.save();
                    }
                }
            ]
        },
        {
            icon: 'mdi-wall',
            description: '액터가 지나갈 수 없는 벽을 설치합니다',
            lists: [
                {
                    text: '벽 편집하기',
                    click: (button): void => {
                        this.setSelectionButton(button);
                        this.setSelectionType(2);
                    }
                }
            ]
        },
        {
            icon: 'mdi-floor-plan',
            description: '바닥 타일을 설치합니다',
            lists: [
                {
                    text: '바닥 타일 편집하기',
                    click: (button): void => {
                        this.setSelectionButton(button);
                        this.setSelectionType(3);
                    }
                }
            ]
        },
        {
            icon: 'mdi-help',
            description: '툴팁을 엽니다',
            lists: [
                {
                    text: '기본 사용법',
                    click: (): void => {
                        this.openTooltip();
                    }
                }
            ]
        }
    ]

    private contextmenus: ActionList[] = [
        {
            text: '속성',
            click: (): void => {
                this.closeContextmenu()
                if (!this.isSelectionType(2)) {
                    this.$store.dispatch('snackbar', '속성은 벽 타일만 사용할 수 있습니다');
                    return;
                }
                this.openPropertiesSetting()
            }
        },
        {
            text: '삭제',
            click: (): void => {
                this.closeContextmenu();
                this.requestDeleteSelection();
            }
        }
    ]

    private get filePath(): string {
        return decodeURIComponent(this.$route.params.filePath);
    }

    private get storageKey(): string {
        return getStorageKeyFromFilename(this.filePath);
    }

    private get projectDirectory(): string {
        return this.$store.state.projectDirectory;
    }

    private get projectConfig(): Engine.GameProject.Config {
        return this.$store.state.projectConfig;
    }

    private get canvasParent(): HTMLElement {
        return this.$refs['game-canvas'] as HTMLElement;
    }

    private get palettes(): (Types.PaletteImage|Types.PaletteSprite)[] {
        return [
            ...Object.values(this.paletteSprites) as Types.PaletteSprite[],
            ...Object.values(this.paletteImages) as Types.PaletteImage[]
        ];
    }

    private goBack(message: string): void {
        this.$store.dispatch('snackbar', message);
        this.$router.replace('/manager/scene').catch(() => null);
    }

    private async createGame(): Promise<void> {
        const [ width, height ] = this.projectConfig.gameDisplaySize;

        const previewScene: PreviewScene = new PreviewScene(this.projectDirectory, this.storageKey);
        const config = createConfig(width, height, [ previewScene, GuiScene ], this.canvasParent);

        this.game   = new Phaser.Game(config);
        this.scene  = previewScene;

        this.scene.transfer.emit('receive-image-list', this.paletteImages);
        this.scene.transfer.emit('receive-sprite-list', this.paletteSprites);

        this.scene.transfer
        .on('load-map-fail', (message: string): void => {
            this.goBack(message)
        })
        .on('load-map-success', (map: Engine.GameProject.SceneMap): void => {
            this.mapSceneSide = map.side
        })
        .on('save-map-fail', (message: string): void => {
            this.isSaving = false
            this.$store.dispatch('snackbar', message)
        })
        .on('save-map-success', (): void => {
            this.isSaving = false
            this.$store.dispatch('snackbar', '저장되었습니다!')
        });

        this.resizeCanvas();
    }

    private destroyGame(): void {
        if (!this.game) {
            return;
        }

        const sceneKeys: string[] = [ ...this.game.plugins.scenePlugins ];
        for (const sceneKey of sceneKeys) {
            this.game.plugins.removeScenePlugin(sceneKey);
        }

        this.game.destroy(true);
        this.game = null;
        this.scene = null;
    }


    private openTooltip(): void {
        this.isTooltipOpen = true;
    }

    private openMapResizer(): void {
        this.isMapResizerOpen = true;
    }

    private openContextmenu(e: MouseEvent): void {
        if (this.disposeBrush) {
            return;
        }

        const appbarHeight: number = 64;
        const fixedHeight: number = 30;
        const { offsetX, offsetY } = e;

        this.contextmenuOffset.x = offsetX;
        this.contextmenuOffset.y = offsetY - (appbarHeight + fixedHeight);
        this.isContextmenuOpen = true;
    }

    private closeContextmenu(): void {
        this.isContextmenuOpen = false;
    }

    private openPropertiesSetting(): void {
        if (!this.selectionType) {
            return;
        }

        if (!this.scene) {
            return;
        }
        
        let alias: string;
        let scale: number;
        let isSensor: boolean;

        const size: number = this.scene.selectionWalls.size;
        if (size === 0) {
            this.$store.dispatch('snackbar', '먼저 대상을 선택해주세요');
            return;
        }

        else {
            const std = [ ...this.scene.selectionWalls ][0];
            let isOverlap: boolean = true;

            for (const wall of this.scene.selectionWalls) {
                if (wall.data.get('alias') !== std.data.get('alias')) {
                    isOverlap = false;
                    break;
                }
                if (wall.scale !== std.scale) {
                    isOverlap = false;
                    break;
                }
                if (wall.isSensor() !== std.isSensor()) {
                    isOverlap = false;
                    break;
                }
            }

            // 선택된 모든 오브젝트의 속성이 완벽히 겹칠 경우
            if (isOverlap) {
                alias       = std.data.get('alias') ?? '';
                scale       = std.scale;
                isSensor    = std.isSensor();
            }
            // 하나의 오브젝트의 속성이라도 일치하지 않을 경우 기본값 보여주기
            else {
                alias       = '';
                scale       = 1;
                isSensor    = false;
            }
        }

        this.propertyAlias      = alias;
        this.propertyScale      = scale;
        this.propertyIsSensor   = isSensor;

        this.isPropertiesOpen   = true;
    }

    private savePropertiesSetting(): void {
        if (!this.scene) {
            return;
        }

        this.scene.transfer.emit('receive-wall-properties', {
            alias: this.propertyAlias,
            scale: this.propertyScale,
            isSensor: this.propertyIsSensor
        });

        this.closePropertiesSetting();
    }

    private closePropertiesSetting(): void {
        this.isPropertiesOpen = false;
    }


    private resizeCanvas(): void {
        if (!this.game) {
            return;
        }

        const { width, height }     = getComputedStyle(this.canvasParent);
        const clientWidth: number   = parseFloat(width);
        const clientHeight: number  = parseFloat(height);
        
        this.game.scale.setGameSize(clientWidth, clientHeight);
    }

    private watchResizeWindow(): void {
        window.addEventListener('resize', this.resizeCanvas);
    }

    private unwatchResizeWindow(): void {
        window.removeEventListener('resize', this.resizeCanvas);
    }

    private onMouseLeftButtonClick(e: MouseEvent): void {
        this.closeContextmenu();
    }

    private onMouseRightButtonClick(e: MouseEvent): void {
        this.openContextmenu(e);
        this.setDisposeBrush(null);
    }

    private save(): void {
        if (!this.scene) {
            return;
        }
        if (this.isSaving) {
            return;
        }

        this.isSaving = true;
        this.scene.transfer.emit('receive-save-request');
    }

    private checkKeyExists(): boolean {
        if (!this.storageKey) {
            this.$router.replace('/manager/scene').catch(() => null);
            return false;
        }
        return true;
    }

    private isSelectedButton(button: ActionButton): boolean {
        return button === this.selectionButton;
    }

    private setSelectionButton(button: ActionButton): void {
        this.selectionButton = button;
    }

    private setSelectionType(type: number): void {
        if (!this.scene) {
            return;
        }
        this.selectionType = type;
        this.scene.transfer.emit('receive-selection-type', type);
    }

    private isSelectionType(...types: number[]): boolean {
        let ret: boolean = false;
        for (const type of types) {
            if (type === this.selectionType) {
                return true;
            }
        }
        return false;
    }

    private setDisposeBrush(brush: Types.PaletteImage|Types.PaletteSprite|null): void {
        if (!this.scene) {
            return;
        }
        this.disposeBrush = brush;
        this.scene.transfer.emit('receive-dispose-brush', brush);
    }

    private getBrushKey(key: string): string {
        const cwd: string = normalize(path.join(PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME));
        return normalize(path.relative(cwd, key));
    }

    private setMapSide(side: number): void {
        if (!this.scene) {
            return;
        }
        this.scene.transfer.emit('receive-map-side', this.mapSceneSide);
    }

    private requestDeleteSelection(): void {
        if (!this.scene) {
            return;
        }
        this.scene.transfer.emit('receive-delete-selection');
    }

    private async start(): Promise<void> {
        this.isBuilding = false;
        this.isBuiltFail = false;

        if (!this.checkKeyExists()) {
            return;
        }

        this.isBuilding = true;

        const built: Engine.GameProject.GeneratePreviewListSuccess|Engine.GameProject.GeneratePreviewListFail = await ipcRenderer.invoke('build-gen', this.projectDirectory);
        if (!built.success) {
            this.isBuiltFail = true;
            return;
        }

        try {

            const spriteModulePath: string = path.resolve(built.path, 'sprite.js');
            const imageModulePath: string = path.resolve(built.path, 'image.js');

            // 모듈 캐시 삭제
            delete __non_webpack_require__.cache[__non_webpack_require__.resolve(spriteModulePath)];
            delete __non_webpack_require__.cache[__non_webpack_require__.resolve(imageModulePath)];

            const spriteModule  = __non_webpack_require__(spriteModulePath);
            const imageModule   = __non_webpack_require__(imageModulePath);

            this.paletteSprites = Object.values(spriteModule) as Types.PaletteSprite[];
            this.paletteImages  = Object.values(imageModule) as Types.PaletteImage[];

        } catch(e) {
            this.isBuiltFail = true;
            return;
        }

        this.isBuilding = false;
        this.isBuiltFail = false;

        this.createGame();
        this.openTooltip();
        this.watchResizeWindow();
    }


    @Watch('mapSceneSide')
    private onChanageMapSceneSide(): void {
        this.setMapSide(this.mapSceneSide);
    }

    mounted(): void {
        this.start();
    }

    beforeDestroy(): void {
        this.unwatchResizeWindow();
        this.destroyGame();
    }
}
</script>

<style lang="scss" scoped>
.game-canvas {
    width: 100%;
    height: calc(100vh - 64px);
    position: absolute;
    top: 64px;
    left: 0;
}

.canvas-toolbar {
    background: transparent !important;
    box-shadow: 0 0 0 !important;
}
</style>