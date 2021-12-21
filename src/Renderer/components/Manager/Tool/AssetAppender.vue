<template>
  <v-card
    flat
    tile
  >
    <v-card-title>무료 에셋 추가</v-card-title>
    <v-card-subtitle>인터넷에 공개된 무료 에셋을 자동으로 프로젝트에 추가하거나, 스토어로 이동할 수 있습니다.</v-card-subtitle>
    <v-card-text>
      <v-alert
        type="info"
        class="text-caption"
      >
        아래 공개된 에셋은 퍼블릭 도메인의 에셋으로써, 창작자가 권리를 포기하고 무료 배포한 에셋입니다.
        <br>
        하지만 이러한 권리는 변경되었을 수 있으므로, 상세 내용은 스토어에서 직접 확인하십시오.
      </v-alert>
      <v-container class="py-10">
        <v-row>
          <asset-appender-card
            v-for="(card, i) in list"
            :key="`card-${i}`"
            :namespace="card.namespace"
            :subtitle="card.subtitle"
            :source="card.source"
            :title="card.title"
            :color="card.color"
            :logo="card.logo"
            :url="card.url"
            class="mx-5"
          />
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import path from 'path'
import { defineComponent, ref } from '@vue/composition-api'
import AssetAppenderCard, { Card } from './AssetAppenderCard.vue'

export default defineComponent({
  components: {
    AssetAppenderCard
  },
  setup() {
    const isProduction = process.env.NODE_ENV === 'production'
    const resourcesPath = isProduction ? process.resourcesPath : path.resolve(process.cwd(), 'build')
    console.log(resourcesPath)

    const list = ref<Card[]>([
      {
        logo: 'https://www.kenney.nl/data/img/logo.png',
        title: 'Kenny Isometric Tiles',
        subtitle: 'Kenny.nl에서 제공한 무료 에셋을 프로젝트에 추가합니다.',
        source: path.resolve(resourcesPath, 'additional', 'FreeAssets', 'Kenny.zip'),
        namespace: 'Kenny-isometric-tiles',
        url: 'https://www.kenney.nl/',
        color: '#2ECC92',
      }
    ])

    return {
      list
    }
  },
})
</script>
