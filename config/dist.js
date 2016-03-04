// :copyright: Copyright (c) 2016 ftrack

const path = require('path');
const webpack = require('webpack');

const baseConfig = require('./base');
const defaultSettings = require('./defaults');

// Add needed plugins here
const BowerWebpackPlugin = require('bower-webpack-plugin');

const config = Object.assign({}, baseConfig, {
    entry: {
        main: ['babel-polyfill', path.join(__dirname, '../source/index')],
        adobe: ['babel-polyfill', path.join(__dirname, '../source/adobe/index')],
    },
    cache: false,
    devtool: 'sourcemap',
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
        }),
        new BowerWebpackPlugin({
            searchResolveModulesDirectories: false,
        }),
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.NoErrorsPlugin(),
    ],
    module: defaultSettings.getDefaultModules(),
});

// Add needed loaders to the defaults here
config.module.loaders.push({
    test: /\.(js|jsx)$/,
    loader: 'babel',
    include: [].concat(
        config.additionalPaths,
        [path.join(__dirname, '/../source')]
    ),
});

module.exports = config;
