'use strict';

let path = require('path');
let srcPath = path.join(__dirname, '/../source/');

let baseConfig = require('./base');

// Add needed plugins here
let BowerWebpackPlugin = require('bower-webpack-plugin');

module.exports = {
  devtool: 'eval',
  module: {
    preLoaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'isparta-instrumenter-loader',
        include: [
          path.join(__dirname, '/../source')
        ]
      }
    ],
    loaders: [
      {
        test: /\.(png|jpg|gif|woff|woff2|css|sass|scss|less|styl)$/,
        loader: 'null-loader'
      },
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        include: [].concat(
          baseConfig.additionalPaths,
          [
            path.join(__dirname, '/../source'),
            path.join(__dirname, '/../test')
          ]
        )
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.scss'],
    alias: {
      action: `${srcPath}/action/`,
      component: `${srcPath}/component/`,
      container: `${srcPath}/container/`,
      view: `${srcPath}/view/`,
      layout: `${srcPath}/layout/`,
      style: `${srcPath}/style/`,
      reducer: `${srcPath}/reducer/`,
      helper: path.join(__dirname, '/../test/helper'),
    },
  },
  plugins: [
    new BowerWebpackPlugin({
      searchResolveModulesDirectories: false
    })
  ]
};
