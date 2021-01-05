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
                        @click="open(getAbsolutePath(file))"
                    >

                        <v-list-item-content>
                            <v-list-item-title :class="{
                                'subtitle-1': isTwoLine,
                                'caption': !isTwoLine
                            }">
                                {{ getRelativePath(file) }}
                            </v-list-item-title>
                            <v-list-item-subtitle
                                v-if="isTwoLine"
                                class="caption"
                            >
                                {{ file }}
                            </v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-action class="flex-row">
                            <div
                                v-for="({ icon, description, action }, i) in actions"
                                :key="`file-list-action-${file}-${i}`"
                            >
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn icon v-on="on" @click.stop="action(file)">
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
import slash from 'slash'
import fs from 'fs-extra'
import { ipcRenderer, shell } from 'electron'
import { Options as GlobOptions } from 'fast-glob'
import { Vue, Component } from 'vue-property-decorator'

export interface ContextItemAction {
    icon: string
    description: string
    action: (filePath: string) => void
}

@Component({
    props: {
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
        globOption: {
            type: Object as () => GlobOptions,
            default: () => ({})
        },
        open: {
            type: Function,
            default: () => {}
        },
        filter: {
            type: Array,
            default: () => ['*']
        }
    }
})
export default class FileListComponent extends Vue {
    private cwd!: string
    private filter!: string[]
    private actions!: ContextItemAction
    private globOption!: GlobOptions
    private singleLine!: boolean
    private preload!: number
    private additional!: number
    private additionalReduce: number = 1
    private additionalLoaded: number = 0
    private open!: (filePath: string) => void
    
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

    private get mergedGlobOption(): GlobOptions {
        return { ...this.globOption, absolute: true }
    }

    private async setFiles(): Promise<void> {
        if (!this.cwd) return
        
        this.isLoaded = false
        const directoryRead: Engine.FileSystem.ReadDirectorySuccess|Engine.FileSystem.ReadDirectoryFail = await ipcRenderer.invoke('read-directory', this.cwd, this.filter, this.mergedGlobOption)
        this.isLoaded = true

        if (!directoryRead.success) {
            return
        }
        this.files = directoryRead.files
    }

    private loadMore(): void {
        this.additionalLoaded += (this.additional * this.additionalReduce)
        this.additionalReduce *= 2
        if (this.additionalLoaded > this.files.length) {
            this.additionalLoaded = this.files.length
        }
    }

    private getAbsolutePath(filePath: string): string {
        if (path.isAbsolute(filePath)) {
            return slash(filePath)
        }
        filePath = path.isAbsolute(filePath) ? slash(filePath) : path.resolve(this.cwd, filePath)
        return slash(filePath)
    }

    private getRelativePath(filePath: string): string {
        if (!path.isAbsolute(filePath)) {
            filePath = path.resolve(this.cwd, filePath)
        }
        return filePath.replace(slash(this.cwd), '').substr(1)
    }

    private async deleteFile(filePath: string): Promise<void> {
        filePath = this.getAbsolutePath(filePath)
        const fileDel: Engine.FileSystem.TrashSuccess|Engine.FileSystem.TrashFail = await ipcRenderer.invoke('trash', filePath, true)
        if (!fileDel.success) {
            this.$store.dispatch('snackbar', fileDel.message)
        }
    }

    private async onDirectoryUpdate(): Promise<void> {
        await this.setFiles()
        this.$emit('update', this.files)
    }

    private startWatcher(): void {
        if (this.watcher) {
            this.destroyWatcher()
        }
        this.watcher = fs.watch(this.cwd, { recursive: true }, this.onDirectoryUpdate)
    }

    private destroyWatcher(): void {
        if (!this.watcher) {
            return
        }
        this.watcher.close()
        this.watcher = null
    }

    created(): void {
        this.setFiles().then(this.startWatcher)
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