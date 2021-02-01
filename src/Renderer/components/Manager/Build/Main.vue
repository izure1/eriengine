<template>
    <v-card flat :loading="isBuilding"> 
        <v-card-title>
            게임으로 빌드하기
            <v-btn icon v-if="!isBuilding" @click="build">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-btn icon v-if="!isBuilding && isBuildSuccess" @click="openBuiltDirectory">
                <v-icon>mdi-folder-open-outline</v-icon>
            </v-btn>
        </v-card-title>
        <v-card-subtitle>
            <p v-if="isBuilding">작업 중...</p>
            <p v-else-if="isBuildSuccess" class="green--text lighten-5">성공적으로 빌드되었습니다 ＼(´ ∇`)ノ</p>
            <p v-else class="red--text">
                빌드 실패. 오류에 대한 자세한 내용은 아래 로그를 확인하세요. ∑(゜△゜;)
                <br>
                오류의 정확한 원인을 알 수 없다면 에리엔진 저장소에 아래 빌드 내용을 복사하여 질문해주세요.
            </p>
        </v-card-subtitle>
        <v-card-text> 
            <p v-if="isBuilding">
                게임을 빌드 중입니다.
                <br>
                빌드된 게임은 프로젝트 디렉토리의 dist 폴더에 생성됩니다.
            </p>
            <shell-channel-component channel="build-to-web" :clear="lastClearTime" />
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron'
import { Vue, Component } from 'vue-property-decorator'

import ShellChannelComponent from '@/Renderer/components/Shell/Channel.vue'

@Component({
    components: {
        ShellChannelComponent
    }
})
export default class BuildComponent extends Vue {
    private isBuilding: boolean = false
    private isBuildSuccess: boolean = false
    private builtPath: string = this.cwd
    private lastClearTime: number = 0

    private get cwd(): string {
        return this.$store.state.projectDirectory
    }

    private async build(): Promise<void> {
        if (!this.cwd) {
            return
        }

        this.lastClearTime = Date.now()
        this.isBuilding = true
        this.isBuildSuccess = false

        const gameBuild: Engine.GameProject.BuildToWebSuccess|Engine.GameProject.BuildToWebFail = await ipcRenderer.invoke('build-to-web', this.cwd)
        if (gameBuild.success) {
            this.builtPath = gameBuild.path
        }

        this.isBuilding = false
        this.isBuildSuccess = gameBuild.success
    }

    private openBuiltDirectory(): void {
        ipcRenderer.invoke('show-item', this.builtPath)
    }

    mounted(): void {
        this.build()
    }
}
</script>