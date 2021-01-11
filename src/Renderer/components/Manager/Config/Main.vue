<template>
    <explorer-component
        :cwd="cwd"
        :actions="actions"
        :openFile="openPath"
        :options="{ includeDirectories: false, extensions: ['json'] }"
        :contextmenus="contextmenus"
    />
</template>

<script lang="ts">
import path from 'path'
import { Vue, Component } from 'vue-property-decorator'
import { shell, ipcRenderer } from 'electron'
import ExplorerComponent, { ContextItemAction } from '@/Renderer/components/FileSystem/Explorer.vue'

@Component({
    components: {
        ExplorerComponent
    }
})
export default class ConfigMainComponent extends Vue {
    private actions: ContextItemAction[] = [
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
            icon: 'mdi-open-in-new',
            description: '파일로 이동합니다',
            action: (filePath: string): void => {
                ipcRenderer.invoke('show-item', filePath)
            }
        }
    ]

    private get cwd(): string {
        const { projectDirectory } = this.$store.state
        if (!projectDirectory) {
            return ''
        }
        return projectDirectory
    }

    private openPath(filePath: string): void {
        shell.openPath(filePath)
    }
}
</script>