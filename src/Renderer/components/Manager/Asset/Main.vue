<template>
    <explorer-component
        :cwd="cwd"
        :actions="actions"
        :contextmenus="contextmenus"
        :options="{ extensions }"
        :preload="10"
        :openFile="openPath"
        :loading="isLoading"
    />
</template>

<script lang="ts">
import path from 'path'
import { Vue, Component } from 'vue-property-decorator'
import { ipcRenderer, shell } from 'electron'
import ExplorerComponent, { ContextItemAction } from '@/Renderer/components/FileSystem/Explorer.vue'

import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_ASSET_DIRECTORY_NAME,
    PROJECT_ALLOW_ASSET_EXTENSIONS
} from '@/Const'

@Component({
    components: {
        ExplorerComponent
    }
})
export default class AssetMainComponent extends Vue {
    private isLoading: boolean = false
    private currentDirectory: string = this.cwd
    private extensions: string[] = PROJECT_ALLOW_ASSET_EXTENSIONS

    private actions: ContextItemAction[] = [
        {
            icon: 'mdi-plus',
            description: '에셋 추가',
            action: (directoryPath: string) => {
                this.add(directoryPath)
            }
        },
        {
            icon: 'mdi-folder-open-outline',
            description: '폴더 열기',
            action: (directoryPath: string) => {
                shell.openPath(directoryPath)
            }
        }
    ]

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

    private get cwd(): string {
        const { projectDirectory } = this.$store.state
        if (!projectDirectory) {
            return ''
        }
        return path.resolve(projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME)
    }

    private async add(directoryPath: string): Promise<void> {
        const filesOpen: Engine.FileSystem.OpenFilesSuccess|Engine.FileSystem.OpenFilesFail = await ipcRenderer.invoke('open-files', [{ name: 'Asset files', extensions: this.extensions }])
        if (!filesOpen.success) {
            return
        }

        this.isLoading = true

        const fails: string[] = []
        for (const file of filesOpen.path) {
            const name: string = path.basename(file)
            const dist: string = path.resolve(directoryPath, name)

            const fileCopy: Engine.FileSystem.CopySuccess|Engine.FileSystem.CopyFail = await ipcRenderer.invoke('copy', file, dist)
            if (!fileCopy.success) {
                fails.push(file)
            }
        }

        const successNum: number = filesOpen.path.length - fails.length
        const failsSample: string[] = fails.map((file: string): string => path.basename(file)).slice(0, 3)

        let comment: string = `총 ${successNum}개의 파일을 추가했습니다.`
        if (failsSample.length) {
            comment = `${failsSample.join(', ')} 등 ${fails.length}개를 제외한, ${comment}`
        }

        this.$store.dispatch('snackbar', comment)
        this.isLoading = false
    }

    private openDirectory(): void {
        shell.openPath(this.currentDirectory)
    }

    private openPath(filePath: string): void {
        shell.openPath(filePath)
    }
}
</script>