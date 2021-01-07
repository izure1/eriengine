<template>
    <v-card
        :loading="loading"
        tile
        elevation="0"
    >

        <v-card-actions>

            <v-tooltip
                v-for="({ icon, description, action }, index) in buttons"
                :key="`explorer-buttons-${index}`"
                bottom
            >
                <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on" @click="action(currentPath)">
                        <v-icon color="blue-grey">{{ icon }}</v-icon>
                    </v-btn>
                </template>
                <span>{{ description }}</span>
            </v-tooltip>

        </v-card-actions>

        <file-list-component
            :cwd="cwd"
            :options="options"
            :preload="preload"
            :additional="additional"
            :singleLine="singleLine"
            :openFile="openFile"
            :openDirectory="openDirectory"
            :actions="actions"
            @update:structure="onDirectoryChange"
            @update:path="setCurrentDirectory"
        />

    </v-card>
</template>

<script lang="ts">
import { shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import FileListComponent, { props, ContextItemAction } from '@/Renderer/components/FileSystem/FileList.vue'

export { ContextItemAction } from '@/Renderer/components/FileSystem/FileList.vue'

@Component({
    props: {
        ...props,
        loading: {
            type: Boolean,
            default: false
        },
        buttons: {
            type: Array,
            default: () => []
        }
    },
    components: {
        FileListComponent
    }
})
export default class DirectoryExplorer extends Vue  {
    private cwd!: string
    private currentPath: string = this.cwd
    private openDirectory!: (filePath: string) => void
    private openFile!: (filePath: string) => void

    private onDirectoryChange(files: string[]): void {
        this.$emit('update:structure', files)
    }

    private setCurrentDirectory(currentPath: string): void {
        this.currentPath = currentPath
        this.$emit('update:path', currentPath)
    }
}
</script>