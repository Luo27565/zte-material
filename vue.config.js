const WebpackAssetsManifest = require('webpack-assets-manifest')

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: '@import "@/styles/_variables.scss";'
      }
    }
  },
  configureWebpack: config => {
    config.plugins = config.plugins.concat(
      new WebpackAssetsManifest({
        output: 'asset-manifest.json'
      })
    )
  },
  chainWebpack: config => {
    console.log('----------------------------------------------')
    // config.module.rule('css').test(/\.(woff|ttf)(\?.*)?$/).use('url-loader').loader('url-loader').option({ name: 'resources/fonts/[name].[ext]' })
    // config.module.rules.push({
    //   test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
    //   loader: 'url-loader',
    //   option: {
    //     name: 'resources/fonts/[name].[ext]'
    //   }
    // })
  },
  publicPath: process.env.VUE_APP_PUBLIC_URL,
  devServer: {
    proxy: {
      '/api': {
        // target: 'http://192.168.1.121:4502/',
        target: 'http://192.168.8.149:4502/',
        changeOrigin: true,
        logLevel: 'debug',
        pathRewrite: {
          '^/api': ''
        }
      },
      '/aem': {
        target: 'http://localhost:4502/',
        auth: 'admin:admin',
        changeOrigin: true,
        logLevel: 'debug',
        pathRewrite: {
          '^/aem': ''
        }
      }
    },
    clientLogLevel: 'info',
    watchOptions: {
      poll: true
    },
    writeToDisk: true
  }
}
