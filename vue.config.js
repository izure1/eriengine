const path = require('path')
const { version } = require('./package.json')

module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  configureWebpack: {
    target: 'electron-renderer',
    resolve: {
      alias: {
        '~': path.join(__dirname, 'src')
      }
    }
  },
  chainWebpack: config => {
    config.module
      .rule('raw')
      .test(/\.txt$/)
      .use('raw-loader')
      .loader('raw-loader')
      .end()
    config
      .plugin('html')
      .tap(args => {
        args[0].title = `에리엔진 v${version}`
        return args
      })
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