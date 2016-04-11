'use strict';

const path = require('path');
const args = require('minimist')(process.argv.slice(2));

// List of allowed environments
const allowedEnvs = ['dev', 'dist', 'test', 'dev_adobe', 'dev_cinema4d'];

// Set the correct environment
var env;
if (args._.length > 0 && args._.indexOf('start') !== -1) {
    env = 'test';
}
else if (args.env) {
    env = args.env;
}
else {
    env = 'dev';
}
process.env.REACT_WEBPACK_ENV = env;

// Get available configurations
const configs = {
    base: require(path.join(__dirname, 'config/base')),
    dev: require(path.join(__dirname, 'config/dev')),
    dev_adobe: require(path.join(__dirname, 'config/dev.adobe')),
    dev_cinema4d: require(path.join(__dirname, 'config/dev.cinema4d')),
    dist: require(path.join(__dirname, 'config/dist')),
    test: require(path.join(__dirname, 'config/test'))
};

/** Build the webpack configuration. */
function buildConfig(wantedEnv) {
    let isValid = (
        wantedEnv &&
        wantedEnv.length > 0 &&
        allowedEnvs.indexOf(wantedEnv) !== -1
    );
    let validEnv = isValid ? wantedEnv : 'dev';
    return configs[validEnv];
}

module.exports = buildConfig(env);
