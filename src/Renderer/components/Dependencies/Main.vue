<template>
    <v-app id="dependency">
        <v-main>
            <router-view />
        </v-main>
    </v-app>
</template>

<script lang="ts">
import Betterbacks from 'betterbacks'
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class DependenciesComponent extends Vue {
    mounted(): void {
        Betterbacks('#dependency .v-main', {
            animate: true,
            dark: true,
            type: ['squircles', 'squares', 'circles'].sort(() => Math.random() > 0.5 ? 1 : -1).pop() as any,
            themeColor: '#fefefe'
        })
    }
}
</script>

<style lang="scss" scoped>
.theme--light {
    background: initial !important;
}
</style>