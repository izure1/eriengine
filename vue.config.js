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
  }
}