<template>
    <file-generator-component
        :cwd="cwd"
        :add="add"
        :description="[
            '액터가 사용할 수 있는 스킬을 생성합니다.<br>액터가 스킬을 사용했을 때, 어떤 효과를 부여할지 프로그래밍할 수 있습니다.',
            '이곳에서 추가한 스킬들은 자동으로 모든 액터에 등록됩니다.'
        ]"
        filename="skill.ts"
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
    PROJECT_SRC_DATA_SKILL_DIRECTORY_NAME
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
        PROJECT_SRC_DATA_DIRECTORY_NAME,
        PROJECT_SRC_DATA_SKILL_DIRECTORY_NAME
    )

    private async add(filePath: string): Promise<void> {
        const skillAdd: Engine.GameProject.AddSkillSuccess|Engine.GameProject.AddSkillFail = await ipcRenderer.invoke('add-skill', filePath)
        if (!skillAdd.success) {
            this.$store.dispatch('snackbar', skillAdd.message)
            return
        }
    }
}
</script>