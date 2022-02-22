// :copyright: Copyright (c) 2016 ftrack

const path = require('path');
const defaultSettings = require('./defaults');

module.exports = {
    devtool: 'eval',
    output: {
        path: path.join(__dirname, '/../dist/assets'),
        filename: '[name].bundle.js',
        publicPath: defaultSettings.publicPath,
    },
    devServer: {
        contentBase: './source/',
        historyApiFallback: true,
        port: defaultSettings.port,
        publicPath: defaultSettings.publicPath,
        noInfo: false,
    },
    resolve: {
        extensions: ['.js', '.jsx', '.scss'],
        enforceExtension: false,
        alias: {
            action: path.resolve(defaultSettings.srcPath, 'action/'),
            component: path.resolve(defaultSettings.srcPath, 'component/'),
            container: path.resolve(defaultSettings.srcPath, 'container/'),
            view: path.resolve(defaultSettings.srcPath, 'view/'),
            layout: path.resolve(defaultSettings.srcPath, 'layout/'),
            style: path.resolve(defaultSettings.srcPath, 'style/'),
            reducer: path.resolve(defaultSettings.srcPath, 'reducer/'),
        },
    },
    module: {},
};

// Use ftrack's fork of react-toolbox.
module.exports.resolve.alias['react-toolbox'] = '@ftrack/react-toolbox';
