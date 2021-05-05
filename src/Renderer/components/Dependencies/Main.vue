<template>
    <v-app id="dependency">
        <v-main>
            <router-view />
            <particles-bg-component />
        </v-main>
    </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import ParticlesBgComponent from '@/Renderer/components/Background/Particles.vue'

@Component({
  components: {
    ParticlesBgComponent
  }
})
export default class DependenciesComponent extends Vue {}
</script>

<style lang="scss" scoped>
.theme--light {
  background: initial !important;
}
</style>