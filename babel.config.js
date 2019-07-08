module.exports = {
    presets: [['@vue/app', { useBuiltIns: 'entry', modules: 'commonjs' }]],
    plugins: [
        ['@babel/plugin-transform-runtime', { corejs: 2, useESModules: true }]
    ],
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
