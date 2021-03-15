const path = require('path')

module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  configureWebpack: {
    target: 'electron-renderer'
  },
  chainWebpack: config => {
    config.module
      .rule('raw')
      .test(/\.txt$/)
      .use('raw-loader')
      .loader('raw-loader')
      .end()
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        win: {
          icon: path.resolve(__dirname, 'public', 'icon.png'),
          artifactName: "${productName}-Setup-${version}.${ext}"
        }
      }
    }
  }
}