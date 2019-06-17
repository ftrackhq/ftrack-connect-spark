// :copyright: Copyright (c) 2016 ftrack

const defaultSettings = require('./defaults');
const devConfig = require('./dev');

const config = Object.assign({}, devConfig);

config.entry = {
    main: [
        'babel-polyfill',
        `webpack-dev-server/client?http://127.0.0.1:${defaultSettings.port}`,
        './source/application/adobe/index',
    ],
};

// Large source maps in CEF causes issues with the remote developer tools.
// They have been disabled to allow remote debugging, but can be enabled
// here by removing the following override.
//
// See issue: https://github.com/nwjs/nw.js/issues/2738
//
//config.devtool = null;

module.exports = config;
