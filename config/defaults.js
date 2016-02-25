/**
 * Function that returns default values.
 * Used because Object.assign does a shallow instead of a deep copy.
 * Using [].push will add to the base array, so a require will alter
 * the base array output.
 */
'use strict';

const path = require('path');
const srcPath = path.join(__dirname, '/../source');
const dfltPort = 8000;

/**
 * Get the default modules object for webpack
 * @return {Object}
 */
function getDefaultModules() {
  let loaders = [];
  let preLoaders = [{
    test: /\.(js|jsx)$/,
    loader: 'eslint-loader',
    exclude: /node_modules/
  }];

  const BASE_CSS_LOADER = 'css?sourceMap&-minimize'
  const PATHS_TO_TREAT_AS_CSS_MODULES = [
    'react-toolbox',
    srcPath
  ]
  const cssModulesRegex = new RegExp(
    `(${PATHS_TO_TREAT_AS_CSS_MODULES.join('|')})`
  )

  const cssModulesLoader = [
    BASE_CSS_LOADER,
    'modules',
    'importLoaders=1',
    'localIdentName=[name]__[local]___[hash:base64:5]'
  ].join('&')

  loaders.push({
    test: /\.scss$/,
    include: cssModulesRegex,
    loaders: [
      'style',
      cssModulesLoader,
      'postcss',
      'sass?sourceMap'
    ]
  })

  loaders.push({
    test: /\.css$/,
    include: cssModulesRegex,
    loaders: [
      'style',
      cssModulesLoader,
      'postcss'
    ]
  })

  loaders.push({
    test: /\.scss$/,
    exclude: cssModulesRegex,
    loaders: [
      'style',
      BASE_CSS_LOADER,
      'postcss',
      'sass?sourceMap'
    ]
  })

  loaders.push({
    test: /\.css$/,
    exclude: cssModulesRegex,
    loaders: [
      'style',
      BASE_CSS_LOADER,
      'postcss'
    ]
  })

  loaders.push({
    test: /\.(png|jpg|gif|woff|woff2)$/,
    loader: 'url-loader?limit=8192'
  })

  return {
    preLoaders: preLoaders,
    loaders: loaders
  };
}

module.exports = {
  srcPath: srcPath,
  publicPath: '/assets/',
  port: dfltPort,
  getDefaultModules: getDefaultModules
};
