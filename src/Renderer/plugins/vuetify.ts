import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework'

import '@mdi/font/css/materialdesignicons.css'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    dark: false,
    themes: {
      light: {
        eriblue: '#0075c8',
        eripink: '#ef007c',
        eribrown: '#343233'
      },
      dark: {
        eriblue: '#0075c8',
        eripink: '#ef007c',
        eribrown: '#343233'
      },
    }
  },
  icons: {
    iconfont: 'mdi'
  }
})
