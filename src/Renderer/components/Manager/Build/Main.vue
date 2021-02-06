<template>
    <v-card flat> 
        <v-card-title>테스트 및 빌드하기</v-card-title>
        <v-card-subtitle>당신의 게임을 테스트하거나, 실제 작동하는 애플리케이션으로 빌드할 수 있습니다</v-card-subtitle>
        <v-card-text>
            <h3>빌드</h3>
            <p class="my-3">
                모든 작업을 완료했나요?
                <br>
                그렇다면 당신의 게임 소스코드를 이제 실제 게임으로 만들 수 있습니다.
            </p>
            <h3>테스트</h3>
            <p class="my-3">
                하지만 게임에 버그가 없는지 확인하는 작업이 필요하겠죠.
                <br>
                빌드하는데는 시간이 걸리기 때문에, 버그를 수정하고 확인하기엔 오래걸립니다.
                <br>
                테스트는 소스코드를 수정하면, 즉시 미리보기에 적용되기 때문에, 이런 문제로부터 자유롭습니다.
            </p>
        </v-card-text>
        <v-card-actions class="mt-10 mb-0 pb-0">
            <v-spacer />
                <v-tooltip
                    v-for="(button, i) in buttons"
                    :key="`build-button-${i}`"
                    bottom
                >
                    <template v-slot:activator="{ on }">
                        <v-btn
                            v-on="on"
                            @click="runBuilder(button)"
                            large
                            text
                        >{{ button.title }}</v-btn>
                    </template>
                    <div class="caption" v-html="button.description" />
                </v-tooltip>
            <v-spacer />
        </v-card-actions>
        <v-card-actions class="my-0 py-0">
            <v-spacer />
            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <div v-on="on">
                        <v-switch
                            v-model="isDevMode"
                            :label="isDevMode ? '개발모드 사용 중' : '개발모드 사용하기'"
                            :class="{ 'text--green': isDevMode }"
                            dense
                        />
                    </div>
                </template>
                <div>
                    개발모드를 이용하면 빠르게 빌드할 수 있습니다.
                    <br>
                    하지만 개발모드는 보안 문제가 있기 때문에, 어디까지나 테스트를 위해 사용해야합니다.
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
                title: '테스트',
                description: '브라우저에서 게임을 테스트합니다. <br>빌드가 빠르며, 소스코드를 수정하면 즉시 반영됩니다.',
                jobChannel: 'build-serve',
                jobParameters: [ this.cwd ],
                streamChannel: 'build'
            },
            {
                title: '웹',
                description: '소스코드를 게임이 작동하는 웹페이지로 추출합니다.',
                jobChannel: 'build-to-web',
                jobParameters: [ this.cwd, this.buildMode ],
                streamChannel: 'build'
            },
            {
                title: '애플리케이션',
                description: '소스코드를 게임이 작동하는 애플리케이션으로 추출합니다.',
                jobChannel: 'build-to-app',
                jobParameters: [ this.cwd, this.buildMode ],
                streamChannel: 'build'
            }
        ]
    }

    private createBuildDataToken(buildData: BuildData): string {
        const stringify: string = JSON.stringify(buildData)
        return Base64.encode(stringify)
    }

    private runBuilder(button: BuildData): void {
        const buildDataToken: string = this.createBuildDataToken(button)
        this.$router.replace(`/manager/build/runner/${buildDataToken}`)
    }
}
</script>