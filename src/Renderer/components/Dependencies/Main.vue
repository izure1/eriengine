<template>
  <v-app id="dependency">
    <v-app-bar
      dense
      flat
      tile
      class="flex-grow-0"
    >
      <v-spacer />

      <v-btn
        icon
        @click="windowMinimize"
      >
        <v-icon small>mdi-window-minimize</v-icon>
      </v-btn>

      <v-btn
        icon
        @click="windowMaximize"
      >
        <v-icon small>mdi-window-maximize</v-icon>
      </v-btn>

      <v-btn
        icon
        @click="windowClose"
      >
        <v-icon small>mdi-window-close</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
      <particles-bg-component />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { BrowserWindow, remote } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import ParticlesBgComponent from '@/Renderer/components/Background/Particles.vue'

@Component({
  components: {
    ParticlesBgComponent
  }
})
export default class DependenciesComponent extends Vue {
  private get win(): BrowserWindow {
    return remote.getCurrentWindow()
  }
  
  private windowMinimize(): void {
    remote.getCurrentWindow().minimize()
  }

  private windowMaximize(): void {
    if (this.win.isMaximized()) {
      this.win.restore()
    }
    else {
      this.win.maximize()
    }
  }

  private windowClose(): void {
    remote.app.exit(0)
  }
}
</script>

<style lang="scss" scoped>
.v-app-bar {
  -webkit-app-region: drag;

  button {
    -webkit-app-region: no-drag;
  }
}

.theme--light {
  background: initial !important;
}
</style>