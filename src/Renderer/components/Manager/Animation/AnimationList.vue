<template>
    <explorer-component
        :cwd="cwd"
        :actions="actions"
        :options="{ extensions: ['ts'] }"
        :preload="10"
        :openFile="openPath"
        :contextmenus="contextmenus"
        @update:path="setCurrentDirectory"
    />
</template>

<script lang="ts">
import path from 'path'
import { Vue, Component } from 'vue-property-decorator'
import { ipcRenderer, shell } from 'electron'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_ANIMATION_DIRECTORY_NAME
} from '@/Const'
import { getRandomSentence } from '@/Utils/getRandomSentence'
import ExplorerComponent, { ContextItemAction } from '@/Renderer/components/FileSystem/Explorer.vue'

@Component({
    components: {
        ExplorerComponent
    }
})
export default class AnimationListComponent extends Vue {
    private currentDirectory: string = this.cwd

    private contextmenus: ContextItemAction[] = [
        {
            icon: 'mdi-open-in-new',
            description: '파일로 이동합니다',
            action: (filePath: string): void => {
                ipcRenderer.invoke('show-item', filePath)
            }
        },
        {
            icon: 'mdi-delete-outline',
            description: '파일을 삭제합니다',
            action: async (filePath: string): Promise<void> => {
                const trash: Engine.FileSystem.TrashSuccess|Engine.FileSystem.TrashFail = await ipcRenderer.invoke('trash', filePath, true)
                if (!trash.success) {
                    this.$store.dispatch('snackbar', trash.message)
                }
            }
        }
    ]

    private get projectDirectory(): string {
        return this.$store.state.projectDirectory
    }

    private get cwd(): string {
        const { key } = this.$route.params
        if (!this.projectDirectory) {
            return ''
        }
        return path.resolve(
            this.projectDirectory,
            PROJECT_SRC_DIRECTORY_NAME,
            PROJECT_SRC_ANIMATION_DIRECTORY_NAME
        )
    }

    private actions: ContextItemAction[] = [
        {
            icon: 'mdi-plus',
            description: '애니메이션 추가',
            action: (directoryPath: string): void => {
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

    private openDirectory(): void {
        shell.openPath(this.cwd)
    }

    private openPath(filePath: string): void {
        shell.openPath(filePath)
    }

    private setCurrentDirectory(directoryPath: string): void {
        this.currentDirectory = directoryPath
    }

    private async add(): Promise<void> {
        if (!this.projectDirectory) {
            return
        }
        const filename: string = getRandomSentence(3)
        const animsAdd: Engine.GameProject.AddScriptSuccess|Engine.GameProject.AddScriptFail = await ipcRenderer.invoke('add-animation', this.currentDirectory, filename)
        if (!animsAdd.success) {
            this.$store.dispatch('snackbar', animsAdd.message)
            return
        }

        this.openPath(animsAdd.path)
    }
}
</script>