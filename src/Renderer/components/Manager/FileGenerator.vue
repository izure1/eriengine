<template>
  <section>
    <v-card
      flat
      tile
    >
      <v-card-text>
        <p v-for="(text, index) in description"
          v-html="text"
          :key="`generator-text-${index}`"
          class="caption"
        />
      </v-card-text>
    </v-card>
    <explorer-component
      :cwd="cwd"
      :actions="actions"
      :options="{ extensions: ['ts'] }"
      :preload="10"
      :openFile="openPath"
      :contextmenus="contextmenus"
      @update:path="setCurrentDirectory"
    />
    <v-dialog v-model="isNamingDialogOpen"
      max-width="600"
      persistent
    >
      <v-card>
        <v-card-title>이름을 입력하세요</v-card-title>
        <v-card-subtitle>이름을 변경하면 이 파일을 참조하는 다른 파일에서도 수정해야합니다</v-card-subtitle>
        <v-card-text>
          <v-text-field v-model="namingText"
            :rules="[ namingRule ]"
            :suffix="namingExt"
            ref="dialog-naming"
            label="이름"
            placeholder="이곳에 입력하세요"
            filled
            rounded
          />
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dispatchNaming">완료</v-btn>
          <v-btn text @click="cancelNaming">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script lang="ts">
import path from 'path'
import normalize from 'normalize-path'
import isValidFilename from 'valid-filename'
import sanitize from 'sanitize-filename'
import { Vue, Component } from 'vue-property-decorator'
import { ipcRenderer, shell } from 'electron'
import increment from 'add-filename-increment'
import ExplorerComponent, { ContextItemAction } from '@/Renderer/components/FileSystem/Explorer.vue'
export { ContextItemAction } from '@/Renderer/components/FileSystem/Explorer.vue'


type Rule = (v: string) => boolean|string;

@Component({
  components: {
    ExplorerComponent
  },
  props: {
    cwd: {
      type: String,
      required: true
    },
    filename: {
      type: [ String, Function ],
      required: true
    },
    add: {
      type: Function,
      required: true
    },
    extraActions: {
      type: Array,
      default: () => []
    },
    extraContextmenus: {
      type: Array,
      default: () => []
    },
    description: {
      type: Array,
      default: () => []
    }
  }
})
export default class GeneratorComponent extends Vue {
  private cwd!: string
  private filename!: string|(() => string)
  private extraActions!: ContextItemAction[]
  private extraContextmenus!: ContextItemAction[]
  private add!: (filePath: string) => Promise<void>
  private currentPath: string = normalize(this.cwd)

  private isNamingDialogOpen: boolean = false
  private namingText: string = ''
  private namingExt: string = ''

  private actions: ContextItemAction[] = [
    {
      icon: 'mdi-plus',
      description: '파일 추가',
      action: (): void => {
        const filePath: string = this.getNewFilePath()
        this.add(filePath)
        this.modifyFileName(filePath)
      }
    },
    {
      icon: 'mdi-folder-plus-outline',
      description: '폴더 추가',
      action: async (directoryPath: string): Promise<void> => {
        const name = await this.receiveNaming()
        const dirname = path.resolve(directoryPath, name)

        const directoryMake: Engine.FileSystem.MakeDirectorySuccess|Engine.FileSystem.MakeDirectoryFail = await ipcRenderer.invoke('make-directory', dirname)
        if (!directoryMake.success) {
          this.$store.dispatch('snackbar', directoryMake.message)
        }
      }
    },
    {
      icon: 'mdi-folder-open-outline',
      description: '폴더 열기',
      action: (directoryPath: string): void => {
        this.openPath(directoryPath)
      }
    },
    ...this.extraActions
  ]

  private contextmenus: ContextItemAction[] = [
    ...this.extraContextmenus,
    {
      icon: 'mdi-form-textbox',
      description: '이름을 변경합니다',
      action: async (src: string): Promise<void> => {
        this.modifyFileName(src)
      }
    },
    {
      icon: 'mdi-open-in-new',
      description: '파일로 이동합니다',
      action: (filePath: string): void => {
        ipcRenderer.invoke('show-item', filePath)
      }
    },
    {
      icon: 'mdi-delete-outline',
      description: '파일을 삭제합니다',
      action: async (filePath: string): Promise<void> => {
        const trash: Engine.FileSystem.TrashSuccess|Engine.FileSystem.TrashFail = await ipcRenderer.invoke('trash', filePath, true)
        if (!trash.success) {
          this.$store.dispatch('snackbar', trash.message)
        }
      }
    }
  ]

  private get projectDirectory(): string {
    return this.$store.state.projectDirectory
  }

  private get namingRule(): Rule {
    return (v: string) => v && isValidFilename(v) || '올바르지 않은 이름입니다'
  }

  private setCurrentDirectory(directoryPath: string): void {
    this.currentPath = normalize(directoryPath)
  }

  private getNewFilePath(): string {
    const filename: string = typeof this.filename === 'function' ? this.filename() : this.filename
    return normalize(
      increment(path.resolve(this.currentPath, filename), { fs: true })
    )
  }

  private openPath(filePath: string): void {
    shell.openPath(filePath)
  }

  private async modifyFileName(src: string): Promise<void> {
    const basename = path.basename(src)
    const namewords = basename.split('.')

    const before = namewords.shift()!
    const after = await this.receiveNaming(before, `.${namewords.join('.')}`)

    const dist = path.resolve(path.dirname(src), after)

    const renaming: Engine.FileSystem.RenameSuccess|Engine.FileSystem.RenameFail = await ipcRenderer.invoke('rename', src, dist)
    if (!renaming.success) {
      this.$store.dispatch('snackbar', renaming.message)
    }
  }

  private receiveNaming(defaultName?: string, defaultExt?: string): Promise<string> {
    return new Promise((resolve): void => {
      this.openNamingDialog(defaultName, defaultExt)
      this.$once('dispatch-naming', (filename: string): void => {
        resolve(sanitize(filename))
      })
    })
  }

  private openNamingDialog(defaultName: string = '', defaultExt: string = ''): void {
    this.isNamingDialogOpen = true
    this.namingText = defaultName
    this.namingExt = defaultExt
  }

  private cancelNaming(): void {
    this.isNamingDialogOpen = false
    this.namingText = ''
  }

  private dispatchNaming(): void {
    this.$emit('dispatch-naming', this.namingText + this.namingExt)
    this.isNamingDialogOpen = false
    this.namingText = ''
  }
}
</script>