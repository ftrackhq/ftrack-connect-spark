// :copyright: Copyright (c) 2016 ftrack

/**
 * Return default values.
 *
 * Used because Object.assign does a shallow instead of a deep copy.
 * Using [].push will add to the base array, so a require will alter
 * the base array output.
 */
const path = require('path');
const srcPath = path.join(__dirname, '/../source');
const POSTCSS_CONFIG_FILE = path.join(__dirname, 'postcss.config.js');
const SASS_THEME_FILE = path.resolve(srcPath, 'style/_theme.scss');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const dfltPort = 8000;

/** Return the default modules object for webpack. */
function getDefaultModules() {
    const rules = [{
        test: /.jsx?$/,
        enforce: 'pre',
        include: srcPath,
        use: [{
            loader: 'eslint-loader',
            options: {
                ignore: false,
            },
        }],
    }];

    rules.push({
        test: /.jsx?$/,
        include: srcPath,
        use: [{
            loader: 'babel-loader',
            options: {
                cacheDirectory: true,
                ignore: [
                    'static/**',
                ],
                presets: [
                    require.resolve('babel-preset-es2015'),
                    require.resolve('babel-preset-react'),
                ],
                plugins: [
                    require.resolve('babel-plugin-transform-object-rest-spread'),
                ],
            },
        }],
    });

    rules.push({
        test: /(\.scss|\.css)$/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
                {
                    loader: 'css-loader',
                    options: {
                        modules: true,
                        sourceMap: true,
                        importLoaders: 1,
                        localIdentName: '[name]--[local]--[hash:base64:8]',
                    },
                },
                {
                    loader: 'postcss-loader',
                    options: {
                        config: { path: POSTCSS_CONFIG_FILE },
                    },
                },
                {
                    loader: 'sass-loader',
                    options: {
                        data: `@import "${SASS_THEME_FILE.replace(/\\/g, '/')}";`,
                    },
                },
            ],
        }),
    });

    // URL Loader (https://github.com/webpack/url-loader)
    // Will return a data-url if lower than size limit, and otherwise pass to
    // a file loader.
    rules.push({
        test: /\.(png|jpg|gif|woff|woff2)$/,
        use: [{
            loader: 'url-loader',
            options: {
                limit: 8192,
            },
        }],
    });

    return {
        rules,
    };
}


module.exports = {
    srcPath,
    publicPath: '/assets/',
    port: dfltPort,
    getDefaultModules,
};
