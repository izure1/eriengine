<template>
  <v-card flat>
    <v-card-title>위키</v-card-title>
    <v-card-subtitle>엔진을 이해하는데 도움이 될 수 있는 강좌입니다</v-card-subtitle>
    <engine-home-link-component :links="wikiLists" />
    
    <v-card-title>도구 모음</v-card-title>
    <v-card-subtitle>게임 개발에 도움이 될 수 있는 기능입니다</v-card-subtitle>
    <engine-home-link-component :links="toolLists" />
  </v-card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

import EngineHomeLinkComponent, { LinkList } from './Link.vue'

@Component({
  components: {
    EngineHomeLinkComponent
  }
})
export default class EngineHomeComponent extends Vue {
  private wikiLists: LinkList[] = [
    {
      subheader: '프로젝트 준비',
      lists: [
        {
          text: '에셋 추가하기',
          uri: 'https://eriengine.izure.org/wiki/add-assets'
        },
        {
          text: '애니메이션 만들기',
          uri: 'https://eriengine.izure.org/wiki/add-animations'
        }
      ]
    },
    {
      subheader: '프로그래밍 (기초과정)',
      lists: [
        {
          text: '변수란?',
          uri: 'https://eriengine.izure.org/wiki/what-is-variable'
        },
        {
          text: '타입이란?',
          uri: 'https://eriengine.izure.org/wiki/what-is-type'
        },
        {
          text: '상속이란?',
          uri: 'https://eriengine.izure.org/wiki/what-is-inherit'
        }
      ]
    },
    {
      subheader: '프로그래밍 (엔진)',
      lists: [
        {
          text: '액터 만들기',
          uri: 'https://eriengine.izure.org/wiki/add-actors'
        },
        {
          text: '라이프사이클 이해하기',
          uri: 'https://eriengine.izure.org/wiki/about-actor-lifecycle'
        }
      ]
    },
    {
      subheader: '테스트 및 빌드',
      lists: [
        {
          text: '테스트하기',
          uri: 'https://eriengine.izure.org/wiki/how-to-test'
        },
        {
          text: '빌드하기',
          uri: 'https://eriengine.izure.org/wiki/how-to-build'
        }
      ]
    },
    {
      subheader: '기여',
      lists: [
        {
          text: '행동강령',
          uri: 'https://eriengine.izure.org/wiki/rules'
        },
        {
          text: '수정하기',
          uri: 'https://github.com/izure1/eriengine/tree/master/docs/wiki'
        }
      ]
    }
  ]

  private toolLists: LinkList[] = [
    {
      subheader: '아티스트',
      lists: [
        {
          text: '타일 레이어 생성기',
          uri: '/manager/tool/isometrical-layer'
        }
      ]
    }
  ]
}
</script>