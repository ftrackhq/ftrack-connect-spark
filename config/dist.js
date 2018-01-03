// :copyright: Copyright (c) 2016 ftrack

const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

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
        new webpack.LoaderOptionsPlugin({
            minimize: true,
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
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                screw_ie8: true, // React doesn't support IE8
                warnings: false,
            },
            mangle: {
                screw_ie8: true,
            },
            output: {
                comments: false,
                screw_ie8: true,
            },
        }),
        new webpack.optimize.AggressiveMergingPlugin(),
    ],
    module: defaultSettings.getDefaultModules(),
});

module.exports = config;
