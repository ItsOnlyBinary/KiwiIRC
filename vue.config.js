const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    publicPath: '',
    assetsDir: 'static/',
    lintOnSave: false,
    runtimeCompiler: true,
    transpileDependencies: ['ip-regex', 'isomorphic-textencoder'],
    configureWebpack: {
        resolve: {
            extensions: ['.js', '.vue', '.json'],
            alias: {
                vue$: 'vue/dist/vue.common.js',
            },
        },
        performance: {
            maxEntrypointSize: 1400000,
            maxAssetSize: 1000000,
        },
        optimization: {
            usedExports: false,
            concatenateModules: false,
        },
        plugins: [
            new CopyWebpackPlugin([
                {
                    from: path.join(__dirname, 'static/'),
                    to: path.join(__dirname, 'dist/static/'),
                    toType: 'dir',
                    ignore: ['index.html', '.DS_Store'],
                },
            ]),
        ],
    },
    chainWebpack: (config) => {
        config.plugin('html').tap((args) => {
            args[0].template = path.join(__dirname, 'index.html');
            return args;
        });

        config.module
            .rule('html')
            .test(/\.html$/)
            .use('html-loader')
            .loader('html-loader');

        // Remove the old 'app' entry
        config.entryPoints.delete('app');

        // IE11 required by the webpack runtime for async import().
        // babel polyfills don't help us here
        config.entry('app').add('core-js/fn/promise');

        // IE11 play nice with json5
        config.entry('app').add('core-js/es6/symbol');
        config.entry('app').add('core-js/fn/string/code-point-at');
        config.entry('app').add('core-js/fn/string/from-code-point');

        // IE11 play nice with vue-vue-virtual-scroller
        config.entry('app').add('core-js/fn/array/virtual/find-index');
        config.entry('app').add('core-js/fn/array/virtual/includes');

        // Kiwiirc main entry point
        config.entry('app').add('./src/main.js');
    },
    pluginOptions: {
        karma: {
            karmaConfig: {
                browsers: ['PhantomJS'],
                frameworks: ['mocha', 'sinon-chai'], //
                reporters: ['spec', 'coverage'],
                files: ['tests/unit/index.js'],
                preprocessors: {
                    'tests/unit/index.js': ['webpack', 'sourcemap'],
                },
                coverageReporter: {
                    dir: 'tests/unit/coverage',
                    reporters: [
                        { type: 'lcov', subdir: 'tests/unit/coverage/' },
                        { type: 'text-summary' },
                    ],
                },
            },
        },
    },
};
