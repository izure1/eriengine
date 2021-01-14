<template>
    <file-generator-component
        :cwd="cwd"
        :add="add"
        :description="[
            '액터란 게임 내에서 등장하는 플레이어, NPC, 사물을 포함한 상호작용 가능한 모든 것들입니다.',
            '이곳에서 추가한 액터는 자동으로 모든 씬에 등록됩니다.'
        ]"
        filename="actor.ts"
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
    PROJECT_SRC_ACTOR_DIRECTORY_NAME
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
        PROJECT_SRC_ACTOR_DIRECTORY_NAME
    )

    private showPath(filePath: string): void {
        filePath = path.resolve(filePath)
        shell.showItemInFolder(filePath)
    }

    private async add(filePath: string): Promise<void> {
        const actorAdd: Engine.GameProject.AddActorSuccess|Engine.GameProject.AddActorFail = await ipcRenderer.invoke('add-actor', filePath)
        if (!actorAdd.success) {
            this.$store.dispatch('snackbar', actorAdd.message)
            return
        }
        this.showPath(filePath)
    }
}
</script>