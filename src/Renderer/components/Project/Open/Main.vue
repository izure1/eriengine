<template>
  <v-card class="open"
    flat
    tile
    :loading="isLoading"
    :disabled="isLoading"
  >
    <v-card-title>프로젝트 열기  ☆ﾐ(o*･ω･)ﾉ</v-card-title>
    <v-card-text>
      <div v-if="isLoading">
        <p>
          프로젝트를 재구축하는 중입니다.
          <br>
          필요한 모듈을 다운로드받고 있으며, 몇 분 걸릴 수 있습니다. 이 작업에는 인터넷 연결이 필요합니다.
          <br>
          잠시만 기다려주세요.
        </p>
        <shell-channel-component channel="ensure-require-modules" />
      </div>
      <span v-else>프로젝트 디렉토리를 선택하세요.</span>
    </v-card-text>
    <v-card-actions>
      <v-spacer />

      <v-container class="text-center">
        <v-row>
          <v-col>
            <v-btn
              text
              min-width="150"
              @click="selectDirectory"
            >
              디렉토리 선택
            </v-btn>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-btn
              text
              min-width="150"
              @click="goBack"
            >
              돌아가기
            </v-btn>
          </v-col>
        </v-row>
      </v-container>

      <v-spacer />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { ipcRenderer } from 'electron'

import ShellChannelComponent from '@/Renderer/components/Shell/Channel.vue'

@Component({
  components: {
    ShellChannelComponent
  }
})
export default class OpenProjectComponent extends Vue {
  private isLoading: boolean = false

  private async selectDirectory(): Promise<void> {
    const directoryOpen: Engine.FileSystem.OpenDirectorySuccess|Engine.FileSystem.OpenDirectoryFail = await ipcRenderer.invoke('open-directory')
    if (!directoryOpen.success) {
      this.$store.dispatch('snackbar', directoryOpen.message)
      return
    }

    this.isLoading = true

    const projectRead: Engine.GameProject.ReadProjectSuccess|Engine.GameProject.ReadProjectFail = await ipcRenderer.invoke('read-project', directoryOpen.path)
    if (!projectRead.success) {
      this.isLoading = false
      this.$store.dispatch('snackbar', projectRead.message)
      return
    }

    const projectEnsure: Engine.GameProject.CreateProjectSuccess|Engine.GameProject.CreateProjectFail = await ipcRenderer.invoke('ensure-project', directoryOpen.path, projectRead.config)
    if (!projectEnsure.success) {
      this.isLoading = false
      this.$store.dispatch('snackbar', projectEnsure.message)
      return
    }

    const { path, config } = projectRead
    this.$store.dispatch('openProject', { path, config })
    this.$router.replace('/manager').catch(() => null)
  }

  private goBack(): void {
    this.$router.replace('/project/close').catch(() => null)
  }

  mounted(): void {
    this.selectDirectory()
  }
}
</script>

<style lang="scss" scoped>
.open {
  background-color: initial !important;
}
</style>