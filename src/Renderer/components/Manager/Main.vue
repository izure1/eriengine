<template>
    <v-app>
        <v-app-bar
            elevation="1"
            color="blue-grey"
            fixed
            tile
        >
            <v-app-bar-nav-icon @click="isDrawerOpen = !isDrawerOpen" class="white--text"></v-app-bar-nav-icon>
            <v-app-bar-title>
                <v-btn
                    color="white"
                    class="subtitle-1"
                    text
                    @click="openPath(projectDirectory)"
                >
                    {{ projectName }}
                </v-btn>
            </v-app-bar-title>
        </v-app-bar>
        <v-navigation-drawer v-model="isDrawerOpen" fixed temporary class="py-3 px-1">
            <v-list subheader>
                <div
                    v-for="{ title, menus } in contextmenuGroups"
                    :key="`aside-contextmenu-${title}`"
                >
                    <v-subheader>{{ title }}</v-subheader>
                    <v-list-item
                        v-for="{ name, description, path } in menus"
                        :key="`aside-contextmenu-${title}-${name}`"
                        @click="showManager(path)"
                    >
                        <v-list-item-content class="ml-3">
                            <v-list-item-title class="overline">{{ name }}</v-list-item-title>
                            <v-list-item-subtitle class="caption">{{ description }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </div>
            </v-list>
        </v-navigation-drawer>
        <v-main>
            <router-view class="main-view" />
        </v-main>
    </v-app>
</template>

<script lang="ts">
import path from 'path'
import { ipcRenderer, shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { FileWatcher } from '@/Utils/FileWatcher'
import {
  PROJECT_EXTEND_DIRECTORY_NAME,
  PROJECT_SRC_DIRECTORY_NAME,
  PROJECT_SRC_ASSET_DIRECTORY_NAME,
  PROJECT_SRC_STORAGE_DIRECTORY_NAME,
  PROJECT_SRC_DATA_DIRECTORY_NAME,
  PROJECT_SRC_DATA_ACTOR_DIRECTORY_NAME,
  PROJECT_SRC_DATA_SCENE_DIRECTORY_NAME,
  PROJECT_SRC_DATA_ANIMATION_DIRECTORY_NAME,
  PROJECT_SRC_DATA_AUDIO_DIRECTORY_NAME,
  PROJECT_SRC_DATA_IMAGE_DIRECTORY_NAME,
  PROJECT_SRC_DATA_SKILL_DIRECTORY_NAME,
  PROJECT_SRC_DATA_VIDEO_DIRECTORY_NAME
} from '@/Const'

interface ContextmenuGroup {
  title: string
  menus: Menu[]
}
type Menu = {
  name: string
  description: string
  path: string
};

@Component
export default class ProjectFileListComponent extends Vue {
  private isDrawerOpen: boolean = false
  private contextmenuGroups: ContextmenuGroup[] = [
    {
      title: '프로그래밍',
      menus: [
        {
          name: '씬',
          description: '씬의 메인 파일을 관리합니다',
          path: '/manager/scene'
        },
        {
          name: '액터',
          description: '액터를 관리합니다',
          path: '/manager/actor'
        },
        {
          name: '스킬',
          description: '스킬을 관리합니다',
          path: '/manager/skill'
        }
      ]
    },
    {
      title: '데이터',
      menus: [
        {
          name: '에셋',
          description: '에셋을 관리합니다',
          path: '/manager/asset'
        },
        {
          name: '이미지',
          description: '이미지를 관리합니다',
          path: '/manager/image'
        },
        {
          name: '애니메이션',
          description: '애니메이션을 관리합니다',
          path: '/manager/animation'
        },
        {
          name: '오디오',
          description: '오디오를 관리합니다',
          path: '/manager/audio'
        },
        {
          name: '비디오',
          description: '비디오를 관리합니다',
          path: '/manager/video'
        }
      ]
    },
    {
      title: '프로젝트',
      menus: [
        {
          name: '빌드',
          description: '게임으로 빌드합니다',
          path: '/manager/build'
        },
        {
          name: '설정',
          description: '설정을 변경합니다',
          path: '/manager/config'
        },
        {
          name: '재구성',
          description: '프로젝트를 수동으로 재구축합니다',
          path: `/manager/restructure/${this.projectDirectory}`
        },
        {
          name: '종료',
          description: '메인화면으로 돌아갑니다',
          path: '/project/close'
        }
      ]
    },
    {
      title: '엔진',
      menus: [
        {
          name: '튜토리얼',
          description: '엔진의 사용법에 대해 소개합니다',
          path: '/manager/engine/tutorial'
        },
      {
          name: '업데이트',
          description: '엔진을 업데이트합니다',
          path: '/manager/updater'
        },
      ]
    },
    {
      title: '아티스트 도구',
      menus: [
        {
          name: '타일 레이어 생성기',
          description: '타일의 견본 레이어를 생성합니다',
          path: '/manager/tool/isometrical-layer'
        }
      ]
    }
  ]

  private watchers: Set<FileWatcher> = new Set

  private get projectName(): string {
    const { name } = this.$store.state.projectConfig
    if (!name) {
      return ''
    }
    return name
  }

  private get projectDirectory(): string {
    return this.$store.state.projectDirectory
  }

  private showManager(url: string): void {
    this.$router.replace(url).catch(() => null)
  }

  private generateWatchers(): void {
    this.destroyWatchers()

    if (!this.projectDirectory) {
      return
    }
    
    // 에셋 디렉토리 감지
    const assetDir = path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_ASSET_DIRECTORY_NAME)
    const assetWatcher = new FileWatcher(assetDir).update(() => ipcRenderer.invoke('generate-asset-list', this.projectDirectory)).start().emit()

    // 씬 디렉토리 감지
    const sceneDir = path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_SCENE_DIRECTORY_NAME)
    const sceneWatcher = new FileWatcher(sceneDir).update(() => ipcRenderer.invoke('generate-scene-list', this.projectDirectory)).start().emit()

    // 액터 디렉토리 감지
    const actorDir = path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_ACTOR_DIRECTORY_NAME)
    const actorWatcher = new FileWatcher(actorDir).update(() => ipcRenderer.invoke('generate-actor-list', this.projectDirectory)).start().emit()

    // 애니메이션 디렉토리 감지
    const animsDir = path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_ANIMATION_DIRECTORY_NAME)
    const animsWatcher = new FileWatcher(animsDir).update(() => ipcRenderer.invoke('generate-animation-list', this.projectDirectory)).start().emit()

    // 스킬 디렉토리 감지
    const skillDir = path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_SKILL_DIRECTORY_NAME)
    const skillWatcher = new FileWatcher(skillDir).update(() => ipcRenderer.invoke('generate-skill-list', this.projectDirectory)).start().emit()

    // 이미지 디렉토리 감지
    const imageDir = path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_IMAGE_DIRECTORY_NAME)
    const imageWatcher = new FileWatcher(imageDir).update(() => ipcRenderer.invoke('generate-image-list', this.projectDirectory)).start().emit()

    // 오디오 디렉토리 감지
    const audioDir = path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_AUDIO_DIRECTORY_NAME)
    const audioWatcher = new FileWatcher(audioDir).update(() => ipcRenderer.invoke('generate-audio-list', this.projectDirectory)).start().emit()

    // 비디오 디렉토리 감지
    const videoDir = path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_DATA_DIRECTORY_NAME, PROJECT_SRC_DATA_VIDEO_DIRECTORY_NAME)
    const videoWatcher = new FileWatcher(videoDir).update(() => ipcRenderer.invoke('generate-video-list', this.projectDirectory)).start().emit()

    // 스토리지 디렉토리 감지
    const storageDir = path.resolve(this.projectDirectory, PROJECT_SRC_DIRECTORY_NAME, PROJECT_SRC_STORAGE_DIRECTORY_NAME)
    const storageWatcher = new FileWatcher(storageDir).update(() => ipcRenderer.invoke('generate-storage-list', this.projectDirectory)).start().emit()

    // 설정 디렉토리 감지
    const extendDir = path.resolve(this.projectDirectory, PROJECT_EXTEND_DIRECTORY_NAME)
    const extendWatcher = new FileWatcher(extendDir).update(async () => {
      const projectRead: Engine.GameProject.ReadProjectSuccess|Engine.GameProject.ReadProjectFail = await ipcRenderer.invoke('read-project', this.projectDirectory)
      if (!projectRead.success) {
        return
      }
      this.$store.dispatch('setProjectConfig', projectRead.config)
    }).start().emit()

    // 디렉토리 감지
    this.watchers.add(assetWatcher)
    this.watchers.add(actorWatcher)
    this.watchers.add(sceneWatcher)
    this.watchers.add(animsWatcher)
    this.watchers.add(skillWatcher)
    this.watchers.add(imageWatcher)
    this.watchers.add(audioWatcher)
    this.watchers.add(videoWatcher)
    this.watchers.add(storageWatcher)
    this.watchers.add(extendWatcher)
  }

  private destroyWatchers(): void {
    for (const watcher of this.watchers) {
      watcher.destroy()
    }
    this.watchers.clear()
  }

  private openPath(filePath: string): void {
    shell.openPath(filePath)
  }

  created(): void {
    this.generateWatchers()
  }

  beforeDestroy(): void {
    this.destroyWatchers()
  }
}
</script>

<style lang="scss" scoped>
.main-view {
    height: calc(100vh - 64px);
    margin-top: 64px !important;
    overflow: auto;
    overflow-x: hidden;
}
</style>