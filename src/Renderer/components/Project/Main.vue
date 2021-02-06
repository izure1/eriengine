<template>
    <v-app id="project">
        <v-main>
             <router-view />
        </v-main>
    </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Betterbacks from 'betterbacks'
import bgProjectjobNew from '@/Renderer/assets/bg-projectjob-new.png'
import bgProjectjobOpen from '@/Renderer/assets/bg-projectjob-open.png'

interface ProjectJob {
    title: string
    description: string
    url: string
    image: string
}

@Component
export default class Launcher extends Vue {
    private jobs: ProjectJob[] = [
        {
            title: '새로운 프로젝트 만들기',
            description: '새로운 에리엔진 게임 프로젝트를 만듭니다',
            url: '/project/new',
            image: bgProjectjobNew
        },
        {
            title: '프로젝트 열기',
            description: '기존에 만들었던 에리엔진 게임 프로젝트를 이어서 작업합니다',
            url: '/project/open',
            image: bgProjectjobOpen
        }
    ]
    private goTo(url: string): void {
        this.$router.replace(url).catch(() => null)
    }

    mounted(): void {
        Betterbacks('#project .v-main', {
            animate: true,
            dark: true,
            type: ['squircles', 'squares', 'circles'].sort(() => Math.random() > 0.5 ? 1 : -1).pop() as any,
            themeColor: '#fefefe'
        })
    }
}
</script>

<style lang="scss" scoped>
.theme--light {
    background: initial !important;
}
</style>