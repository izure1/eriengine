<template>
  <file-generator-component
    :cwd="cwd"
    :add="add"
    :description="[
      '액터가 사용할 수 있는 아이템을 생성합니다.<br>액터가 아이템을 사용했을 때, 어떤 효과를 부여할지 프로그래밍할 수 있습니다.',
      '이곳에서 추가한 아이템들은 자동으로 모든 인벤토리 시스템에 등록됩니다.'
    ]"
    filename="item.ts"
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
  PROJECT_SRC_DATA_ITEM_DIRECTORY_NAME
} from '@/Const'

@Component({
  components: {
    FileGeneratorComponent
  }
})
export default class ItemMainComponent extends Vue {
  private cwd: string = path.resolve(
    this.$store.state.projectDirectory,
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_DATA_DIRECTORY_NAME,
    PROJECT_SRC_DATA_ITEM_DIRECTORY_NAME
  )

  private async add(filePath: string): Promise<void> {
    const itemAdd: Engine.GameProject.AddItemSuccess|Engine.GameProject.AddItemSuccess = await ipcRenderer.invoke('add-item', filePath)
    if (!itemAdd.success) {
      this.$store.dispatch('snackbar', itemAdd.message)
      return
    }
  }
}
</script>