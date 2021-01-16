<template>
    <file-generator-component
        :cwd="cwd"
        :add="add"
        :description="[
            '이미지 에셋을 이용하여 스프라이트를 생성합니다.<br>움직이지 않는 이미지와 달리, 스프라이트는 움직임을 표현하는 이미지입니다. 카메라의 필름이라 생각해도 좋습니다.',
            '이곳에서 추가한 스프라이트는 자동으로 모든 씬에 등록됩니다.'
        ]"
        filename="sprite.ts"
    />
</template>

<script lang="ts">
import path from 'path'
import { ipcRenderer, shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import FileGeneratorComponent from '@/Renderer/components/Manager/FileGenerator.vue'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_DATA_DIRECTORY_NAME,
    PROJECT_SRC_DATA_SPRITE_DIRECTORY_NAME
} from '@/Const'

@Component({
    components: {
        FileGeneratorComponent
    }
})
export default class SpriteMainComponent extends Vue {
    private cwd: string = path.resolve(
        this.$store.state.projectDirectory,
        PROJECT_SRC_DIRECTORY_NAME,
        PROJECT_SRC_DATA_DIRECTORY_NAME,
        PROJECT_SRC_DATA_SPRITE_DIRECTORY_NAME
    )

    private showPath(filePath: string): void {
        filePath = path.resolve(filePath)
        shell.showItemInFolder(filePath)
    }

    private async add(filePath: string): Promise<void> {
        const spriteAdd: Engine.GameProject.AddSpriteSuccess|Engine.GameProject.AddSpriteFail = await ipcRenderer.invoke('add-sprite', filePath)
        if (!spriteAdd.success) {
            this.$store.dispatch('snackbar', spriteAdd.message)
            return
        }

        this.showPath(spriteAdd.path)
    }
}
</script>