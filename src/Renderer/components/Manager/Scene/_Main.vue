<template>
    <section>

        <explorer-component
            :cwd="cwd"
            :actions="actions"
            :singleline="false"
            :options="{ includeFiles: false }"
            :preload="10"
            :openDirectory="openSceneFile"
            :contextmenus="contextmenus"
        />

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
import ExplorerComponent, { ContextItemAction } from '@/Renderer/components/FileSystem/Explorer.vue'

import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_SCENE_DIRECTORY_NAME
} from '@/Const'

type Rule = (v: string) => boolean|string

@Component({
    components: {
        ExplorerComponent
    }
})
export default class SceneMainComponent extends Vue {
    private isPromptJobDoing: boolean = false
    private isPromptOpen: boolean = false
    private promptTitle: string = ''
    private promptText: string = ''
    private promptAnswer: string = ''
    private promptRules: Rule[] = []

    private actions: ContextItemAction[] = [
        {
            icon: 'mdi-plus',
            description: '새로운 씬 만들기',
            action: async (directoryPath: string): Promise<void> => {
                this.add()
            }
        },
        {
            icon: 'mdi-folder-open-outline',
            description: '폴더 열기',
            action: (directoryPath: string): void => {
                this.openPath(directoryPath)
            }
        }
    ]

    private contextmenus: ContextItemAction[] = [
        {
            icon: 'mdi-folder-open-outline',
            description: '씬 폴더로 이동합니다',
            action: (filePath: string): void => {
                const key: string = path.basename(filePath)
                const sceneDir: string = path.resolve(this.cwd, key)
                this.openPath(sceneDir)   
            }
        },
        {
            icon: 'mdi-script-text-outline',
            description: '스크립트 파일을 찾습니다',
            action: (filePath: string): void => {
                const key: string = path.basename(filePath)
                this.$router.replace(`/manager/scene/script/${key}`)
            }
        },
        {
            icon: 'mdi-pencil-ruler',
            description: '씬을 꾸밉니다',
            action: (filePath: string): void => {
                const key: string = path.basename(filePath)
                this.$router.replace(`/manager/scene/map/${key}`)
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
        return path.resolve(projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_SCENE_DIRECTORY_NAME)
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

    private openSceneFile(filePath: string): void {
        this.openPath(path.resolve(filePath, 'Scene.ts'))
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

        const sceneKey: string = this.promptAnswer
        this.isPromptJobDoing = true
        this.promptText = `'${sceneKey}' 씬을 생성하는 중입니다. 잠시만 기다려주세요.`

        const sceneAdd: Engine.GameProject.AddSceneSuccess|Engine.GameProject.AddSceneFail = await ipcRenderer.invoke('add-scene', projectDirectory, sceneKey)
        if (!sceneAdd.success) {
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
            '씬의 키 값을 설정해주세요.<br>이 값은 다른 씬과 중복되어선 안됩니다.<br><strong>영문과 숫자, 밑줄만 사용할 수 있으며, 영문으로 시작해야 합니다.</strong>',
            [
                (v: string) => /^[A-Za-z][A-Za-z\d_]*$/g.test(v) || '유효하지 않은 값입니다.'
            ]
        )
    }
}
</script>