// :copyright: Copyright (c) 2016 ftrack

const defaultSettings = require('./defaults');
const devConfig = require('./dev');

const config = Object.assign({}, devConfig);

config.entry = {
    main: [
        'babel-polyfill',
        `webpack-dev-server/client?http://127.0.0.1:${defaultSettings.port}`,
        './source/application/cinema4d/index',
    ],
};

module.exports = config;
