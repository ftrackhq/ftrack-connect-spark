// :copyright: Copyright (c) 2016 ftrack

const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const baseConfig = require('./base');
const defaultSettings = require('./defaults');

const config = Object.assign({}, baseConfig, {
    entry: {
        main: [
            'babel-polyfill',
            path.join(__dirname, '../source/application/main/index'),
        ],
        adobe: [
            'babel-polyfill',
            path.join(__dirname, '../source/application/adobe/index'),
        ],
        cinema4d: [
            'babel-polyfill',
            path.join(__dirname, '../source/application/cinema4d/index'),
        ],
    },
    cache: false,
    devtool: 'sourcemap',
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
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
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
    loader: 'babel-loader',
    query: {
        presets: ['react', 'es2015'],
    },
    include: [].concat(
        config.additionalPaths,
        [path.join(__dirname, '/../source')]
    ),
});

module.exports = config;
