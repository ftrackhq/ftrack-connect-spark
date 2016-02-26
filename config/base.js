'use strict';
let path = require('path');
let defaultSettings = require('./defaults');
let additionalPaths = [];
module.exports = {
  additionalPaths: additionalPaths,
  port: defaultSettings.port,
  debug: true,
  devtool: 'eval',
  output: {
    path: path.join(__dirname, '/../dist/assets'),
    filename: 'app.js',
    publicPath: defaultSettings.publicPath
  },
  devServer: {
    contentBase: './source/',
    historyApiFallback: true,
    hot: true,
    port: defaultSettings.port,
    publicPath: defaultSettings.publicPath,
    noInfo: false
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.scss'],
    alias: {
      action: `${ defaultSettings.srcPath }/action/`,
      component: `${ defaultSettings.srcPath }/component/`,
      container: `${ defaultSettings.srcPath }/container/`,
      view: `${ defaultSettings.srcPath }/view/`,
      layout: `${ defaultSettings.srcPath }/layout/`,
      style: `${ defaultSettings.srcPath }/style/`,
      reducer: `${ defaultSettings.srcPath }/reducer/`,
    }
  },
  module: {},
  postcss: function () {
    return [];
  }
};
