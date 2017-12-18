// :copyright: Copyright (c) 2016 ftrack

const path = require('path');
const webpack = require('webpack');
const baseConfig = require('./base');
const defaultSettings = require('./defaults');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = Object.assign({}, baseConfig, {
    entry: {
        main: [
            'babel-polyfill',
            `webpack-dev-server/client?http://127.0.0.1:${defaultSettings.port}`,
            './source/application/main/index',
        ],
    },
    cache: true,
    devtool: 'eval-source-map',
    plugins: [
        new webpack.LoaderOptionsPlugin({
            debug: true,
        }),
        new ExtractTextPlugin({ filename: '[name].bundle.css' }),
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
            fetch: 'exports-loader?self.fetch!whatwg-fetch',
        }),
    ],
    module: defaultSettings.getDefaultModules(),
});

module.exports = config;
