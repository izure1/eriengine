<template>
  <v-card
    flat
    tile
    class="wrapper"
  >

    <v-img class="pa-15 header-wrapper"
      src="@/Renderer/assets/bg-engine-tutorial.png"
      height="500"
      position="400px"
    >
      <v-card-title class="white--text text-h2 text-no-wrap">환영합니다</v-card-title>
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
          <v-btn class="px-15 py-5"
            color="primary"
            @click="openExternal('https://eriengine.izure.org/wiki/tutorial')"
          >
            튜토리얼 보기
          </v-btn>
        </v-card-actions>

      </div>
    </v-img>

    <v-container class="mt-10">
      <v-card-title class="d-flex justify-center text-h4">무엇을 할 수 있나요?</v-card-title>

      <qna-component :quoteWidth="550">
        <template #title>빠른 개발</template>
        <template #subtitle>정형화 된 게임 개발에 유리합니다</template>
        <template #quote>요즘은 게임 엔진이 좋아서 누구나 만들 수 있잖아?</template>
        <template #description>
          <p>
            많은 사람들이 게임 엔진을 마법의 도구로 오해합니다.
            <br>
            하지만 게임 개발은 결코 단순하지 않습니다.
            <br>
            게임 엔진은 어디까지나 <strong>프로그래머</strong>가 개발하기 쉬운 환경을 제공할 뿐입니다.
          </p>
          <p class="mt-10">
            하지만 최근 게임에는 길찾기, 대사, 인벤토리 등 <strong>필수적인</strong> 기능들이 있으며,
            <br>
            비전공자라도 쉽게 사용할 수 있게 <strong>최대한 간단히</strong> 제공합니다.
            <br>
            또한 
            <v-btn
              text
              small
              color="primary"
              @click="openExternal('https://phaser.io/phaser3')"
            >
              Phaser3
            </v-btn> 라이브러리를 확장하여 만든 에리엔진은, 기존 기능과 서드파티 플러그인을 이용할 수 있습니다.
          </p>
        </template>
      </qna-component>

      <qna-component :quoteWidth="350">
        <template #title>프로그래머 친화적</template>
        <template #subtitle>TypeScript + IDE의 강력한 타입 추론 기능을 이용하세요</template>
        <template #quote>이게 대체 뭐하는 기능이지?</template>
        <template #description>
          <p>
            기본으로 제공하는 것들이 많다면 외워야하는 것들도 많겠죠.
            <br>
            하지만 걱정하지 마세요. 대부분의 기능은 코드를 작성하면 IDE에서 즉각적인 피드백을 줍니다.
          </p>
          <p>
            또한 실시간 테스트를 통해 빠른 디버깅이 가능합니다.
          </p>
        </template>
      </qna-component>

    </v-container>

    <divider-component />

    <v-container>
      <v-card-title class="d-flex justify-center text-h4">관련 사이트</v-card-title>
      <v-card-subtitle class="text-center">필요하다면 도움을 요청하세요</v-card-subtitle>

      <v-row class="mt-10 justify-center flex-grow-0 flex-shrink-0">

        <button-card
          :background-image="bgEngineCardHome"
          uri="https://eriengine.izure.org"
        >
          <template #title>홈페이지</template>
          <template #subtitle>공식 홈페이지에서 정보를 확인하세요.</template>
          <template #text>
            <p>
              엔진 사용법에 대한 간단한 가이드를 따라가세요.
              <br>
              공식 홈페이지의 튜토리얼은 정확한 정보를 약속합니다.
            </p>
          </template>
        </button-card>

        <button-card
          :background-image="bgEngineCardGithub"
          uri="https://github.com/izure1/eriengine"
        >
          <template #title>저장소</template>
          <template #subtitle>Github에서 에리엔진의 정보를 얻어보세요.</template>
          <template #text>
            <p>
              엔진의 최신 배포와 질문, 답변, 오류 신고를 할 수 있습니다.
              <br>
              개발자를 위한 자세한 정보와 엔진의 소스 코드, 작동 방식에 대한 정보를 얻을 수 있습니다.
            </p>
          </template>
        </button-card>

      </v-row>
    </v-container>

  </v-card>
</template> 

<script lang="ts">
import { shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import ButtonCard from './ButtonCard.vue'
import QnaComponent from './QnA.vue'
import QuoteComponent from './Quote.vue'
import DividerComponent from './Divider.vue'

import bgEngineCardGithub from '@/Renderer/assets/bg-enginecard-github.png'
import bgEngineCardHome from '@/Renderer/assets/bg-enginecard-home.png'

@Component({
  components: {
    ButtonCard,
    QnaComponent,
    QuoteComponent,
    DividerComponent
  }
})
export default class EngineToturialComponent extends Vue {
  private bgEngineCardGithub: string = bgEngineCardGithub
  private bgEngineCardHome: string = bgEngineCardHome

  private openExternal(uri: string): void {
    shell.openExternal(uri)
  }
}
</script>

<style lang="scss" scoped>
.header-wrapper {
  min-height: 400px;
  background-color: #252525;
}
</style>