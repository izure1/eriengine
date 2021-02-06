<template>
    <file-generator-component
        :cwd="cwd"
        :add="add"
        :description="[
            '액터란 플레이어, NPC, 사물을 포함한 게임 내에서 상호작용 가능한 모든 것들입니다.<br>액터는 물리엔진의 영향을 받습니다.',
            '이곳에서 추가한 액터는 자동으로 모든 씬에 등록됩니다.'
        ]"
        :extraContextmenus="extraContextmenus"
        :filename="getActorName"
    />
</template>

<script lang="ts">
import path from 'path'
import { nanoid } from 'nanoid'
import FileGeneratorComponent, { ContextItemAction } from '@/Renderer/components/Manager/FileGenerator.vue'
import { ipcRenderer } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import {
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_DATA_DIRECTORY_NAME,
    PROJECT_SRC_DATA_ACTOR_DIRECTORY_NAME
} from '@/Const'

@Component({
    components: {
        FileGeneratorComponent
    }
})
export default class AnimationMainComponent extends Vue {
    private cwd: string = path.resolve(
        this.projectDirectory,
        PROJECT_SRC_DIRECTORY_NAME,
        PROJECT_SRC_DATA_DIRECTORY_NAME,
        PROJECT_SRC_DATA_ACTOR_DIRECTORY_NAME
    )

    private extraContextmenus: ContextItemAction[] = [
        {
            icon: 'mdi-script-text-outline',
            description: '스크립트 파일을 찾습니다',
            action: (filePath: string): void => {
                this.$router.replace(`/manager/actor/script/${encodeURIComponent(filePath)}`).catch(() => null)
            }
        },
    ]

    private get projectDirectory(): string {
        return this.$store.state.projectDirectory
    }

    private getActorName(): string {
        return `actor.${nanoid(10)}.ts`
    }

    private async add(filePath: string): Promise<void> {
        const actorAdd: Engine.GameProject.AddActorSuccess|Engine.GameProject.AddActorFail = await ipcRenderer.invoke('add-actor', this.projectDirectory, filePath)
        if (!actorAdd.success) {
            this.$store.dispatch('snackbar', actorAdd.message)
            return
        }
    }
}
</script>