<template>
    <v-card flat tile>
        <v-card-title>에리엔진</v-card-title>
        <v-card-subtitle>123</v-card-subtitle>
        <v-card-text>{{ text }}</v-card-text>
    </v-card>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import fetch from 'node-fetch';

@Component
export default class EngineNewsComponent extends Vue {
    private uri: string = 'https://eriengine.izure.org';
    private text: string = '';

    mounted(): void {
        (async (): Promise<void> => {
            const fetchResult = await fetch(this.uri);
            this.text = await fetchResult.text();
        })();
    }
}
</script>

<style lang="scss" scoped>

</style>