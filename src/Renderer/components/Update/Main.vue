<template>
    <v-card flat>
        <v-card-title>업데이트 확인</v-card-title>
        <v-card-subtitle>
            에리엔진에 릴리즈된 업데이트가 있는지 확인합니다.
        </v-card-subtitle>
        <v-card-text>
            <v-alert
                v-if="error"
                type="error"
            >{{ error }}</v-alert>
            <v-progress-linear
                v-if="downloadProgress"
                :value="downloadProgress"
                :buffer-value="bufferProgress"
                :color="progressColor"
                height="10"
                stream
            ></v-progress-linear>
        </v-card-text>
        <v-card-actions>
            <v-spacer />
            <v-btn
                v-if="!downloaded"
                :disabled="downloading || downloaded || error"
                @click="download"
                text
            >업데이트 확인</v-btn>
            <v-btn
                v-if="downloaded"
                :disabled="downloading || !downloaded || error"
                @click="install"
                text
            >업데이트 설치를 위해 다시 시작</v-btn>
            <v-spacer />
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
import { ipcRenderer, IpcRendererEvent } from 'electron';
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class UpdaterComponent extends Vue {
    private downloadProgress: number = 0;
    private chunkSize: number = 0;
    private error: string|null = null;
    private onDownloadProgress: ((this: UpdaterComponent, e: IpcRendererEvent, progress: number) => void)|null = null;
    private onDownloadError: ((this: UpdaterComponent, e: IpcRendererEvent, message: string) => void)|null = null;

    private get downloading(): boolean {
        return this.downloadProgress > 0 && this.downloadProgress < 100;
    }

    private get downloaded(): boolean {
        return this.downloadProgress >= 100;
    }

    private get bufferProgress(): number {
        return this.downloadProgress + this.chunkSize;
    }

    private get progressColor(): string {
        return this.error ? 'error' : 'primary';
    }

    private async download(): Promise<boolean> {
        this.downloadProgress = 0.1;
        const download: Engine.Process.DownloadUpdateSuccess|Engine.Process.DownloadUpdateFail = await ipcRenderer.invoke('download-update');
        if (!download.success || !download.available) {
            this.$store.dispatch('snackbar', '현재 가능한 업데이트가 없습니다.');
            this.downloadProgress = 0;
            return false;
        }
        return true;
    }

    private async install(): Promise<void> {
        ipcRenderer.invoke('install-update');
    }

    private listenDownloadEvent(): void {
        this.onDownloadProgress = (e: IpcRendererEvent, progress: number): void => {
            this.chunkSize = progress - this.downloadProgress;
            this.downloadProgress = ~~progress;
        };
        this.onDownloadError = (e: IpcRendererEvent, message: string): void => {
            this.error = message;
        };
        ipcRenderer.on('download-update-progress', this.onDownloadProgress);
        ipcRenderer.on('download-update-error', this.onDownloadError);
    }

    private unlistenDownloadEvent(): void {
        if (this.onDownloadProgress) {
            ipcRenderer.off('download-update-progress', this.onDownloadProgress);
        }
        if (this.onDownloadError) {
            ipcRenderer.off('download-update-error', this.onDownloadError);
        }
    }

    mounted(): void {
        this.listenDownloadEvent();
    }

    beforeDestroy(): void {
        this.unlistenDownloadEvent();
    }
}
</script>

<style lang="scss" scoped>

</style>