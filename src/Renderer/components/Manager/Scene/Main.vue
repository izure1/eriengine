<template>
    <file-generator-component
        :cwd="cwd"
        :add="add"
        :extraContextmenus="contextmenus"
        :description="[
            '씬은 플레이어가 게임 내에서 보는 공간입니다.<br>액터가 활보하는 공간으로도, GUI 화면으로도 사용할 수도 있습니다.'
        ]"
        filename="scene.ts"
    />
</template>

<script lang="ts">
import path from 'path'
import { ipcRenderer, shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import FileGeneratorComponent, { ContextItemAction } from '@/Renderer/components/Manager/FileGenerator.vue'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_SCENE_DIRECTORY_NAME
} from '@/Const'

@Component({
    components: {
        FileGeneratorComponent
    }
})
export default class SkillMainComponent extends Vue {
    private cwd: string = path.resolve(
        this.$store.state.projectDirectory,
        PROJECT_SRC_DIRECTORY_NAME,
        PROJECT_SRC_SCENE_DIRECTORY_NAME,
    )

    private contextmenus: ContextItemAction[] = [
        {
            icon: 'mdi-script-text-outline',
            description: '스크립트 파일을 찾습니다',
            action: (filePath: string): void => {

            }
        },
        {
            icon: 'mdi-pencil-ruler',
            description: '씬을 꾸밉니다',
            action: (filePath: string): void => {

            }
        }
    ]

    private get projectDirectory(): string {
        return this.$store.state.projectDirectory
    }

    private showPath(filePath: string): void {
        filePath = path.resolve(filePath)
        shell.showItemInFolder(filePath)
    }

    private async add(filePath: string): Promise<void> {
        const sceneAdd: Engine.GameProject.AddSceneSuccess|Engine.GameProject.AddSceneFail = await ipcRenderer.invoke('add-scene', this.projectDirectory, filePath)
        if (!sceneAdd.success) {
            this.$store.dispatch('snackbar', sceneAdd.message)
            return
        }

        this.showPath(sceneAdd.path)
    }
}
</script>