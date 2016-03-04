var webpackCfg = require('./webpack.config');

module.exports = function (config) {
    config.set({
        basePath: '',
        browsers: ['PhantomJS'],
        files: [
            'test/load_tests.js'
        ],
        port: 8080,
        captureTimeout: 60000,
        frameworks: ['mocha', 'chai'],
        client: {
            mocha: {
                ui: 'tdd'
            }
        },
        singleRun: true,
        reporters: ['mocha', 'coverage'],
        preprocessors: {
            'test/load_tests.js': ['webpack', 'sourcemap']
        },
        webpack: webpackCfg,
        webpackServer: {
            noInfo: true
        },
        coverageReporter: {
            dir: 'coverage/',
            reporters: [
                {type: 'html'},
                {type: 'text'}
            ]
        }
    });
};
