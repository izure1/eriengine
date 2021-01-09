<template>
    <section>
        <v-card flat>
            <v-card-text>
                <p
                    v-for="(text, index) in description"
                    v-html="text"
                    :key="`generator-text-${index}`"
                    class="caption"
                />
            </v-card-text>
        </v-card>
        <explorer-component
            :cwd="cwd"
            :actions="actions"
            :options="{ extensions: ['ts'] }"
            :preload="10"
            :openFile="openPath"
            :contextmenus="contextmenus"
            @update:path="setCurrentDirectory"
        />
    </section>
</template>

<script lang="ts">
import path from 'path'
import normalize from 'normalize-path'
import { Vue, Component } from 'vue-property-decorator'
import { ipcRenderer, shell } from 'electron'
import increment from 'add-filename-increment'
import ExplorerComponent, { ContextItemAction } from '@/Renderer/components/FileSystem/Explorer.vue'
export { ContextItemAction } from '@/Renderer/components/FileSystem/Explorer.vue'

@Component({
    components: {
        ExplorerComponent
    },
    props: {
        cwd: {
            type: String,
            required: true
        },
        filename: {
            type: String,
            required: true
        },
        add: {
            type: Function,
            required: true
        },
        extraActions: {
            type: Array,
            default: () => []
        },
        description: {
            type: Array,
            default: () => []
        }
    }
})
export default class GeneratorComponent extends Vue {
    private cwd!: string
    private filename!: string
    private extraActions!: ContextItemAction[]
    private add!: (filePath: string) => Promise<void>
    private currentPath: string = normalize(this.cwd)

    private actions: ContextItemAction[] = [
        {
            icon: 'mdi-plus',
            description: '추가',
            action: (): void => {
                this.add(this.getNewFilePath())
            }
        },
        {
            icon: 'mdi-folder-open-outline',
            description: '폴더 열기',
            action: (directoryPath: string): void => {
                this.openPath(directoryPath)
            }
        },
        ...this.extraActions
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

    private get projectDirectory(): string {
        return this.$store.state.projectDirectory
    }

    private setCurrentDirectory(directoryPath: string): void {
        this.currentPath = normalize(directoryPath)
    }

    private getNewFilePath(): string {
        return normalize(
            increment(path.resolve(this.currentPath, this.filename), { fs: true })
        )
    }

    private openPath(filePath: string): void {
        shell.openPath(filePath)
    }

}
</script>