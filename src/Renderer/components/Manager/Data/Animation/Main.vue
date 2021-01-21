<template>
    <file-generator-component
        :cwd="cwd"
        :add="add"
        :description="[
            '스프라이트시트에서 프레임 범위를 지정하여 스프라이트 이미지를 재생할 수 있는 기능입니다.<br>애니메이션은 동적인 게임에서 거의 필수적인 요소입니다.',
            '이곳에서 추가한 애니메이션은 자동으로 모든 씬에 등록됩니다.'
        ]"
        filename="animation.ts"
    />
</template>

<script lang="ts">
import path from 'path'
import normalize from 'normalize-path'
import increment from 'add-filename-increment'
import FileGeneratorComponent from '@/Renderer/components/Manager/FileGenerator.vue'
import { ipcRenderer, shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_DATA_DIRECTORY_NAME,
    PROJECT_SRC_DATA_ANIMATION_DIRECTORY_NAME
} from '@/Const'

@Component({
    components: {
        FileGeneratorComponent
    }
})
export default class AnimationMainComponent extends Vue {
    private cwd: string = path.resolve(
        this.$store.state.projectDirectory,
        PROJECT_SRC_DIRECTORY_NAME,
        PROJECT_SRC_DATA_DIRECTORY_NAME,
        PROJECT_SRC_DATA_ANIMATION_DIRECTORY_NAME
    )

    private async add(filePath: string): Promise<void> {
        const animsAdd: Engine.GameProject.AddAnimationSuccess|Engine.GameProject.AddAnimationFail = await ipcRenderer.invoke('add-animation', filePath)
        if (!animsAdd.success) {
            this.$store.dispatch('snackbar', animsAdd.message)
            return
        }
    }
}
</script>