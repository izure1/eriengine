<template>
  <v-card
    flat
    tile
  > 
    <v-card-title>테스트 및 빌드하기  (｢• ω •)｢	</v-card-title>
    <v-card-subtitle>
      게임을 테스트하거나, 실제 작동하는 애플리케이션으로 빌드할 수 있습니다. 하지만 순서를 지켜주세요.
    </v-card-subtitle>

    <v-card-text>

      <v-container>
        <v-row>
          <v-col>
            <v-subheader>테스트</v-subheader>
            <p>
              버그많음 = 똥겜. 디버깅은 필수죠! 하지만 어느 세월에 빌드─수정─반복하나요?
              <br>
              테스트는 소스코드를 수정하면, 즉시 미리보기에 적용되므로 이런 문제로부터 자유롭습니다.
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-subheader>개발용 빌드</v-subheader>
            <p>
              테스트를 마쳤다면, 마지막으로 개발용 빌드 옵션을 사용해보세요. 실제 동작하는 프로그램의 환경에서 마지막 최종검수가 가능합니다.
              <br>
              개발용 빌드는 빌드 속도가 빠르기 때문에, 빠른 검수가 가능해요.
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-subheader>빌드</v-subheader>
            <p>
              모든 작업을 완료했나요?
              <br>
              그렇다면 당신의 게임 소스코드를 이제 배포 가능한 실제 게임으로 만드세요.
            </p>
          </v-col>
        </v-row>
      </v-container>

    </v-card-text>

    <v-card-actions class="mt-5 mb-0 pb-0">
      <v-spacer />
        <v-tooltip v-for="(button, i) in buttons"
          :key="`build-button-${i}`"
          top
        >
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              @click="runBuilder(button)"
              min-width="130"
              large
              text
            >
              {{ button.title }}
            </v-btn>
          </template>
          <div v-html="button.description"
            class="caption"
          />
        </v-tooltip>
      <v-spacer />
    </v-card-actions>

    <v-card-actions class="my-0 py-0">
      <v-spacer />
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <div v-on="on">
            <v-switch v-model="isDevMode"
              :class="{ 'text--green': isDevMode }"
              label="개발용 빌드"
              color="warning"
              dense
              inset
            />
          </div>
        </template>
        <div class="caption">
          테스트가 미리보기라면, 개발모드는 최종검수에 가깝습니다.
          <br>
          활성화 후, 원하는 빌드를 선택하세요. 빠르게 빌드됩니다.
          <br>
          하지만 보안 문제가 있기에, 반드시 디버깅을 위해서만 사용해야합니다.
        </div>
      </v-tooltip>
      <v-spacer />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { Base64 } from 'js-base64'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { BuildData } from './Runner.vue'

@Component
export default class BuildComponent extends Vue {
  private isDevMode: boolean = false
  private buttons: BuildData[] = []

  private get cwd(): string {
    return this.$store.state.projectDirectory
  }

  private get buildMode(): string {
    return this.isDevMode ? 'dev' : 'prod'
  }

  @Watch('buildMode', { immediate: true })
  private onBuildModeChange(): void {
    this.buttons = [
      {
        title: 'Test',
        description: '브라우저에서 게임을 테스트합니다.<br>빌드가 빠르며, 소스코드를 수정하면 즉시 반영됩니다.',
        jobChannel: 'build-serve',
        jobParameters: [ this.cwd ],
        streamChannel: 'build'
      },
      {
        title: 'Web',
        description: '소스코드를 게임이 작동하는 웹페이지로 추출합니다.',
        jobChannel: 'build-to-web',
        jobParameters: [ this.cwd, this.buildMode ],
        streamChannel: 'build'
      },
      {
        title: 'Windows',
        description: '소스코드를 게임이 작동하는 Windows 전용 애플리케이션으로 추출합니다.',
        jobChannel: 'build-to-app',
        jobParameters: [ this.cwd, this.buildMode ],
        streamChannel: 'build'
      },
      {
        title: 'PWA',
        description: '모바일에서 동작하는 애플리케이션으로 추출합니다.',
        jobChannel: 'build-to-app',
        jobParameters: [ this.cwd, this.buildMode ],
        streamChannel: 'build'
      }
    ]
  }

  private createBuildDataToken(buildData: BuildData): string {
    const stringify = JSON.stringify(buildData)
    return Base64.encode(stringify)
  }

  private runBuilder(button: BuildData): void {
    const buildDataToken = this.createBuildDataToken(button)
    this.$router.replace(`/manager/build/runner/${buildDataToken}`).catch(() => null)
  }
}
</script>