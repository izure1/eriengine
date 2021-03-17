<template>
    <v-card flat tile>

        <v-img
            src="@/Renderer/assets/bg-engine-tutorial.png"
            height="500"
            position="400px"
            class="pa-15 header-wrapper"
        >

            <v-card-title class="white--text text-h2 text-no-wrap">에리엔진</v-card-title>
            <div class="mt-4 ml-6">

                <v-card-subtitle class="text-subtitle-2 grey--text lighten-1">
                    에리엔진은 쿼터뷰를 지원하는 HTML5 게임 엔진입니다.
                    <br>
                    PC, 모바일, 웹 게임을 만들 수 있습니다.
                </v-card-subtitle>

                <v-card-text class="text-subtitle-2 grey--text lighten-1">
                    TypeScript + IDE를 활용하여 웹 프로그래머에게 친숙하며 
                    <br>
                    수준 높은 개발 환경을 제공합니다.
                </v-card-text>

                <v-card-actions class="mt-5">
                    <v-btn
                        @click="openExternal('https://eriengine.izure.org')"
                        color="primary"
                        class="px-15 py-5"
                    >튜토리얼 보기</v-btn>
                </v-card-actions>

            </div>

        </v-img>

        <v-container class="mt-15">
            <v-card-title class="d-flex justify-center text-h4">
                이런 분들에게 필요합니다
            </v-card-title>
            <v-card-title class="d-flex justify-center text-h3 mt-10">
                빠른 개발
            </v-card-title>
            <v-card-subtitle class="mt-0 text-center">정형화 된 게임 개발에 유리합니다</v-card-subtitle>
            <v-card-text class="blue-grey--text text--darken-4 text-center mt-10">

                <v-row class="justify-center">
                    <quote-component :width="550">
                        <template #message>
                            <span class="blue-grey--text text-h6">요즘은 게임 엔진이 좋아서 누구나 만들 수 있잖아?</span>
                        </template>
                    </quote-component>
                </v-row>

                <div class="mt-15 text-body-2">
                    <p>
                        많은 사람들이 게임 엔진을 마법의 도구로 오해합니다.
                        <br>
                        하지만 게임 개발은 결코 단순하지 않습니다.
                        <br>
                        게임 엔진은 어디까지나 <strong>프로그래머</strong>가 개발하기 쉬운 환경을 제공할 뿐입니다.
                    </p>
                    <p class="mt-10">
                        에리엔진은 이러한 기능들을 기본적으로 구현해두었습니다.
                        <br>
                        <v-btn
                            @click="openExternal('https://phaser.io/phaser3')"
                            color="primary"
                            text
                            small
                        >Phaser3</v-btn> 라이브러리를 확장하여 만든 에리엔진은, 기존 기능과 서드파티 플러그인을 이용할 수 있습니다.
                    </p>
                </div>
            </v-card-text>

            <v-divider class="my-15" />

            <v-card-title class="d-flex justify-center text-h3">
                프로그래머 친화적
            </v-card-title>
            <v-card-subtitle class="mt-0 text-center">TypeScript + IDE의 강력한 타입 추론 기능을 이용하세요</v-card-subtitle>
            <v-card-text class="blue-grey--text text--darken-4 text-center mt-10">

                <v-row class="justify-center">
                    <quote-component :width="350">
                        <template #message>
                            <span class="blue-grey--text text-h6">이게 대체 뭐하는 기능이지?</span>
                        </template>
                    </quote-component>
                </v-row>

                <div class="mt-15 text-body-2">
                    <p>
                        고민하지 마세요. IDE에서 즉각적인 피드백을 줍니다.
                    </p>
                </div>

            </v-card-text>

        </v-container>

    </v-card>
</template> 

<script lang="ts">
import { shell } from 'electron';
import { Vue, Component } from 'vue-property-decorator';
import QuoteComponent from './Quote.vue';

@Component({
    components: {
        QuoteComponent
    }
})
export default class EngineToturialComponent extends Vue {
    private openExternal(uri: string): void {
        shell.openExternal(uri);
    }
}
</script>

<style lang="scss" scoped>
.header-wrapper {
    min-height: 400px;
    background-color: #252525;
}
</style>