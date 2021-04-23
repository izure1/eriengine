<template>
    <v-card
        :loading="isCreating"
        :disabled="isCreating"
        elevation="0"
        tile
    >
        <v-stepper v-model="step" class="elevation-0">
            <v-stepper-header>
                
                <v-stepper-step step="1" editable :complete="isComplete(1)">알림</v-stepper-step>
                <v-divider />

                <v-stepper-step step="2" editable :complete="isComplete(2)" :rules="[() => licenseAgree]">라이선스</v-stepper-step>
                <v-divider />

                <v-stepper-step step="3" editable :complete="isComplete(3)" :rules="[() => projectNameRule(projectName), () => projectNameRequiredRule(projectName)]">프로젝트</v-stepper-step>
                <v-divider />

                <v-stepper-step step="4" editable :complete="isComplete(4)" :rules="[() => applicationIDRule(applicationId)]">애플리케이션 ID</v-stepper-step>
                <v-divider />

                <v-stepper-step step="5" editable :complete="isComplete(5)">해상도</v-stepper-step>
                <v-divider />

                <v-stepper-step step="6" editable :complete="isComplete(6)">테마</v-stepper-step>
                <v-divider />

                <v-stepper-step step="7" editable :complete="isComplete(7)">생성</v-stepper-step>

            </v-stepper-header>
            <v-stepper-items>

                <v-stepper-content step="1">
                    <v-card>
                        <v-card-title>알림</v-card-title>
                        <v-card-text>
                            <p>
                                에리엔진을 이용하여 새로운 게임을 만듭니다.
                                <br>
                                당신이 만든 게임은 에리엔진의 라이선스에 한하여 자유롭게 사용할 수 있습니다.
                                <br>
                                라이선스를 위반하였을 경우, 해당 게임은 저작권 보호를 받지 못하며, 개발자가 이를 몰수할 수 있습니다.
                                <br>
                                라이선스를 필독하여 불이익을 받지 않도록 주의하십시오.
                            </p>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer />

                            <v-btn icon @click="goMain">
                                <v-icon>mdi-chevron-left</v-icon>
                            </v-btn>
                            <v-btn icon @click="goNextStep">
                                <v-icon>mdi-chevron-right</v-icon>
                            </v-btn>

                            <v-spacer />
                        </v-card-actions>
                    </v-card>
                </v-stepper-content>

                <v-stepper-content step="2">
                    <v-card>
                        <v-card-title>에리엔진 라이선스</v-card-title>
                        <v-card-text>
                            <pre class="license">{{ license }}</pre>
                            <p>
                                <v-checkbox v-model="licenseAgree" label="라이선스를 확인했고 동의합니다" />
                            </p>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer />

                            <v-btn icon @click="goBeforeStep">
                                <v-icon>mdi-chevron-left</v-icon>
                            </v-btn>
                            <v-btn icon @click="goNextStep">
                                <v-icon>mdi-chevron-right</v-icon>
                            </v-btn>

                            <v-spacer />
                        </v-card-actions>
                    </v-card>
                </v-stepper-content>

                <v-stepper-content step="3">
                    <v-card>
                        <v-card-title>프로젝트 이름 짓기</v-card-title>
                        <v-card-text>
                            <p>
                                프로젝트 이름을 입력하세요.
                                숫자와 영소문자만 입력할 수 있습니다.
                            </p>
                            <div>
                                <v-text-field v-model="projectName" :rules="[projectNameRule, projectNameRequiredRule]"></v-text-field>
                            </div>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer />

                            <v-btn icon @click="goBeforeStep">
                                <v-icon>mdi-chevron-left</v-icon>
                            </v-btn>
                            <v-btn icon @click="goNextStep">
                                <v-icon>mdi-chevron-right</v-icon>
                            </v-btn>

                            <v-spacer />
                        </v-card-actions>
                    </v-card>
                </v-stepper-content>

                <v-stepper-content step="4">
                    <v-card>
                        <v-card-title>애플리케이션 ID 정하기</v-card-title>
                        <v-alert type="warning" tile prominent class="caption">
                            <strong class="subtitle-1">이 값은 나중에 변경할 수 없습니다.</strong>
                            <br>
                            원한다면 직접 수정할 수 있지만, 잘 모른다면 건드리지 마십시오.
                        </v-alert>
                        <v-card-text>
                            <p>
                                애플리케이션 ID는 당신이 만들 게임의 고유한 식별자입니다. 주민등록번호라고 생각해도 좋습니다.
                                <br>
                                따라서 애플리케이션 ID는 타인의 것과 중복되어선 안됩니다.
                                <br>
                                이러한 중복을 피하기 위해, 에리엔진은 최대한 랜덤한 아이디를 생성합니다.
                            </p>
                            <ol class="caption">
                                <li>이름은 두 개 이상의 세그먼트(한 개 이상의 점)로 구성해야 합니다.</li>
                                <li>각 세그먼트는 문자로 시작해야 합니다.</li>
                                <li>모든 문자는 영숫자나 밑줄[a~z, A~Z, 0~9 또는 _]이어야 합니다.</li>
                            </ol>
                            <div>
                                <v-text-field
                                    v-model="applicationId"
                                    :rules="[applicationIDRule]"
                                    append-icon="mdi-refresh"
                                    @click:append="setRefreshedDomain"
                                ></v-text-field>
                            </div>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer />

                            <v-btn icon @click="goBeforeStep">
                                <v-icon>mdi-chevron-left</v-icon>
                            </v-btn>
                            <v-btn icon @click="goNextStep">
                                <v-icon>mdi-chevron-right</v-icon>
                            </v-btn>

                            <v-spacer />
                        </v-card-actions>
                    </v-card>
                </v-stepper-content>

                <v-stepper-content step="5">
                    <v-card>
                        <v-card-title>해상도 설정하기</v-card-title>
                        <v-card-text>
                            <p>
                                게임의 기본 크기를 지정합니다.
                            </p>
                            <p>
                                해상도가 크면 에셋의 크기 또한 커져야하므로 용량과 사양이 높아지지만 다양한 모니터에서 선명하게 보일 것입니다.
                                <br>
                                해상도가 낮으면 용량과 사양은 낮아지지만 보다 높은 해상도를 가진 모니터에서는 늘어나 보일 것입니다.
                                <br>
                                플레이어의 디바이스 환경을 생각해, 절충안을 선택하십시오.
                            </p>
                            <p>
                                이 크기는 나중에 직접 변경할 수 있습니다.
                            </p>
                            <div class="text-center">
                                <p class="subtitle-1">
                                    선택된 크기 - {{ displaySize }}
                                </p>
                                <div>
                                    <v-btn text tile @click="setDisplaySize(960, 540)">960×540</v-btn>
                                    <v-btn text tile @click="setDisplaySize(1280, 720)">1280×720 (HD)</v-btn>
                                    <v-btn text tile @click="setDisplaySize(1920, 1080)">1920×1080 (FHD)</v-btn>
                                    <v-btn text tile @click="setDisplaySize(2560, 1440)">2560×1440 (QHD)</v-btn>
                            </div>
                            </div>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer />

                            <v-btn icon @click="goBeforeStep">
                                <v-icon>mdi-chevron-left</v-icon>
                            </v-btn>
                            <v-btn icon @click="goNextStep">
                                <v-icon>mdi-chevron-right</v-icon>
                            </v-btn>

                            <v-spacer />
                        </v-card-actions>
                    </v-card>
                </v-stepper-content>

                <v-stepper-content step="6">
                    <v-card>
                        <v-card-title>테마 설정하기</v-card-title>
                        <v-card-text>
                            <p>
                                게임의 테마를 설정합니다.
                                <br>
                                기본적으로 생성될 GUI의 색상과 분위기를 결정합니다.
                                <br>
                                색상은 나중에 직접 변경할 수 있습니다.
                            </p>
                            <v-row>
                                <v-spacer />
                                <v-col>
                                    <v-card flat>
                                        <v-card-title><v-spacer />글자 색상<v-spacer /></v-card-title>
                                        <v-card-subtitle class="text-center">GUI의 글자 색상을 선택합니다</v-card-subtitle>
                                        <v-card-actions>
                                            <v-spacer />
                                            <v-color-picker hide-canvas show-swatches v-model="gameThemeTextColor" />
                                            <v-spacer />
                                        </v-card-actions>
                                    </v-card>
                                </v-col>
                                <v-col>
                                    <v-card flat>
                                        <v-card-title><v-spacer />배경 색상<v-spacer /></v-card-title>
                                        <v-card-subtitle class="text-center">GUI의 배경 색상을 선택합니다</v-card-subtitle>
                                        <v-card-actions>
                                            <v-spacer />
                                            <v-color-picker hide-canvas show-swatches v-model="gameThemeBackgroundColor" />
                                            <v-spacer />
                                        </v-card-actions>
                                    </v-card>
                                </v-col>
                                <v-spacer />
                            </v-row>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer />

                            <v-btn icon @click="goBeforeStep">
                                <v-icon>mdi-chevron-left</v-icon>
                            </v-btn>
                            <v-btn icon @click="goNextStep">
                                <v-icon>mdi-chevron-right</v-icon>
                            </v-btn>

                            <v-spacer />
                        </v-card-actions>
                    </v-card>
                </v-stepper-content>

                <v-stepper-content step="7">
                    <v-card>
                        <v-card-title>확인 후 생성하기</v-card-title>
                        <v-card-text>
                            <p>
                                설정한 모든 내용을 마지막으로 확인합니다.
                                <br>
                                고치고 싶은 부분이 있다면 상단의 단계 버튼을 클릭하여 수정할 수 있습니다.
                                <br>
                                이 내용은 프로젝트 폴더에 설정 파일로 내보내지며
                                <br>
                                해당 파일을 수정하여 설정을 변경할 수 있습니다.
                            </p>
                            <v-simple-table>
                                <template v-slot:default>
                                    <thead>
                                        <tr>
                                            <th>설정</th>
                                            <th>값</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>라이선스 동의</td>
                                            <td>{{ licenseAgree ? 'Ｏ' : 'Ｘ' }}</td>
                                        </tr>
                                        <tr>
                                            <td>프로젝트 이름</td>
                                            <td>{{ projectName }}</td>
                                        </tr>
                                        <tr>
                                            <td>애플리케이션 ID</td>
                                            <td>{{ applicationId }}</td>
                                        </tr>
                                        <tr>
                                            <td>해상도</td>
                                            <td>{{ displaySize }}</td>
                                        </tr>
                                        <tr>
                                            <td>테마 - 글자색</td>
                                            <td>{{ gameThemeTextColor }}</td>
                                        </tr>
                                        <tr>
                                            <td>테마 - 배경색</td>
                                            <td>{{ gameThemeBackgroundColor }}</td>
                                        </tr>
                                    </tbody>
                                </template>
                            </v-simple-table>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer />
                            <v-btn
                                text
                                :loading="isCreating"
                                :disabled="!isAllValid"
                                @click="createProject"
                            >
                                {{ isAllValid ? '프로젝트 생성' : '누락된 단계가 있습니다' }}
                            </v-btn>
                            <v-spacer />
                        </v-card-actions>
                    </v-card>
                </v-stepper-content>

                <v-stepper-content step="8">
                    <v-card>
                        <v-card-title>프로젝트 생성 중  ☆ﾐ(o*･ω･)ﾉ</v-card-title>
                        <v-card-text>
                            <p>
                                프로젝트를 생성하는 중입니다.
                                <br>
                                필요한 모듈을 다운로드받고 있으며, 이 작업에는 인터넷 연결이 필요합니다.
                                <br>
                                잠시만 기다려주세요.
                            </p>
                        </v-card-text>
                    </v-card>
                </v-stepper-content>

            </v-stepper-items>
        </v-stepper>
    </v-card>
</template>

<script lang="ts">
import os from 'os'
import path from 'path'
import { ipcRenderer, remote } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { getRandomSentence } from '@/Utils/getRandomSentence'
import LICENSE from '@/Template/Project/LICENSE.txt'

type Rule = (v: string) => boolean|string;

@Component
export default class NewProjectComponent extends Vue {
    private isCreating: boolean = false
    private step: number = 1
    private license: string = LICENSE
    private licenseAgree: boolean = false
    private projectName: string = ''
    private applicationId: string = this.setRefreshedDomain()
    private gameDisplaySize: [number, number] = [1280, 720]
    private gameDisplayResizable: boolean = true
    private gameThemeTextColor: string = '#FFFFFFFF'
    private gameThemeBackgroundColor: string = '#EF007CAA'

    private get applicationIDRule(): Rule {
        return (v: string|number) => v && /^([A-Za-z]{1}[A-Za-z\d_]*\.)+[A-Za-z][A-Za-z\d_]*$/.test(v.toString()) || 'application ID 형식이 올바르지 않습니다.'
    }

    private get projectNameRule(): Rule {
        return (v: string|number) => v && /^.([a-z]|\d)*$/.test(v.toString()) || '프로젝트 이름 형식이 올바르지 않습니다.'
    }

    private get projectNameRequiredRule(): Rule {
        return (v: string|number) => !!v || '프로젝트 이름은 필수입니다.'
    }

    private get displaySize(): string {
        return this.gameDisplaySize.join('×')
    }

    private get isAllValid(): boolean {
        let done: boolean = true

        if (this.licenseAgree !== true) done = false
        if (this.projectNameRequiredRule(this.projectName) !== true) done = false
        if (this.projectNameRule(this.projectName) !== true) done = false
        if (this.applicationIDRule(this.applicationId) !== true) done = false

        return done
    }

    private isComplete(step: number): boolean {
        return step < this.step
    }

    private goMain(): void {
        this.$router.replace('/').catch(() => null)
    }

    private goNextStep(): void {
        this.step++
    }

    private goBeforeStep(): void {
        this.step--
    }

    private getToday(): string {
        const getFixedNumber = (v: number) => v < 10 ? `0${v}` : v.toString()
        const now = new Date
        return `${now.getFullYear()}${getFixedNumber(now.getMonth()+1)}${getFixedNumber(now.getDate())}`
    }

    private getDomain(id: string): string {
        return `${id}.In_${this.getToday()}.eriengine.izure.org`
    }

    private setRefreshedDomain(): string {
        this.applicationId = this.getDomain(getRandomSentence(3))
        return this.applicationId
    }

    private setDisplaySize(width: number, height: number): void {
        this.gameDisplaySize = [width, height]
    }

    private async createProject(): Promise<void> {
        const open: Engine.FileSystem.OpenDirectorySuccess|Engine.FileSystem.OpenDirectoryFail = await ipcRenderer.invoke('open-directory')
        if (!open.success) {
            this.$store.dispatch('snackbar', open.message)
            return
        }

        this.goNextStep()

        const engineAuth: Engine.Process.GetEngineAuthSuccess|Engine.Process.GetEngineAuthFail = await ipcRenderer.invoke('get-engine-auth', this.applicationId)
        if (!engineAuth.success) {
            this.$store.dispatch('snackbar', engineAuth.message)
            return 
        }

        const engineVersion: Engine.Process.GetEngineVersionSuccess|Engine.Process.GetEngineVersionFail = await ipcRenderer.invoke('get-engine-version')
        if (!engineVersion.success) {
            this.$store.dispatch('snackbar', engineVersion.message)
            return
        }

        const config: Engine.GameProject.Config = {
            engineAuth: engineAuth.auth,
            engineVersion: engineVersion.version,
            name: this.projectName,
            applicationId: this.applicationId,
            gameDisplaySize: this.gameDisplaySize,
            gameDisplayResizable: this.gameDisplayResizable,
            gameMaximizable: true,
            gameThemeTextColor: this.gameThemeTextColor,
            gameThemeBackgroundColor: this.gameThemeBackgroundColor,
            version: '1.0.0',
            author: '',
            license: '',
            description: '에리엔진으로 만들어진 게임 프로젝트'
        }

        this.isCreating = true

        const projectCreate: Engine.GameProject.CreateProjectSuccess|Engine.GameProject.CreateProjectFail = await ipcRenderer.invoke('create-project', open.path, config)
        if (!projectCreate.success) {
            this.$store.dispatch('snackbar', projectCreate.message)

            this.goBeforeStep()
            this.isCreating = false

            return
        }

        this.$store.dispatch('snackbar', '프로젝트를 성공적으로 생성했습니다')
        this.$router.replace('/project/close').catch(() => null)
    }
}
</script>

<style lang="scss" scoped>
.theme--light {
    background: initial !important;
}

.license {
    text-align: left;
}

ol {
    list-style-type: none;
}
</style>