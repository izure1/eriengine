<template>
  <v-card
    flat
    tile
  >
    <v-subheader>현재 버전: {{ engineVersion }}</v-subheader>
    <v-card-title>프로젝트</v-card-title>
    <v-card-subtitle>현재 프로젝트의 간략한 정보입니다</v-card-subtitle>
    <engine-home-information-component />

    <v-card-title>위키</v-card-title>
    <v-card-subtitle>엔진을 이해하는데 도움이 될 수 있는 강좌입니다</v-card-subtitle>
    <engine-home-link-component :links="wikiLists" />
    
    <v-card-title>도구 모음</v-card-title>
    <v-card-subtitle>게임 개발에 도움이 될 수 있는 기능입니다</v-card-subtitle>
    <engine-home-link-component :links="toolLists" />
  </v-card>
</template>

<script lang="ts">
import { remote } from 'electron'
import { Vue, Component } from 'vue-property-decorator'

import EngineHomeLinkComponent, { LinkList } from './Link.vue'
import EngineHomeInformationComponent from './Informations.vue'

@Component({
  components: {
    EngineHomeLinkComponent,
    EngineHomeInformationComponent
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
      subheader: '공용',
      lists: [
        {
          text: '무료 에셋 추가',
          uri: '/manager/tool/asset-appender'
        }
      ]
    },
    {
      subheader: '아티스트',
      lists: [
        {
          text: '타일 레이어 생성기',
          uri: '/manager/tool/isometrical-layer'
        },
        {
          text: '타일 에셋 다운로드',
          uri: 'https://itch.io/game-assets/free/tag-2d/tag-isometric'
        }
      ]
    },
    {
      subheader: '프로그래머',
      lists: [
        {
          text: '코드 스펠 체커',
          uri: 'https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker'
        }
      ]
    }
  ]

  private get engineVersion(): string {
    return remote.app.getVersion()
  }
}
</script>