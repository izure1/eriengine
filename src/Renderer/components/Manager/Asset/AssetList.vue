<template>
    <section>
        <v-card
            :loading="isLoading"
            tile
            elevation="0"
        >

            <v-card-actions>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn icon v-on="on" @click="add">
                            <v-icon color="blue-grey">mdi-plus</v-icon>
                        </v-btn>
                    </template>
                    <span>에셋 추가</span>
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
                :filter="filters"
                :preload="10"
                :open="openPath"
                :actions="actions"
            />

        </v-card>
    </section>
</template>

<script lang="ts">
import path from 'path'
import { Vue, Component } from 'vue-property-decorator'
import { ipcRenderer, shell } from 'electron'
import FileListComponent, { ContextItemAction } from '@/Renderer/components/FileSystem/FileList.vue'

import { PROJECT_ASSET_DIRECTORY_NAME } from '@/Const'

@Component({
    components: {
        FileListComponent
    }
})
export default class AssetListComponent extends Vue {
    private isLoading: boolean = false
    private extensions: string[] = [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'ogg',
        'mp4',
        'webm',
        'mp4',
        'woff',
        'woff2'
    ]

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
        return path.join(projectDirectory, PROJECT_ASSET_DIRECTORY_NAME)
    }

    private get filters(): string[] {
        return this.extensions.map((extension: string): string => `**/*.${extension}`)
    }

    private async add(): Promise<void> {
        const filesOpen: Engine.FileSystem.OpenFilesSuccess|Engine.FileSystem.OpenFilesFail = await ipcRenderer.invoke('open-files', [{ name: 'Asset files', extensions: this.extensions }])
        if (!filesOpen.success) {
            return
        }

        this.isLoading = true

        const fails: string[] = []
        for (const file of filesOpen.path) {
            const name: string = path.basename(file)
            const dist: string = path.join(this.cwd, name)

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
        shell.openPath(this.cwd)
    }

    private openPath(filePath: string): void {
        shell.openPath(filePath)
    }
}
</script>