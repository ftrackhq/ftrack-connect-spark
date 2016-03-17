// :copyright: Copyright (c) 2016 ftrack

const path = require('path');
const autoprefixer = require('autoprefixer');
const defaultSettings = require('./defaults');
const additionalPaths = [];

module.exports = {
    additionalPaths,
    port: defaultSettings.port,
    debug: true,
    devtool: 'eval',
    output: {
        path: path.join(__dirname, '/../dist/assets'),
        filename: '[name].bundle.js',
        publicPath: defaultSettings.publicPath,
    },
    devServer: {
        contentBase: './source/',
        historyApiFallback: true,
        hot: true,
        port: defaultSettings.port,
        publicPath: defaultSettings.publicPath,
        noInfo: false,
    },
    resolve: {
        extensions: ['', '.js', '.jsx', '.scss'],
        alias: {
            action: `${defaultSettings.srcPath}/action/`,
            component: `${defaultSettings.srcPath}/component/`,
            container: `${defaultSettings.srcPath}/container/`,
            view: `${defaultSettings.srcPath}/view/`,
            layout: `${defaultSettings.srcPath}/layout/`,
            style: `${defaultSettings.srcPath}/style/`,
            reducer: `${defaultSettings.srcPath}/reducer/`,
        },
    },
    module: {},
    postcss: () => [autoprefixer({
        browsers: [
            '> 1%',
            'last 2 versions',
            'Firefox ESR',
            'Chrome >= 40',
            'Explorer >= 10',
        ],
    })],
};
