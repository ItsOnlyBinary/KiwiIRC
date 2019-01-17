module.exports = {
    presets: [
        ['@vue/app', {
            useBuiltIns: 'usage',
            // required for exports used by exports-loader
            modules: "commonjs"
        }]
    ],
    plugins: [
        ['@babel/plugin-transform-runtime', { corejs: 2 }]
    ],
    env: {
        test: {
            plugins: [
                [ 'istanbul', { exclude: ['**/*.spec.js'] } ],
            ],
        },
    },
};
