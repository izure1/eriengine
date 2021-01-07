<template>
    <explorer-component
        :cwd="cwd"
        :buttons="buttons"
        :options="{ extensions: ['ts'] }"
        :preload="10"
        :openFile="openPath"
        :actions="actions"
    />
</template>

<script lang="ts">
import path from 'path'
import { Vue, Component } from 'vue-property-decorator'
import { ipcRenderer, shell } from 'electron'
import { getRandomSentence } from '@/Utils/getRandomSentence'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_SCENE_DIRECTORY_NAME,
    PROJECT_SRC_SCENE_SCRIPT_DIRECTORY_NAME
} from '@/Const'
import ExplorerComponent, { ContextItemAction } from '@/Renderer/components/FileSystem/Explorer.vue'

@Component({
    components: {
        ExplorerComponent
    }
})
export default class ScriptListComponent extends Vue {
    private actions: ContextItemAction[] = [
        {
            icon: 'mdi-open-in-new',
            description: '파일로 이동합니다',
            action: (filePath: string): void => {
                ipcRenderer.invoke('show-item', filePath)
            }
        },
        {
            icon: 'mdi-delete-outline',
            description: '스크립트를 삭제합니다',
            action: async (filePath: string): Promise<void> => {
                const trash: Engine.FileSystem.TrashSuccess|Engine.FileSystem.TrashFail = await ipcRenderer.invoke('trash', filePath, true)
                if (!trash.success) {
                    this.$store.dispatch('snackbar', trash.message)
                }
            }
        }
    ]

    private buttons: ContextItemAction[] = [
        {
            icon: 'mdi-plus',
            description: '스크립트 추가',
            action: (directoryPath: string): void => {
                this.add(directoryPath)
            }
        },
        {
            icon: 'mdi-folder-open-outline',
            description: '폴더 열기',
            action: (directoryPath: string): void => {
                this.openPath(directoryPath)
            }
        },
        {
            icon: 'mdi-arrow-left',
            description: '뒤로가기',
            action: (): void => {
                this.goBack()
            }
        },
    ]

    private get projectDirectory(): string {
        return this.$store.state.projectDirectory
    }

    private get sceneKey(): string {
        return this.$route.params.key || ''
    }

    private get cwd(): string {
        return path.resolve(
            this.projectDirectory,
            PROJECT_SRC_DIRECTORY_NAME,
            PROJECT_SRC_SCENE_DIRECTORY_NAME,
            this.sceneKey,
            PROJECT_SRC_SCENE_SCRIPT_DIRECTORY_NAME
        )
    }

    private openPath(filePath: string): void {
        shell.openPath(filePath)
    }

    private async add(directoryPath: string): Promise<void> {
        if (!this.projectDirectory) {
            return
        }
        if (!this.sceneKey) {
            return
        }
        const filename: string = getRandomSentence(3)
        const scriptAdd: Engine.GameProject.AddScriptSuccess|Engine.GameProject.AddScriptFail = await ipcRenderer.invoke('add-script', directoryPath, this.sceneKey, filename)
        if (!scriptAdd.success) {
            this.$store.dispatch('snackbar', scriptAdd.message)
            return
        }

        this.openPath(scriptAdd.path)
    }

    private goBack(): void {
        this.$router.replace('/manager/scene')
    }
}
</script>