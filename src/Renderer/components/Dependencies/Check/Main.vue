<template>
  <v-card
    flat
    tile
    :loading="isChecking"
  >
    <v-card-title>종속성 검사 중...</v-card-title>
    <v-card-text>잠시만 기다려주세요...</v-card-text>
  </v-card>
</template>

<script lang="ts">
import { Base64 } from 'js-base64'
import { Vue, Component } from 'vue-property-decorator'
import { ipcRenderer } from 'electron'

import BgDependenciesNode from '@/Renderer/assets/bg-dependencies-node.png'
import BgDependenciesNPM from '@/Renderer/assets/bg-dependencies-npm.png'
import BgDependenciesCode from '@/Renderer/assets/bg-dependencies-code.png'

export interface Dependency {
  title: string
  description: string
  image: string
  command: string
  homepage: string
}

@Component
export default class DependenciesCheckComponent extends Vue {
  private isChecking: boolean = false
  private dependencies: Dependency[] = [
    {
      title: 'Node.js',
      description: 'Node.js는 JavaScript를 실행시켜주는 런타임 프로그램입니다.',
      image: BgDependenciesNode,
      command: 'node',
      homepage: 'https://nodejs.org'
    },
    {
      title: 'NPM',
      description: 'Node.js를 설치하면 자동으로 같이 설치됩니다.',
      image: BgDependenciesNPM,
      command: 'npm',
      homepage: 'https://nodejs.org'
    },
    {
      title: 'VsCode',
      description: 'VsCode는 프로그래밍을 전문적으로 할 수 있도록 도와주는 강력한 개발 프로그램입니다.',
      image: BgDependenciesCode,
      command: 'code',
      homepage: 'https://code.visualstudio.com'
    }
  ]

  private goInstallPage(missings: Dependency[]): void {
    const stringify = JSON.stringify([ ...missings ])
    const encoded = Base64.encode(stringify)
    this.$router.replace(`/dependencies/install/${encoded}`).catch(() => null)
  }

  private goMain(): void {
    this.$router.replace('/project').catch(() => null)
  }

  private async check(): Promise<void> {

    this.isChecking = true
    const missings: Set<Dependency> = new Set

    for (const dependency of this.dependencies) {
      const commandExists: Engine.Process.CheckCommandExistsSuccess|Engine.Process.CheckCommandExistsFail = await ipcRenderer.invoke('check-command-exists', dependency.command)
      if (!commandExists.success) {
        this.$store.dispatch('snackbar', commandExists.message)
        missings.add(dependency)
        return
      }
    }

    this.isChecking = false

    if (!missings.size) {
      this.goMain()
      return
    }
    
    this.goInstallPage([ ...missings ])
  }

  created(): void {
    this.check()
  }
}
</script>

<style lang="scss" scoped>
.theme--light {
  background: initial !important;
}
</style>