<template>
    <file-generator-component
        :cwd="cwd"
        :add="add"
        :description="[
            '오디오 에셋을 이용하여 오디오를 생성합니다. 사운드 재생을 위해 사용됩니다.',
            '이곳에서 추가한 오디오는 자동으로 모든 씬에 등록됩니다.'
        ]"
        filename="audio.ts"
    />
</template>

<script lang="ts">
import path from 'path'
import { ipcRenderer } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import FileGeneratorComponent from '@/Renderer/components/Manager/FileGenerator.vue'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_DATA_DIRECTORY_NAME,
    PROJECT_SRC_DATA_AUDIO_DIRECTORY_NAME
} from '@/Const'

@Component({
    components: {
        FileGeneratorComponent
    }
})
export default class AudioMainComponent extends Vue {
    private cwd: string = path.resolve(
        this.$store.state.projectDirectory,
        PROJECT_SRC_DIRECTORY_NAME,
        PROJECT_SRC_DATA_DIRECTORY_NAME,
        PROJECT_SRC_DATA_AUDIO_DIRECTORY_NAME
    )

    private async add(filePath: string): Promise<void> {
        const audioAdd: Engine.GameProject.AddAudioSuccess|Engine.GameProject.AddAudioFail = await ipcRenderer.invoke('add-audio', filePath)
        if (!audioAdd.success) {
            this.$store.dispatch('snackbar', audioAdd.message)
            return
        }
    }
}
</script>