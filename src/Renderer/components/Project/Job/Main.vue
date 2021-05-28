<template>
  <v-card class="projectjob d-flex align-content-center flex-wrap">
    <v-spacer />

    <v-card flat class="projectjob-wrapper">
      <v-card-actions>
        <v-spacer />

          <v-hover v-for="(job, i) in jobs"
            :key="`projectjob-btn-${i}`"
          >
            <template v-slot:default="{ hover }">
              <v-card class="projectjob-btn mx-3"
                :elevation="hover ? 12 : 3"
                width="250"
                height="350"
                @click="goTo(job.url)"
              >

                <v-img class="white--text align-end"
                  :src="job.image"
                  width="250"
                >
                  <v-card-title>{{ job.title }}</v-card-title>
                </v-img>
                <v-card-subtitle>{{ job.description }}</v-card-subtitle>

              </v-card>
            </template>
          </v-hover>

        <v-spacer />
      </v-card-actions>
    </v-card>

    <v-spacer />
  </v-card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import bgProjectjobNew from '@/Renderer/assets/bg-projectjob-new.png'
import bgProjectjobOpen from '@/Renderer/assets/bg-projectjob-open.png'

interface ProjectJob {
  title: string
  description: string
  url: string
  image: string
}

@Component
export default class Launcher extends Vue {
  private jobs: ProjectJob[] = [
    {
      title: '새로운 프로젝트 만들기',
      description: '새로운 에리엔진 게임 프로젝트를 만듭니다',
      url: '/project/new',
      image: bgProjectjobNew
    },
    {
      title: '프로젝트 열기',
      description: '기존에 만들었던 에리엔진 게임 프로젝트를 이어서 작업합니다',
      url: '/project/open',
      image: bgProjectjobOpen
    }
  ]
  private goTo(url: string): void {
    this.$router.replace(url).catch(() => null)
  }
}
</script>

<style lang="scss" scoped>
.projectjob {
  height: 100%;

  .projectjob-wrapper {
    background: initial !important;

    .projectjob-btn {
      transition: box-shadow 0.15s linear;
    }
  }
}
</style>