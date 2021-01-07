<template>
    <explorer-component
        :cwd="cwd"
        :buttons="buttons"
        :options="{ extensions: ['ts'] }"
        :preload="10"
        :openFile="openPath"
    />
</template>

<script lang="ts">
import path from 'path'
import { Vue, Component } from 'vue-property-decorator'
import { shell } from 'electron'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_SCENE_DIRECTORY_NAME,
    PROJECT_SRC_SCENE_ANIMATION_DIRECTORY_NAME
} from '@/Const'
import ExplorerComponent, { ContextItemAction } from '@/Renderer/components/FileSystem/Explorer.vue'

@Component({
    components: {
        ExplorerComponent
    }
})
export default class AnimationListComponent extends Vue {
    private get cwd(): string {
        const { key } = this.$route.params
        const { projectDirectory } = this.$store.state
        if (!projectDirectory) {
            return ''
        }
        return path.resolve(
            projectDirectory,
            PROJECT_SRC_DIRECTORY_NAME,
            PROJECT_SRC_SCENE_DIRECTORY_NAME,
            key,
            PROJECT_SRC_SCENE_ANIMATION_DIRECTORY_NAME
        )
    }

    private buttons: ContextItemAction[] = [
        {
            icon: 'mdi-plus',
            description: '애니메이션 추가',
            action: (directoryPath: string): void => {

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
            action: (directoryPath: string): void => {
                this.goBack()
            }
        }
    ]

    private openDirectory(): void {
        shell.openPath(this.cwd)
    }

    private openPath(filePath: string): void {
        shell.openPath(filePath)
    }

    private add(directoryPath: string): void {
    }

    private goBack(): void {
        this.$router.replace('/manager/scene')
    }
}
</script>