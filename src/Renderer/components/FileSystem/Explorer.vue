<template>
  <section>
    <v-card
      flat
      tile
      :loading="isLoading"
      :disabled="isLoading"
    >

      <v-card-subtitle class="overline pb-0">{{ cwdOffset }}</v-card-subtitle>
      <v-card-actions>
        <v-tooltip v-for="({ icon, description, action }, index) in actions"
          :key="`file-list-actions-${index}`"
          bottom
        >
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              v-on="on"
              @click="action(currentPath)"
            >
              <v-icon color="eribrown">{{ icon }}</v-icon>
            </v-btn>
          </template>
          <span>{{ description }}</span>
        </v-tooltip>
      </v-card-actions>
      
      <v-list v-if="loadedFiles.length"
        :two-line="isTwoLine"
        dense
      >
        <transition-group name="fade" >
          <v-list-item v-for="file in loadedFiles"
            :key="`file-list-${file}`"
            @click="open(file)"
          >

            <v-list-item-avatar>
              <v-icon>{{ getFileMaterialIcon(file) }}</v-icon>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title :class="{ 'subtitle-1': isTwoLine, 'caption': !isTwoLine }">
                {{ getRelativePath(file) }}
              </v-list-item-title>
              <v-list-item-subtitle
                v-if="isTwoLine"
                class="caption"
              >
                {{ getAbsolutePath(file) }}
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action v-if="!isUpperDirectory(file) && contextmenus.length"
              class="flex-row" 
            >
              <v-menu
                open-on-hover
                close-delay="250"
                offset-y
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    icon
                    v-on="on"
                    @click.stop=""
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item v-for="({ icon, description, action }, i) in contextmenus"
                    :key="`file-list-contextmenu-${file}-${i}`"
                  >
                    <v-tooltip left>
                      <template v-slot:activator="{ on }">
                        <v-list-item-title>
                          <v-btn
                            icon
                            v-on="on"
                            @click.stop="action(getAbsolutePath(file))"
                          >
                            <v-icon color="eribrown">{{ icon }}</v-icon>
                          </v-btn>
                        </v-list-item-title>
                      </template>
                      <span class="caption">{{ description }}</span>
                    </v-tooltip>
                  </v-list-item>
                </v-list>
              </v-menu>
                
            </v-list-item-action>
          </v-list-item>
        </transition-group>
      </v-list>
      <div v-else
        class="grey--text body-2 lighten-5 text-center py-10"
      >
        {{ isSearching ? '탐색 중입니다' : '디렉토리가 비어있습니다' }}
      </div>
      <div v-if="!isAllLoaded"
        class="text-center pa-2"
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              text
              v-on="on"
              @click="loadMore"
            >
              <v-icon color="eribrown">mdi-dots-horizontal</v-icon>
            </v-btn>
          </template>
          <span>더 불러오기</span>
        </v-tooltip>
      </div>
    </v-card>
  </section>
</template>

<script lang="ts">
import path from 'path'
import normalize from 'normalize-path'
import fs from 'fs-extra'
import { ipcRenderer } from 'electron'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { FileWatcher } from '@/Utils/FileWatcher'

export interface ContextItemAction {
  icon: string
  description: string
  action: (_filePath: string) => void
}

export const props = {
  cwd: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  preload: {
    type: Number,
    default: Number.MAX_SAFE_INTEGER
  },
  additional: {
    type: Number,
    default: 10
  },
  singleline: {
    type: Boolean,
    default: true
  },
  actions: {
    type: Array,
    default: () => []
  },
  contextmenus: {
    type: Array,
    default: () => []
  },
  options: {
    type: Object as () => Engine.FileSystem.FileSearchFilter,
    default: () => ({})
  },
  openDirectory: {
    type: Function,
    default(this: ExplorerComponent, filePath: string): void {
      this.openDirectoryDefault(filePath)
    }
  },
  openFile: {
    type: Function,
    default: () => ({})
  }
}

@Component({
  props
})
export default class ExplorerComponent extends Vue {
  private cwd!: string
  private loading!: boolean
  private options!: Engine.FileSystem.FileSearchFilter
  private singleline!: boolean
  private preload!: number
  private additional!: number
  private additionalReduce: number = 1
  private additionalLoaded: number = 0
  private currentPath: string = ''
  private openDirectory!: (_filePath: string) => void
  private openFile!: (_filePath: string) => void
  
  private files: string[] = []
  private isSearching: boolean = false

  private watcher: FileWatcher|null = null

  private get loadedFiles(): string[] {
    return this.files.slice(0, this.preload + this.additionalLoaded)
  }

  private get isAllLoaded(): boolean {
    return this.loadedFiles.length >= this.files.length
  }

  private get isLoading(): boolean {
    return this.loading || this.isSearching
  }

  private get isTwoLine(): boolean {
    return !this.singleline
  }

  private get cwdOffset(): string {
    const current = normalize(this.currentPath)
    const cwd = normalize(this.cwd)
    return current.replace(cwd, '')
  }

  private async setFiles(): Promise<void> {
    if (!this.currentPath) return
    
    this.isSearching = true
    const directoryRead: Engine.FileSystem.ReadDirectorySuccess|Engine.FileSystem.ReadDirectoryFail = await ipcRenderer.invoke('read-directory', this.currentPath, { ...this.options, absolute: false })
    this.isSearching = false

    if (!directoryRead.success) {
      return
    }

    // 최상위 탐색 디렉토리가 아닐 경우, 상위 이동 경로를 추가해야 함
    const cwd = this.getAbsolutePath(this.cwd)
    const current = this.getAbsolutePath(this.currentPath)

    this.files = directoryRead.files
    if (path.relative(cwd, current))  {
      this.files.unshift('..')
    }
  }

  private loadMore(): void {
    this.additionalLoaded += (this.additional * this.additionalReduce)
    this.additionalReduce *= 2
    if (this.additionalLoaded > this.files.length) {
      this.additionalLoaded = this.files.length
    }
  }

  private getAbsolutePath(filename: string): string {
    if (path.isAbsolute(filename)) {
      return normalize(filename)
    }
    const result = path.isAbsolute(filename) ? filename : path.resolve(this.currentPath, filename)
    return normalize(result)
  }

  private getRelativePath(filename: string): string {
    if (!path.isAbsolute(filename)) {
      return filename
    }
    const result = path.relative(this.currentPath, filename)
    return normalize(result)
  }

  private async open(filename: string): Promise<void> {
    const dist = this.getAbsolutePath(filename)
    const stat = await fs.lstat(dist)
    if (stat.isDirectory()) {
      this.openDirectory(dist)
    }
    else if (stat.isFile()) {
      this.openFile(dist)
    }
  }

  protected openDirectoryDefault(filePath: string): void {
    this.currentPath = filePath
    this.onDirectoryPathChange()
}

  private async onDirectoryUpdate(): Promise<void> {
    await this.setFiles()
    this.$emit('update:structure', this.files)
  }

  private isUpperDirectory(filename: string): boolean {
    return path.basename(filename) === '..'
  }

  private startWatcher(): void {
    if (this.watcher) {
      this.destroyWatcher()
    }
    this.watcher = new FileWatcher(this.currentPath).update(this.onDirectoryUpdate).start()
  }

  private destroyWatcher(): void {
    if (!this.watcher) {
      return
    }
    this.watcher.destroy()
    this.watcher = null
  }

  private onDirectoryPathChange(): void {
    this.destroyWatcher()
    this.startWatcher()
    this.setFiles()
    this.$emit('update:path', this.currentPath)
  }

  private getFileMaterialIcon(filePath: string): string {
    switch (path.parse(filePath).ext) {
      // directory
      case '':        return 'mdi-folder-outline'

      // language
      case '.ts':     return 'mdi-language-typescript'
      case '.js':     return 'mdi-language-javascript'
      case '.tson':
      case '.json':    return 'mdi-code-json'

      // image
      case '.png':
      case '.jpg':
      case '.gif':
      case '.jpeg':
      case '.webp':   return 'mdi-image-outline'

      // audio
      case '.ogg':
      case '.wav':
      case '.mp3':    return 'mdi-music-note-outline'

      // video
      case '.webm':
      case '.mp4':    return 'mdi-video-outline'

      // font
      case '.woff':
      case '.woff2':  return 'mdi-format-font'

      // text
      case '.txt':    return 'mdi-file-document-outline'

      // else
      default:        return 'mdi-file-outline'
    }
  }

  @Watch('cwd', { immediate: true })
  private onChangeCwd(): void {
    this.currentPath = normalize(this.cwd)
    this.onDirectoryPathChange()
  }

  created(): void {
    this.onDirectoryPathChange()
  }

  beforeDestroy(): void {
    this.destroyWatcher()
  }
}
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s linear, transform 0.15s linear;
}
.fade-enter,
.fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
.fade-enter-to,
.fade-leave {
  transform: translateY(0);
  opacity: 1;
}
</style>