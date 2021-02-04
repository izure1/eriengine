import Vue from 'vue'
import App from './Renderer/App.vue'
import vuetify from './Renderer/plugins/vuetify'
import router from './Renderer/plugins/router'
import store from './Renderer/plugins/vuex'

Vue.config.productionTip = false

const app = new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')

app.$router.replace('/dependencies')