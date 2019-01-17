module.exports = {
    presets: [['@vue/app', { useBuiltIns: 'entry' }]],
    plugins: [['@babel/plugin-transform-runtime', { corejs: 2 }]],
    env: {
        test: {
            plugins: [
                [
                    'istanbul',
                    {
                        exclude: ['**/*.spec.js'],
                    },
                ],
            ],
        },
    },
};
