<template>
    <v-app>
        <v-app-bar
            fixed
            elevation="1"
            color="blue-grey"
        >
            <v-app-bar-nav-icon @click="isDrawerOpen = !isDrawerOpen" class="white--text"></v-app-bar-nav-icon>
            <v-app-bar-title class="white--text">{{ projectName }}</v-app-bar-title>
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
import slash from 'slash'
import { Vue, Component } from 'vue-property-decorator'
import {
    PROJECT_SCENE_DIRECTORY_NAME,
    PROJECT_ASSET_DIRECTORY_NAME,
    PROJECT_ACTOR_DIRECTORY_NAME,
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
                }
            ]
        },
        {
            title: '프로젝트',
            menus: [
                {
                    name: '종료',
                    path: '/project/close',
                    description: '메인화면으로 돌아갑니다'
                }
            ]
        }
    ]

    private get projectName(): string {
        const { PROJECT_NAME } = this.$store.state.projectConfig
        if (!PROJECT_NAME) {
            return ''
        }
        return PROJECT_NAME
    }

    private showManager(url: string): void {
        this.$router.replace(url)
    }
}
</script>

<style lang="scss" scoped>
.main-view {
    height: calc(100vh - 100px);
    margin-top: 100px !important;
    overflow: auto;
}
</style>