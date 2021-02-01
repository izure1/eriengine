<template>
    <v-card flat :loading="true"> 
        <v-card-title>프로젝트 재구성 중</v-card-title>
        <v-card-subtitle>게임 엔진 버전에 맞지 않거나 일부 파일이 누락된 오류를 바로 잡습니다.</v-card-subtitle>
        <v-card-text> 
            <p>
                일반적으로 이 작업은 프로젝트를 열었을 때, 자동으로 진행됩니다.
                <br>
                이 작업은 게임을 빌드할 시 오류가 없도록 도와줄 것입니다.
            </p>
            <p>
                하지만 모든 오류 해결을 보장해준다는 의미는 아닙니다.
                <br>
                프로젝트 디렉토리의 구조를 임의로 변경하지 마십시오. 어디까지나 관리부주의는 사용자의 책임에 있습니다.
            </p>
            <pre>{{ streamMessage }}</pre>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { readFromMain } from '@/Utils/stream'

@Component
export default class RestructureComponent extends Vue {
    private streamMessage: string = ''

    private get cwd(): string {
        return this.$route.params.cwd
    }

    private finally(message: string): void {
        this.$store.dispatch('snackbar', message)
        this.$router.replace('/manager')
    }

    private goBack(): void {
        this.$router.replace('/manager')
    }

    private async readProject(): Promise<Engine.GameProject.ReadProjectSuccess|Engine.GameProject.ReadProjectFail> {
        return await ipcRenderer.invoke('read-project', this.cwd)
    }

    private async restructureProject(config: Engine.GameProject.Config): Promise<Engine.GameProject.CreateProjectSuccess|Engine.GameProject.CreateProjectFail> {
        return await ipcRenderer.invoke('ensure-project', this.cwd, config)
    }

    async created(): Promise<void> {
        if (!this.cwd) {
            return
        }

        const projectRead = await this.readProject()
        if (!projectRead.success) {
            this.finally(projectRead.message)
            return
        }

        const streamReader = readFromMain('ensure-require-modules').setEncoding('utf-8').on('data', (data: string): void => {
            this.streamMessage += data
        })

        const projectRestructure = await this.restructureProject(projectRead.config)

        streamReader.destroy()
        if (!projectRestructure.success) {
            this.finally(projectRestructure.message)
            return
        }

        this.finally('작업을 성공적으로 끝마쳤습니다')
    }
}
</script>