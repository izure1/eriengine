<template>
    <v-card
        elevation="0"
        tile
    >
        <v-card-actions>

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
            :openFile="openPath"
            :options="{ includeDirectories: false, extensions: ['json'] }"
            :actions="actions"
        />
    </v-card>
</template>

<script lang="ts">
import path from 'path'
import { Vue, Component } from 'vue-property-decorator'
import { shell, ipcRenderer } from 'electron'
import FileListComponent, { ContextItemAction } from '@/Renderer/components/FileSystem/FileList.vue'

@Component({
    components: {
        FileListComponent
    }
})
export default class ProjectEditComponent extends Vue {
    private actions: ContextItemAction[] = [
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

    private openDirectory(): void {
        shell.openPath(this.cwd)
    }

    private openPath(filePath: string): void {
        shell.openPath(filePath)
    }
}
</script>