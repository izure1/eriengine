<template>
    <v-app>
        <v-main>
            <v-card flat>
                <v-card-title>프로젝트 열기</v-card-title>
                <v-card-text>
                    프로젝트 디렉토리를 선택하세요.
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-container class="text-center">
                        <v-row>
                            <v-col>
                                <v-btn min-width="150" text tile @click="selectDirectory">디렉토리 선택</v-btn>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <v-btn min-width="150" text tile @click="goBack">돌아가기</v-btn>
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-spacer />
                </v-card-actions>
            </v-card>
        </v-main>
    </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { ipcRenderer } from 'electron'

@Component
export default class OpenProjectComponent extends Vue {
    private async selectDirectory(): Promise<void> {
        const directoryOpen: Engine.FileSystem.OpenDirectorySuccess|Engine.FileSystem.OpenDirectoryFail = await ipcRenderer.invoke('open-directory')
        if (!directoryOpen.success) {
            this.$store.dispatch('snackbar', directoryOpen.message)
            return
        }

        const projectRead: Engine.GameProject.ReadProjectSuccess|Engine.GameProject.ReadProjectFail = await ipcRenderer.invoke('read-project', directoryOpen.path)
        if (!projectRead.success) {
            this.$store.dispatch('snackbar', projectRead.message)
            return
        }

        const projectEnsure: Engine.GameProject.CreateProjectSuccess|Engine.GameProject.CreateProjectFail = await ipcRenderer.invoke('ensure-project', directoryOpen.path, projectRead.config)
        if (!projectEnsure.success) {
            this.$store.dispatch('snackbar', projectEnsure.message)
            return
        }

        const { path, config } = projectRead
        this.$store.dispatch('openProject', { path, config })
        this.$router.replace('/manager')
    }

    private goBack(): void {
        this.$router.replace('/project/close')
    }

    mounted(): void {
        this.selectDirectory()
    }
}
</script>

<style lang="scss" scoped>

</style>