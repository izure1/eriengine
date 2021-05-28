<template>
  <file-generator-component
    :cwd="cwd"
    :add="add"
    :description="[
      '이미지 에셋을 이용하여 이미지를 생성합니다.<br>이미지는 애니메이션을 지원하지 않습니다. 즉, 움짤이 아닙니다. 해당 기능은 애니메이션을 이용하십시오.',
      '이곳에서 추가한 이미지는 자동으로 모든 씬에 등록됩니다.'
    ]"
    filename="image.ts"
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
  PROJECT_SRC_DATA_IMAGE_DIRECTORY_NAME
} from '@/Const'

@Component({
  components: {
    FileGeneratorComponent
  }
})
export default class ImageMainComponent extends Vue {
  private cwd: string = path.resolve(
    this.$store.state.projectDirectory,
    PROJECT_SRC_DIRECTORY_NAME,
    PROJECT_SRC_DATA_DIRECTORY_NAME,
    PROJECT_SRC_DATA_IMAGE_DIRECTORY_NAME
  )

  private async add(filePath: string): Promise<void> {
    const imageAdd: Engine.GameProject.AddImageSuccess|Engine.GameProject.AddImageFail = await ipcRenderer.invoke('add-image', filePath)
    if (!imageAdd.success) {
      this.$store.dispatch('snackbar', imageAdd.message)
      return
    }
  }
}
</script>