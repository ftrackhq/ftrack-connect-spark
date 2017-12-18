// :copyright: Copyright (c) 2017 ftrack

module.exports = ({ file, options, env }) => ({
    plugins: {
        autoprefixer({
            browsers: [
                '> 1%',
                'last 2 versions',
                'Firefox ESR',
                'Chrome >= 40',
                'Explorer >= 10',
                'Safari >= 8',
            ],
        }),
    },
});
