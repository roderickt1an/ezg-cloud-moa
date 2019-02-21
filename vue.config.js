/* eslint-disable global-require */
const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {
  BundleAnalyzerPlugin
} = require('webpack-bundle-analyzer');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const AutoDllPlugin = require('autodll-webpack-plugin');

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  parallel: require('os').cpus().length > 1,
  lintOnSave: false,
  css: {
    loaderOptions: {
      less: {
        //  修改样式文件不生效，不知道为啥
        modifyVars: {
          red: '#CC3300',
          '@nav-bar-background-color': '#CC3300',
          '@nav-bar-title-font-size': '32px',
        },
      },
    },
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://192.168.0.220:9000',
        pathRewrite: {
          '^/api': '',
        },
        ws: true,
        changeOrigin: true,
      },
    },
  },
  chainWebpack: (config) => {
    // config.optimization
    //   .splitChunks({
    //     cacheGroups: {},
    //   });
    config.plugins.delete('preload');
    config.plugins.delete('prefetch');
    config.plugins.delete('SplitChunksPlugin');
    config.resolve.alias
      .set('@assets', resolve('src/assets'))
      .set('@api', resolve('src/api'))
      .set('@components', resolve('src/components'))
      .set('@layouts', resolve('src/layouts'));
    config.module
      .rule('ts')
      .use('ts-loader')
      .tap((options) => {
        options = merge(options, {
          transpileOnly: true,
          compilerOptions: {
            module: 'es2015',
          },
        });
        return options;
      });
    config.plugin('copy')
      .tap((args) => {
        args[0].push({
          from: resolve('./WW_verify_z793ZwW9R5YytI0x.txt'),
          to: resolve('./dist'),
        });
        return args;
      });
  },
  configureWebpack: (config) => {
    config.plugins.push(
      new AutoDllPlugin({
        inject: true, // will inject the DLL bundle to index.html
        debug: true,
        filename: '[name]_[hash].js',
        path: './dll',
        entry: {
          vue: [
            'vue-router',
            'vuex',
            'vant/lib',
          ],
          vant: ['vant'],
          corejs: [
            'core-js',
            'core-js/library',
          ],
        },
      }),
      new BundleAnalyzerPlugin(),
    );
  },
};
