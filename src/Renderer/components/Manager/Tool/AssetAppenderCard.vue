<template>
  <section>
    <v-hover v-slot="{ hover }">
      <v-card
        :elevation="hover ? 12 : 2"
        :class="{ 'on-hover': hover }"
        max-width="250"
        min-height="425"
        class="d-flex flex-column card-wrapper"
        @click="openExternal(url)"
      >
        <v-img
          :src="logo"
          width="100%"
          min-height="250"
          max-height="250"
          class="align-end text-h5 white--text font-weight-bold"
          :style="{ 'background-color': color }"
        >
          <v-card-title class="card-title">{{ title }}</v-card-title>
        </v-img>
        
        <v-divider />
        <v-card-subtitle>{{ subtitle }}</v-card-subtitle>
        <v-card-actions class="px-3 pb-3 flex-grow-1 flex-reverse-column align-end">
          <v-btn
            class="primary--text mx-0"
            width="100%"
            outlined
            large
            @click.stop="confirmAppend(namespace)"
          >
            설치하기
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-hover>

    <v-dialog
      v-model="isAppendDialogOpen"
      :persistent="appending"
      max-width="800"
    >
      <v-card
        :disabled="appending"
        :loading="appending"
      >
        <v-card-title>{{ title }} 에셋 설치</v-card-title>
        <v-card-text>
          <p>
            현재 프로젝트에 <span class="font-weight-bold">{{ title }}</span> 에셋을 설치합니다.
            <br>
            설치할 경우 프로젝트의 용량이 <span class="font-weight-bold">{{ calcSize(source).toFixed(2) }}MB</span>만큼 늘어납니다.
          </p>
          <p>
            이 에셋은 <span class="font-weight-bold">{{ warnDirectory }}</span> 경로를 덮어 씌울 것입니다.
            <br>
            해당 경로에 중요한 데이터가 있다면 백업하십시오.
          </p>
          <p>
            마지막으로 저작권을 확인하였으며, 민·형사상 문제 시 책임은 본인에게 있음을 확인합니다.
          </p>
        </v-card-text>
        
        <v-divider />
        <v-card-actions class="justify-center">
          <v-btn
            class="px-10 primary--text"
            outlined
            @click="append(source, namespace)"
          >
            위험을 인지했으며 설치하겠습니다
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script lang="ts">
import path from 'path'
import fs from 'fs-extra'
import { shell, ipcRenderer } from 'electron'
import { computed, defineComponent, getCurrentInstance, ref } from '@vue/composition-api'

import {
  PROJECT_SRC_DIRECTORY_NAME,
  PROJECT_SRC_ASSET_DIRECTORY_NAME
} from '@/Const'

export interface Card {
  logo: string
  title: string
  subtitle: string
  namespace: string
  source: string
  url: string
  color?: string
}

function useShell() {
  const openExternal = (url: string) => {
    shell.openExternal(url)
  }

  return {
    openExternal
  }
}

function useStatSize() {
  const byteToMB = (size: number) => {
    return size / 1000 / 1000
  }

  const calcSize = (location: string) => {
    return byteToMB(fs.lstatSync(location).size)
  }

  return {
    calcSize
  }
}

function useAppender() {
  const { root, props } = getCurrentInstance()!
  const namespace = props.namespace as string
  const source = props.source as string
  
  const projectDirectory = path.resolve(root.proxy.$store.state.projectDirectory)

  const isAppendDialogOpen = ref(false)
  const appending = ref(false)

  const warnDirectory = computed(() => {
    const zipName = path.parse(source).name
    return path.posix.join('Assets', namespace, zipName)
  })

  const confirmAppend = () => {
    isAppendDialogOpen.value = true
  }

  const append = async (source: string, namespace: string) => {
    appending.value = true

    // 임시 폴더에 생성한 후, 완료되면 프로젝트 디렉토리로 이동합니다.
    // 이는 압축 해제 시, 파일이 실시간으로 생성되면 리스트 업데이트가 불필요할 정도로 일어나는 것을 방지하기 위함입니다.
    const src = source
    const dist = path.resolve(projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME, namespace, path.parse(source).name)

    const unzip: Engine.FileSystem.UnzipSuccess|Engine.FileSystem.UnzipFail = await ipcRenderer.invoke('unzip', src, dist)

    const fail = (message: string) => {
      root.proxy.$store.dispatch('snackbar', message)
      isAppendDialogOpen.value = false
      appending.value = false
    }

    if (!unzip.success) {
      return fail(unzip.message)
    }

    isAppendDialogOpen.value = false
    appending.value = false
  }

  return {
    isAppendDialogOpen,
    appending,
    warnDirectory,
    confirmAppend,
    append,
  }
}

export default defineComponent({
  props: {
    logo: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    namespace: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: 'transparent'
    }
  },
  setup() {
    return {
      ...useShell(),
      ...useAppender(),
      ...useStatSize(),
    }
  }
})
</script>

<style lang="scss" scoped>
.card-wrapper {
  transition: box-shadow 0.15s linear;
}

.card-title {
  text-shadow: 0 0 3px black !important;
}
</style>