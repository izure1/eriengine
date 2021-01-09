<template>
    <v-app>
        <v-app-bar
            elevation="1"
            color="blue-grey"
            fixed
            tile
        >
            <v-app-bar-nav-icon @click="isDrawerOpen = !isDrawerOpen" class="white--text"></v-app-bar-nav-icon>
            <v-app-bar-title>
                <v-btn
                    color="white"
                    class="subtitle-1"
                    text
                    @click="openPath(projectDirectory)"
                >
                    {{ projectName }}
                </v-btn>
            </v-app-bar-title>
        </v-app-bar>
        <v-navigation-drawer v-model="isDrawerOpen" fixed temporary class="py-3 px-1">
            <v-list subheader>
                <div
                    v-for="{ title, menus } in contextmenuGroups"
                    :key="`aside-contextmenu-${title}`"
                >
                    <v-subheader>{{ title }}</v-subheader>
                    <v-list-item
                        v-for="{ name, description, path } in menus"
                        :key="`aside-contextmenu-${title}-${name}`"
                        @click="showManager(path)"
                    >
                        <v-list-item-content class="ml-3">
                            <v-list-item-title class="overline">{{ name }}</v-list-item-title>
                            <v-list-item-subtitle class="caption">{{ description }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </div>
            </v-list>
        </v-navigation-drawer>
        <v-main>
            <router-view class="main-view" />
        </v-main>
    </v-app>
</template>

<script lang="ts">
import path from 'path'
import fs from 'fs-extra'
import { ipcRenderer, shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { FileWatcher } from '@/Utils/FileWatcher'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_ASSET_DIRECTORY_NAME,
    PROJECT_SRC_ASSETLIST_NAME,
    PROJECT_SRC_ANIMATION_DIRECTORY_NAME,
    PROJECT_SRC_SKILL_DIRECTORY_NAME
} from '@/Const'

interface ContextmenuGroup {
    title: string
    menus: Menu[]
}
type Menu = {
    name: string
    description: string
    path: string
};

@Component
export default class ProjectFileListComponent extends Vue {
    private isDrawerOpen: boolean = false
    private contextmenuGroups: ContextmenuGroup[] = [
        {
            title: '관리',
            menus: [
                {
                    name: '씬',
                    description: '씬의 메인 파일을 관리합니다',
                    path: '/manager/scene'
                },
                {
                    name: '에셋',
                    description: '에셋을 관리합니다',
                    path: '/manager/asset'
                },
                {
                    name: '애니메이션',
                    description: '애니메이션을 관리합니다',
                    path: '/manager/animation'
                },
                {
                    name: '스킬',
                    description: '스킬을 관리합니다',
                    path: '/manager/skill'
                },
                {
                    name: '설정',
                    description: '프로젝트 설정을 변경합니다',
                    path: `/manager/config`
                }
            ]
        },
        {
            title: '기타',
            menus: [
                {
                    name: '종료',
                    description: '메인화면으로 돌아갑니다',
                    path: '/project/close'
                }
            ]
        }
    ]

    private watchers: Set<FileWatcher> = new Set

    private get projectName(): string {
        const { PROJECT_NAME } = this.$store.state.projectConfig
        if (!PROJECT_NAME) {
            return ''
        }
        return PROJECT_NAME
    }

    private get projectDirectory(): string {
        return this.$store.state.projectDirectory
    }

    private showManager(url: string): void {
        this.$router.replace(url).catch(() => {})
    }

    private generateWatchers(): void {
        this.destroyWatchers()
        
        // 에셋 디렉토리 감지
        const assetDir: string = path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME)
        const assetWatcher = new FileWatcher(assetDir).update(() => ipcRenderer.invoke('generate-asset-list', this.projectDirectory)).start().emit()

        // 애니메이션 디렉토리 감지
        const animsDir: string = path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ANIMATION_DIRECTORY_NAME)
        const animsWatcher = new FileWatcher(animsDir).update(() => ipcRenderer.invoke('generate-animation-list', this.projectDirectory)).start().emit()

        // 스킬 디렉토리 감지
        const skillDir: string = path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_SKILL_DIRECTORY_NAME)
        const skillWatcher = new FileWatcher(skillDir).update(() => ipcRenderer.invoke('generate-skill-list', this.projectDirectory)).start().emit()

        // 애니메이션 디렉토리 감지
        this.watchers.add(assetWatcher)
        this.watchers.add(animsWatcher)
        this.watchers.add(skillWatcher)
    }

    private destroyWatchers(): void {
        for (const watcher of this.watchers) {
            watcher.destroy()
        }
        this.watchers.clear()
    }

    private openPath(filePath: string): void {
        shell.openPath(filePath)
    }

    created(): void {
        this.generateWatchers()
    }

    beforeDestroy(): void {
        this.destroyWatchers()
    }
}
</script>

<style lang="scss" scoped>
.main-view {
    height: calc(100vh - 64px);
    margin-top: 64px !important;
    overflow: auto;
}
</style>