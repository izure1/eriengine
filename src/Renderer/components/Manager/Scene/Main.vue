<template>
    <section>
        <v-card tile elevation="0">

            <v-card-actions>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn icon v-on="on" @click="add">
                            <v-icon color="blue-grey">mdi-plus</v-icon>
                        </v-btn>
                    </template>
                    <span>새로운 씬 추가</span>
                </v-tooltip>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn icon v-on="on" @click="openDirectory">
                            <v-icon color="blue-grey">mdi-folder-open-outline</v-icon>
                        </v-btn>
                    </template>
                    <span>폴더 열기</span>
                </v-tooltip>

            </v-card-actions>

            <file-list-component
                :cwd="cwd"
                :singleLine="false"
                :globOption="{ onlyDirectories: true, deep: 2 }"
                :preload="10"
                :open="openSceneFile"
                :actions="actions"
                @update="setSceneNames"
            />
            
        </v-card>
        <v-dialog
            v-model="isPromptOpen"
            persistent
            max-width="600"
        >
            <v-card :loading="isPromptJobDoing" :disabled="isPromptJobDoing">
                <v-card-title v-html="promptTitle"></v-card-title>
                <v-card-text>
                    <div v-html="promptText"></div>
                    <v-text-field
                        v-model="promptAnswer"
                        :rules="promptRules" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="closePrompt">취소</v-btn>
                    <v-btn text @click="confirmAppendScene" :disabled="!isValidAnswer">확인</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </section>
</template>

<script lang="ts">
import path from 'path'
import { Vue, Component } from 'vue-property-decorator'
import { ipcRenderer, shell } from 'electron'
import FileListComponent, { ContextItemAction } from '@/Renderer/components/FileSystem/FileList.vue'

import {
    PROJECT_SCENE_DIRECTORY_NAME
} from '@/Const'

type Rule = (v: string) => boolean|string

@Component({
    components: {
        FileListComponent
    }
})
export default class SceneListComponent extends Vue {
    private isPromptJobDoing: boolean = false
    private isPromptOpen: boolean = false
    private promptTitle: string = ''
    private promptText: string = ''
    private promptAnswer: string = ''
    private promptRules: Rule[] = []
    private sceneNames: string[] = []

    private actions: ContextItemAction[] = [
        {
            icon: 'mdi-script-text-outline',
            description: '스크립트 파일을 찾습니다',
            action: (filePath: string): void => {
                const key: string = path.basename(filePath)
                this.$router.replace(`/manager/scene/${key}/script`)
            }
        },
        {
            icon: 'mdi-transition',
            description: '애니메이션 파일을 찾습니다',
            action: (filePath: string): void => {
                const key: string = path.basename(filePath)
                this.$router.replace(`/manager/scene/${key}/animation`)
            }
        },
        {
            icon: 'mdi-delete-outline',
            description: '씬을 삭제합니다',
            action: async (filePath: string): Promise<void> => {
                const trash: Engine.FileSystem.TrashSuccess|Engine.FileSystem.TrashFail = await ipcRenderer.invoke('trash', filePath, true)
                if (!trash.success) {
                    this.$store.dispatch('snackbar', trash.message)
                }
            }
        }
    ]

    private get cwd(): string {
        const { projectDirectory } = this.$store.state
        if (!projectDirectory) {
            return ''
        }
        return path.join(projectDirectory, PROJECT_SCENE_DIRECTORY_NAME)
    }

    private get isValidAnswer(): boolean {
        for (const rule of this.promptRules) {
            const valid = rule(this.promptAnswer)
            if (typeof valid === 'string') return false
            if (!valid) return false
        }
        return true
    }

    private openPath(filePath: string): void {
        shell.openPath(filePath)
    }

    private openDirectory(): void {
        shell.openPath(this.cwd)
    }

    private openSceneFile(filePath: string): void {
        this.openPath(path.join(filePath, 'Scene.ts'))
    }

    private prompt(title: string, text: string, rules: Rule[]): void {
        this.isPromptOpen = true
        this.promptTitle = title
        this.promptText = text
        this.promptRules = rules
        this.promptAnswer = ''
    }

    private closePrompt(): void {
        this.isPromptOpen = false
        this.promptAnswer = ''
    }

    private async confirmAppendScene(): Promise<void> {
        if (!this.isValidAnswer) {
            return
        }
        const { projectDirectory } = this.$store.state
        if (!projectDirectory) {
            return
        }

        this.isPromptJobDoing = true
        this.promptText = `'${this.promptAnswer}' 씬을 생성하는 중입니다. 잠시만 기다려주세요.`

        const sceneAdd: Engine.GameProject.AddSceneSuccess|Engine.GameProject.AddSceneFail = await ipcRenderer.invoke('add-scene', projectDirectory, this.promptAnswer)
        if (!sceneAdd.success) {

            const tmpdir: string = path.join(this.cwd, this.promptAnswer)
            await ipcRenderer.invoke('delete', tmpdir)

            this.isPromptJobDoing = false
            this.$store.dispatch('snackbar', sceneAdd.message)
            return
        }

        this.isPromptJobDoing = false

        this.closePrompt()
    }

    private async add(): Promise<void> {
        const { projectDirectory } = this.$store.state
        if (!projectDirectory) {
            return
        }

        this.prompt(
            '씬 생성하기',
            '씬의 키 값을 설정해주세요.<br>이 값은 다른 씬과 중복되어선 안됩니다.<br><strong>영문과 숫자만 사용할 수 있으며, 영문으로 시작해야 합니다.</strong>',
            [
                (v: string) => /^[A-Za-z][A-Za-z\d_]*$/g.test(v) || '유효하지 않은 값입니다.',
                (v: string) => this.sceneNames.indexOf(v.toLowerCase()) === -1 || '이미 존재하는 값입니다.'
            ]
        )
    }

    private async setSceneNames(): Promise<void> {
        const dirRead: Engine.FileSystem.ReadDirectorySuccess|Engine.FileSystem.ReadFileFail = await ipcRenderer.invoke('read-directory', this.cwd, '**/*', { onlyDirectories: true, deep: 2 })
        if (!dirRead.success) {
            this.$store.dispatch('snackbar', dirRead.message)
            return
        }
        this.sceneNames = dirRead.files.map((item: string): string => path.dirname(item).toLowerCase())
    }

    created(): void {
        this.setSceneNames()
    }
}
</script>