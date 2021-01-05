<template>
    <div class="lancher-main">
        <router-view />
        <v-snackbar v-model="$store.state.snackbar.active">{{ $store.state.snackbar.message }}</v-snackbar>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class AppComponent extends Vue {}
</script>

<style lang="scss" scoped>
.lancher-main {
    height: 100%;
    overflow: auto;
}
</style>

<style lang="scss">
html,
body {
    width: 100%;
    height: 100%;
    overflow: auto;
    overflow-y: hidden !important;
}

*:not(input):not(textarea) {
    user-select: none;
}

*::-webkit-scrollbar {
    width: 7px;
    &:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }
}

*::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 7px;
    &:hover {
        background-color: rgba(0, 0, 0, 0.3);
    }
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>