// :copyright: Copyright (c) 2016 ftrack

const path = require('path');
const webpack = require('webpack');
const baseConfig = require('./base');
const defaultSettings = require('./defaults');

const config = Object.assign({}, baseConfig, {
    entry: {
        main: [
            'babel-polyfill',
            `webpack-dev-server/client?http://127.0.0.1:${defaultSettings.port}`,
            'webpack/hot/only-dev-server',
            './source/application/main/index',
        ],
    },
    cache: true,
    devtool: 'eval-source-map',
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
    ],
    module: defaultSettings.getDefaultModules(),
    eslint: {
        emitWarning: true,
    },
});

// Add needed loaders to the defaults here
config.module.loaders.push({
    test: /\.(js|jsx)$/,
    loader: 'babel-loader',
    query: {
        presets: ['react', 'es2015', 'react-hmre'],
    },
    include: [].concat(
        config.additionalPaths,
        [path.join(__dirname, '/../source')]
    ),
});

module.exports = config;
