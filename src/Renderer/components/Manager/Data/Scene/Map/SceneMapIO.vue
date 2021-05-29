<template>
  <section>
    <v-dialog v-model="isLoading"
      max-width="500"
    >
      <v-card :loading="isLoading">
        <v-card-title>데이터를 불러오는 중...</v-card-title>
        <v-card-text>잠시 기다려 주세요.</v-card-text>
      </v-card>
    </v-dialog>
    
    <v-dialog v-model="isSaving"
      max-width="500"
    >
      <v-card :loading="isSaving">
        <v-card-title>데이터를 기록하는 중...</v-card-title>
        <v-card-text>잠시 기다려 주세요.</v-card-text>
      </v-card>
    </v-dialog>
  </section>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { ipcRenderer } from 'electron'

import { getStorageKeyFromFilename } from '@/Utils/getStorageKeyFromFilename'

@Component
export default class SceneMapManagerComponent extends Vue {
  private isLoading: boolean = false
  private isSaving: boolean = false

  private get projectDirectory(): string {
    return this.$store.state.projectDirectory
  }

  private get storageKey(): string {
    const filePath = decodeURIComponent(this.$route.params.filePath)
    return getStorageKeyFromFilename(filePath)
  }

  async read(): Promise<Engine.GameProject.SceneMap|null> {
    this.isLoading = true

    const mapRead: Engine.GameProject.ReadSceneMapSuccess|Engine.GameProject.ReadSceneMapFail = await ipcRenderer.invoke('read-scene-map', this.projectDirectory, this.storageKey)

    this.isLoading = false

    return mapRead.success ? mapRead.content : null
  }

  async write(map: Engine.GameProject.SceneMap): Promise<boolean> {
    this.isSaving = true

    const mapWrite: Engine.GameProject.WriteSceneMapSuccess|Engine.GameProject.WriteSceneMapFail = await ipcRenderer.invoke('write-scene-map', this.projectDirectory, this.storageKey, map)

    this.isSaving = false

    return mapWrite.success
  }
}
</script>