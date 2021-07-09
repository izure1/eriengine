<template>
  <v-container>
    <v-row>
      <v-col>
        <v-list>
          <v-subheader>요약</v-subheader>
          <v-list-item
            two-line
            dense
          >
            <v-list-item-content>
              <v-list-item-title>용량</v-list-item-title>
              <v-list-item-subtitle>{{ normalizeGB(size) }}GB</v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-content>
              <v-list-item-title>파일 갯수</v-list-item-title>
              <v-list-item-subtitle>{{ fileCount.toLocaleString() }}개</v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-content>
              <v-list-item-title>스토리지 갯수</v-list-item-title>
              <v-list-item-subtitle>{{ storageCount.toLocaleString() }}개</v-list-item-subtitle>
            </v-list-item-content>

          </v-list-item>
        </v-list>
      </v-col>

      <v-col>
        <v-list>
          <v-subheader>최적화</v-subheader>
          <v-list-item
            three-line
            dense
          >
            <v-list-item-content>
              <v-list-item-title>사용되지 않는 스토리지 갯수</v-list-item-title>
              <v-list-item-subtitle>{{ uselessStorageCount.toLocaleString() }}개</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                icon
                left
              >
                <v-icon>mdi-delete-forever</v-icon>
              </v-btn>
            </v-list-item-action>
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
import getFolderSize from 'get-folder-size'
import glob from 'fast-glob'

import {
  PROJECT_SRC_DIRECTORY_NAME
} from '@/Const'

@Component
export default class EngineHomeInformationComponent extends Vue {
  private size: number = 0
  private fileCount: number = 0
  private storageCount: number = 0
  private uselessStorageCount: number = 0

  private get projectDirectory(): string {
    return this.$store.state.projectDirectory
  }

  private byteToGB(byteSize: number): number {
    return byteSize / 1024 / 1024 / 1024
  }

  private normalizeGB(size: number): string {
    return size.toFixed(2)
  }

  private async getSize(): Promise<number> {
    return new Promise((resolve, reject) => {
      getFolderSize(this.projectDirectory, (err, size) => {
        if (err) {
          return reject(err)
        }
        resolve(size)
      })
    })
  }

  private async getFileCount(): Promise<number> {
    const cwd = path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME)
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

  async mounted() {
    this.size = this.byteToGB(await this.getSize())
    this.fileCount = await this.getFileCount()
    this.storageCount = await this.getStorageCount()
    this.uselessStorageCount = await this.getUselessStorageCount()
  }
}
</script>