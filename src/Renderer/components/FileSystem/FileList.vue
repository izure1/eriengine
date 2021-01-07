<template>
    <section>
        <v-card flat :loading="!isLoaded">
            <v-list
                v-if="loadedFiles.length"
                :two-line="isTwoLine"
                dense
            >
                <transition-group name="fade" >
                    <v-list-item
                        v-for="file in loadedFiles"
                        :key="`file-list-${file}`"
                        @click="open(file)"
                    >

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

                        <v-list-item-action class="flex-row" v-if="!isUpperDirectory(file)">
                            <div
                                v-for="({ icon, description, action }, i) in actions"
                                :key="`file-list-action-${file}-${i}`"
                            >
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn icon v-on="on" @click.stop="action(getAbsolutePath(file))">
                                            <v-icon color="blue-grey">{{ icon }}</v-icon>
                                        </v-btn>
                                    </template>
                                    <span class="caption">{{ description }}</span>
                                </v-tooltip>
                            </div>
                        </v-list-item-action>

                    </v-list-item>
                </transition-group>
            </v-list>
            <div v-else class="grey--text body-2 lighten-5 text-center py-10">
                {{ isLoaded ? '디렉토리가 비어있습니다' : '탐색 중입니다' }}
            </div>
            <div
                v-if="!isAllLoaded"
                class="text-center pa-2"
            >
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn text @click="loadMore" v-on="on">
                            <v-icon class="blue-grey--text">mdi-dots-horizontal</v-icon>
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
import { ipcRenderer, shell } from 'electron'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { PropOptions } from 'vue'

export interface ContextItemAction {
    icon: string
    description: string
    action: (filePath: string) => void
}

export const props = {
    cwd: {
        type: String,
        required: true
    },
    preload: {
        type: Number,
        default: Number.MAX_SAFE_INTEGER
    },
    additional: {
        type: Number,
        default: 10
    },
    singleLine: {
        type: Boolean,
        default: true
    },
    actions: {
        type: Array,
        default: () => []
    },
    options: {
        type: Object as () => Engine.FileSystem.FileSearchFilter,
        default: () => ({})
    },
    openDirectory: {
        type: Function,
        default(this: FileListComponent, filePath: string): void {
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
export default class FileListComponent extends Vue {
    private cwd!: string
    private actions!: ContextItemAction
    private options!: Engine.FileSystem.FileSearchFilter
    private singleLine!: boolean
    private preload!: number
    private additional!: number
    private additionalReduce: number = 1
    private additionalLoaded: number = 0
    private currentPath: string = this.cwd
    private openDirectory!: (filePath: string) => void
    private openFile!: (filePath: string) => void
    
    private files: string[] = []
    private isLoaded: boolean = false

    private watcher: fs.FSWatcher|null = null

    private get loadedFiles(): string[] {
        return this.files.slice(0, this.preload + this.additionalLoaded)
    }

    private get isAllLoaded(): boolean {
        return this.loadedFiles.length >= this.files.length
    }

    private get isTwoLine(): boolean {
        return !this.singleLine
    }

    private async setFiles(): Promise<void> {
        if (!this.currentPath) return
        
        this.isLoaded = false
        const directoryRead: Engine.FileSystem.ReadDirectorySuccess|Engine.FileSystem.ReadDirectoryFail = await ipcRenderer.invoke('read-directory', this.currentPath, { ...this.options, absolute: false })
        this.isLoaded = true

        if (!directoryRead.success) {
            return
        }

        // 최상위 탐색 디렉토리가 아닐 경우, 상위 이동 경로를 추가해야 함
        const cwd: string = this.getAbsolutePath(this.cwd)
        const current: string = this.getAbsolutePath(this.currentPath)

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
        const result: string = path.isAbsolute(filename) ? filename : path.resolve(this.currentPath, filename)
        return normalize(result)
    }

    private getRelativePath(filename: string): string {
        if (!path.isAbsolute(filename)) {
            return filename
        }
        return normalize(filename).replace( normalize(this.currentPath), '' ).substr(1)
    }

    private async deleteFile(filename: string): Promise<void> {
        const target: string = this.getAbsolutePath(filename)
        const fileDel: Engine.FileSystem.TrashSuccess|Engine.FileSystem.TrashFail = await ipcRenderer.invoke('trash', target, true)
        if (!fileDel.success) {
            this.$store.dispatch('snackbar', fileDel.message)
        }
    }

    private async open(filename: string): Promise<void> {
        const dist: string = this.getAbsolutePath(filename)
        const stat: fs.Stats = await fs.lstat(dist)
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
        if (!fs.existsSync(this.currentPath)) {
            return
        }
        this.watcher = fs.watch(this.currentPath, { recursive: false }, this.onDirectoryUpdate)
    }

    private destroyWatcher(): void {
        if (!this.watcher) {
            return
        }
        this.watcher.close()
        this.watcher = null
    }

    private onDirectoryPathChange(): void {
        this.destroyWatcher()
        this.startWatcher()
        this.setFiles()
        this.$emit('update:path', this.currentPath)
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