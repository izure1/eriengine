<template>
    <v-card flat :loading="isRunning"> 
        <v-card-title>
            {{ title }}
            <v-btn icon v-if="!isRunning" @click="start">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-btn icon v-if="!isRunning && isJobSuccess" @click="openBuiltDirectory">
                <v-icon>mdi-folder-open-outline</v-icon>
            </v-btn>
        </v-card-title>
        <v-card-subtitle>
            <p v-if="isRunning">작업 중...  {{ emoticon1 }}</p>
            <p v-else-if="isJobSuccess" class="green--text lighten-5">성공적으로 작업을 완료했습니다  ＼(´ ∇`)ノ</p>
            <p v-else class="red--text">
                작업 실패.  ∑(゜△゜;)
                <br>
                오류에 대한 자세한 내용은 아래 로그를 확인하세요.
                <br>
                정확한 원인을 알 수 없다면 에리엔진 저장소에 아래 내용을 복사하여 질문해주세요.
            </p>
        </v-card-subtitle>
        <v-card-text> 
            <p v-if="isRunning">
                결과물은 프로젝트 디렉토리의 <code>build</code> 폴더에 생성됩니다.
                <br>
                이 작업은 몇 분이 걸릴 수 있습니다.
            </p>
            <shell-channel-component :channel="streamChannel" :clear="lastClearTime" />
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { Base64 } from 'js-base64';
import { ipcRenderer } from 'electron';
import { Vue, Component } from 'vue-property-decorator';

import ShellChannelComponent from '@/Renderer/components/Shell/Channel.vue';

export interface BuildData {
    title: string
    description: string
    jobChannel: string
    jobParameters: Engine.Type.Transferable[]
    streamChannel: string
}

@Component({
    components: {
        ShellChannelComponent
    }
})
export default class BuildRunnerComponent extends Vue {
    private title!: string;
    private description!: string;
    private jobChannel!: string;
    private jobParameters!: Engine.Type.Transferable[];
    private streamChannel!: string;

    private isRunning: boolean = false;
    private isJobSuccess: boolean = false;
    private builtPath: string = '';
    private lastClearTime: number = 0;
    private emoticonUpdateId: number = NaN;
    private emoticonUpdateTime: number = 0;

    private get emoticon1(): string {
        return '(´･ω･`)' + (this.emoticonUpdateTime % 2 ? 'ノ' : 'ﾉ');
    }
    
    private get buildData(): BuildData|null {
        const buildData: string = this.$route.params.buildData;
        if (!buildData) {
            return null;
        }
        try {
            const stringify: string = Base64.decode(buildData);
            const json: BuildData   = JSON.parse(stringify);
            return json;
        } catch(e) {
            return null;
        }
    }

    private generateBuildData(): boolean {
        const buildData = this.buildData;

        if (!buildData) {
            this.goBack('빌드 데이터가 없습니다');
            return false;
        }

        const { title, description, jobChannel, jobParameters, streamChannel } = buildData;
        this.title          = title;
        this.description    = description;
        this.jobChannel     = jobChannel;
        this.jobParameters  = jobParameters;
        this.streamChannel  = streamChannel;

        return true;
    }

    private async start(): Promise<void> {
        this.lastClearTime = Date.now();
        this.isRunning = true;
        this.isJobSuccess = false;

        const gameBuild: Engine.GameProject.BuildJobSuccess|Engine.GameProject.BuildJobFail = await ipcRenderer.invoke(this.jobChannel, ...this.jobParameters)
        if (gameBuild.success) {
            this.builtPath = gameBuild.path;
        }

        this.isRunning = false;
        this.isJobSuccess = gameBuild.success;
    }

    private async killSpawner(): Promise<void> {
        const spawnerKill: Engine.Process.KillSpawnerSuccess|Engine.Process.KillSpawnerFail = await ipcRenderer.invoke('kill-spawner', this.jobChannel)
        if (!spawnerKill.success) {
            this.$store.dispatch('snackbar', spawnerKill.message);
            this.$store.dispatch('hideBuildingState');
        }
    }

    private openBuiltDirectory(): void {
        ipcRenderer.invoke('show-item', this.builtPath);
    }

    private updateEmoticon(): void {
        this.emoticonUpdateTime++;
        this.emoticonUpdateId = window.setTimeout(() => {
            this.updateEmoticon();
        }, 1000);
    }

    private stopUpdateEmoticon(): void {
        window.clearTimeout(this.emoticonUpdateId);
    }

    private goBack(message: string): void {
        this.$store.dispatch('snackbar', message);
        this.$router.replace('/manager/build').catch(() => null);
    }

    created(): void {
        if (this.generateBuildData()) {
            this.start();
            this.updateEmoticon();
        }
    }

    beforeDestroy(): void {
        this.stopUpdateEmoticon();
        this.killSpawner();
    }
}
</script>