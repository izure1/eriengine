<template>
    <v-app>
        <v-main>
             <section class="d-flex align-content-center flex-wrap">
                <v-spacer />
                    <v-card flat>
                        <v-list two-line class="text-center">

                            <v-list-item-group>
                                <v-list-item @click="goTo('/project/new')">
                                    <v-list-item-content>
                                        <v-list-item-title>새로운 프로젝트 만들기</v-list-item-title>
                                        <v-list-item-subtitle>새로운 에리엔진 게임 프로젝트를 만듭니다</v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list-item-group>

                            <v-list-item-group>
                                <v-list-item @click="goTo('/project/open')">
                                    <v-list-item-content>
                                        <v-list-item-title>프로젝트 열기</v-list-item-title>
                                        <v-list-item-subtitle>기존에 만들었던 에리엔진 게임 프로젝트를 이어서 작업합니다</v-list-item-subtitle>
                                    </v-list-item-content>
                                </v-list-item>
                            </v-list-item-group>

                        </v-list>
                    </v-card>
                <v-spacer />
            </section>
        </v-main>
    </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Launcher extends Vue {
    private goTo(url: string): void {
        this.$router.replace(url)
    }
}
</script>

<style lang="scss" scoped>
section {
    height: 100%;
}

.job {
    a {
        font-size: 14pt;
        text-decoration: none;
    }
}
</style>