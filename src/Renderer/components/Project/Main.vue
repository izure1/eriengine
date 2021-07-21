<template>
  <v-app id="project">
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
    </v-main>
    <particles-bg-component />
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
export default class Launcher extends Vue {
  private get win(): BrowserWindow {
    return remote.getCurrentWindow()
  }
  
  private windowMinimize(): void {
    this.win.minimize()
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
.theme--light {
  background: initial !important;
}

.v-app-bar {
  -webkit-app-region: drag;

  button {
    -webkit-app-region: no-drag;
  }
}
</style>