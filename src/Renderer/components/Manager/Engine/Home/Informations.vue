<template>
  <v-container>
    <v-row>
      <v-col>
        <v-list>
          <v-subheader>요약</v-subheader>
          <v-list-item
            three-line
            dense
          >
            <v-list-item-content>
              <v-list-item-title>용량</v-list-item-title>
              <v-list-item-subtitle>
                <span class="text--primary">합계</span> - {{ fixedNumber(totalSize) }}MB
                <br>
                <span class="text--primary">에셋</span> - {{ fixedNumber(assetSize) }}MB
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-content>
              <v-list-item-title>파일 갯수</v-list-item-title>
              <v-list-item-subtitle>
                <span class="text--primary">합계</span> - {{ totalCount.toLocaleString() }}개
                <br>
                <span class="text--primary">에셋</span> - {{ assetCount.toLocaleString() }}개
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-content>
              <v-list-item-title>스토리지 갯수</v-list-item-title>
              <v-list-item-subtitle>
                <span class="text--primary">합계</span> - {{ totalStorageCount.toLocaleString() }}개
                <br>
                <span class="text--primary">비활성화</span> - {{ uselessStorageCount.toLocaleString() }}개

                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on"
                      @click="cleanUselessStorage"
                      icon
                      x-small
                      left
                    >
                      <v-icon small>mdi-cached</v-icon>
                    </v-btn>
                  </template>
                  <span>비활성화 된 스토리지를 삭제합니다</span>
                </v-tooltip>

              </v-list-item-subtitle>
            </v-list-item-content>

          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import path from 'path'
import { ipcRenderer } from 'electron'

import { Vue, Component } from 'vue-property-decorator'
import normalize from 'normalize-path'
import getFolderSize from 'get-folder-size'
import glob from 'fast-glob'

import {
  PROJECT_SRC_DIRECTORY_NAME,
  PROJECT_SRC_ASSET_DIRECTORY_NAME
} from '@/Const'

@Component
export default class EngineHomeInformationComponent extends Vue {
  private assetSize: number = 0
  private totalSize: number = 0
  private assetCount: number = 0
  private totalCount: number = 0
  private totalStorageCount: number = 0
  private uselessStorageCount: number = 0

  private get projectDirectory(): string {
    return this.$store.state.projectDirectory
  }

  private get sourceDirectory(): string {
    return normalize(path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME))
  }

  private get assetDirectory(): string {
    return normalize(path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME))
  }

  private byteToMB(byteSize: number): number {
    return byteSize / 1024 / 1024
  }

  private fixedNumber(size: number): string {
    return size.toFixed(2)
  }

  private async getSize(cwd: string): Promise<number> {
    return new Promise((resolve, reject) => {
      getFolderSize(cwd, (err, size) => {
        if (err) {
          return reject(err)
        }
        resolve(size)
      })
    })
  }

  private async getFileCount(cwd: string): Promise<number> {
    const files = await glob('**/*', { cwd, onlyFiles: true })
    return files.length
  }

  private async getStorageCount(): Promise<number> {
    const allStorageKeysGet: Engine.GameProject.GetAllStorageKeysSuccess|Engine.GameProject.GetAllStorageKeysFail = await ipcRenderer.invoke('get-all-storage-keys', this.projectDirectory)
    if (!allStorageKeysGet.success) {
      return 0
    }
    return allStorageKeysGet.files.length
  }

  private async getUselessStorageCount(): Promise<number> {
    const uselessStorageKeysGet: Engine.GameProject.GetUselessStorageKeysSuccess|Engine.GameProject.GetUselessStorageKeysFail = await ipcRenderer.invoke('get-useless-storage-keys', this.projectDirectory)
    if (!uselessStorageKeysGet.success) {
      return 0
    }
    return uselessStorageKeysGet.files.length
  }

  private async cleanUselessStorage(): Promise<void> {
    const uselessStorageDelete: Engine.GameProject.DeleteUselessStorageDirectoriesSuccess|Engine.GameProject.DeleteUselessStorageDirectoriesFail = await ipcRenderer.invoke('delete-useless-storage-directories', this.projectDirectory)
    if (!uselessStorageDelete.success) {
      this.$store.dispatch('snackbar', '비활성화 스토리지 정리에 실패했습니다')
      return
    }
    this.totalStorageCount = await this.getStorageCount()
    this.uselessStorageCount = await this.getUselessStorageCount()
  }

  async mounted() {
    this.totalSize = this.byteToMB(await this.getSize(this.sourceDirectory))
    this.assetSize = this.byteToMB(await this.getSize(this.assetDirectory))
    this.totalCount = await this.getFileCount(path.resolve(this.sourceDirectory))
    this.assetCount = await this.getFileCount(path.resolve(this.assetDirectory))
    this.totalStorageCount = await this.getStorageCount()
    this.uselessStorageCount = await this.getUselessStorageCount()
  }
}
</script>