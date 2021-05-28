<template>
  <v-card
    flat
    tile
    class="dependency-install-wrapper"
  >
    <v-card-title>필수 프로그램 설치가 필요해요  〣( ºΔº )〣</v-card-title>
    <v-card-text>
      <p>
        에리엔진을 사용하기 위해 필수적으로 설치가 필요한 프로그램입니다.
        <br>
        기술적 이슈와 법리적 문제로 필요한 프로그램을 함께 동봉하지 못한다는 점을 사과드립니다.
        <br>
        <br>
        에리엔진을 정상적으로 사용하기 위해선 추가 프로그램 설치가 필요합니다.
        <br>
        번거롭더라도 설치하지 않으면 엔진을 사용할 수 없으므로 꼭 설치하여 주세요.
      </p>

      <v-row class="my-10">
          <v-spacer />

          <v-hover v-for="(dependency, i) in missings"
            :key="`dependency-install-${i}`"
          >
            <template v-slot:default="{ hover }">
              <v-card class="dependency-install-app mx-3"
                width="250"
                :elevation="hover ? 12 : 3"
                @click="download(dependency.homepage)"
              >
                <v-img class="white--text align-end"
                  height="150"
                  :src="dependency.image"
                >
                  <v-card-title>{{ dependency.title }}</v-card-title>
                </v-img>
                <v-card-text class="dependency-install-description">{{ dependency.description }}</v-card-text>
              </v-card>
            </template>
          </v-hover>

        <v-spacer />
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer />

      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn
            icon
            v-on="on"
            @click="check"
          >
            <v-icon>mdi-backup-restore</v-icon>
          </v-btn>
        </template>
        <span>종속성을 다시 검사합니다</span>
      </v-tooltip>

      <v-spacer />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Base64 } from 'js-base64'
import { shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { Dependency } from '../Check/Main.vue'

@Component
export default class DependenciesInstallComponent extends Vue {
  private get missings(): Dependency[] {
    const token: string = this.$route.params.missings
    if (!token) {
      this.goBack('종속성 정보가 없습니다.')
      return []
    }

    try {
      const stringify: string         = Base64.decode(token)
      const missings: Dependency[]  = JSON.parse(stringify)

      return missings
    } catch(e) {
      this.goBack(e.toString())
      return []
    }
  }

  private goBack(message: string): void {
    this.$store.dispatch('snackbar', message)
    this.$router.replace('/dependencies').catch(() => null)
  }

  private download(uri: string): void {
    shell.openExternal(uri)
  }

  private check(): void {
    this.$router.replace('/dependencies').catch(() => null)
  }
}
</script>

<style lang="scss" scoped>
.dependency-install-wrapper {
  background: initial !important;
}

.dependency-install-app {
  transition: box-shadow 0.15s linear;

  .dependency-install-description {
    min-height: 130px;
  }
}
</style>