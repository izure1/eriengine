<template>
    <section>
        <v-card tile elevation="0">

            <v-card-actions>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn icon v-on="on" @click="add">
                            <v-icon color="blue-grey">mdi-plus</v-icon>
                        </v-btn>
                    </template>
                    <span>스크립트 추가</span>
                </v-tooltip>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn icon v-on="on" @click="openDirectory">
                            <v-icon color="blue-grey">mdi-folder-open-outline</v-icon>
                        </v-btn>
                    </template>
                    <span>폴더 열기</span>
                </v-tooltip>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn icon v-on="on" @click="goBack">
                            <v-icon color="blue-grey">mdi-arrow-left</v-icon>
                        </v-btn>
                    </template>
                    <span>뒤로</span>
                </v-tooltip>

            </v-card-actions>

            <file-list-component
                :cwd="cwd"
                :filter="filters"
                :preload="10"
                :open="openFile"
            />

        </v-card>
    </section>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import { PROJECT_SCENE_SCRIPT_DIRECTORY_NAME } from '@/Const'
import BaseComponent from './BaseComponent'
import FileListComponent from '@/Renderer/components/FileSystem/FileList.vue'

@Component({
    components: {
        FileListComponent
    }
})
export default class ScriptListComponent extends BaseComponent {
    private filters: string[] = [`${PROJECT_SCENE_SCRIPT_DIRECTORY_NAME}/**/*.js`]

    private add(): void {

    }

    private goBack(): void {
        this.$router.replace('/manager/scene')
    }
}
</script>