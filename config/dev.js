// :copyright: Copyright (c) 2016 ftrack

const path = require('path');
const webpack = require('webpack');
const baseConfig = require('./base');
const defaultSettings = require('./defaults');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
        new CopyWebpackPlugin([
            { from: path.join(__dirname, '../source/favicon.ico'), to: '../' },
            {
                from: path.join(__dirname, '../source/index.html'),
                to: '../main/index.html',
            },
            {
                from: path.join(__dirname, '../source/application/adobe/index.html'),
                to: '../adobe/index.html',
            },
            {
                from: path.join(__dirname, '../source/application/cinema4d/index.html'),
                to: '../cinema4d/index.html',
            },
            { from: path.join(__dirname, '../source/static') },
        ]),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
        new webpack.ProvidePlugin({
            fetch: 'exports?self.fetch!whatwg-fetch',
        }),
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
