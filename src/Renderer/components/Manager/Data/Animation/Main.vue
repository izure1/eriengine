<template>
    <file-generator-component
        :cwd="cwd"
        :add="add"
        :description="[
            '스프라이트 에셋을 이용하여 애니메이션을 생성합니다.<br>움직이지 않는 이미지와 달리, 애니메이션은 움직임을 표현하는 이미지입니다. 카메라의 필름이라 생각해도 좋습니다.',
            '스프라이트 에셋에 몇 개의 프레임이 들어있고, 한 프레임의 가로세로 크기는 몇인지를 설정해야 합니다.<br>그리고 재생 속도와 반복여부를 설정하십시오.',
            '이곳에서 추가한 애니메이션은 자동으로 모든 씬에 등록됩니다.'
        ]"
        filename="animation.ts"
    />
</template>

<script lang="ts">
import path from 'path'
import FileGeneratorComponent from '@/Renderer/components/Manager/FileGenerator.vue'
import { ipcRenderer } from 'electron'
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