const path = require('path');
const fs = require('fs');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const pkg = require('./package.json');

let webpackPlugins = [
    new CopyWebpackPlugin([
        {
            from: path.join(__dirname, 'static/'),
            to: path.join(__dirname, 'dist/static/'),
            toType: 'dir',
            ignore: ['.*', 'config.local.json'],
        },
    ]),
];

if (process.env.NODE_ENV === 'development') {
    // override config.json with config.local.json if it exists
    let localConfig = path.resolve(__dirname, './static/config.local.json');
    if (fs.existsSync(localConfig)) {
        webpackPlugins.push(new CopyWebpackPlugin([
            {
                from: localConfig,
                to: path.join(__dirname, 'dist/static/config.json'),
                force: true,
            },
        ]));
    }
}

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
            maxEntrypointSize: 1500000,
            maxAssetSize: 1000000,
        },
        optimization: {
            usedExports: false,
            concatenateModules: false,
        },
        plugins: webpackPlugins,
    },
    chainWebpack: (config) => {
        config.plugin('html').tap((args) => {
            args[0].template = path.join(__dirname, 'index.html');
            return args;
        });

        config.plugin('define').tap((args) => {
            args[0] = {
                ...args[0],
                __VERSION__: JSON.stringify(pkg.version),
            };
            return args;
        });

        // add builds/ to resolveLoader for exports-loader
        config.resolveLoader.modules.add(path.resolve(__dirname, 'build/'));

        // add exports-loader for GobalApi
        const vueRule = config.module.rule('vue');
        const vueCacheOptions = vueRule.uses.get('cache-loader').get('options');
        const vueOptions = vueRule.uses.get('vue-loader').get('options');
        vueRule.uses.clear();
        vueRule.use('cache-loader').loader('cache-loader').options(vueCacheOptions);
        vueRule.use('exports-loader').loader('exports-loader');
        vueRule.use('vue-loader').loader('vue-loader').options(vueOptions);

        const jsRule = config.module.rule('js');
        const jsCacheOptions = jsRule.uses.get('cache-loader').get('options');
        jsRule.uses.clear();
        jsRule.use('cache-loader').loader('cache-loader').options(jsCacheOptions);
        jsRule.use('exports-loader').loader('exports-loader');
        jsRule.use('babel-loader').loader('babel-loader');

        config.module
            .rule('html')
            .test(/\.html$/)
            .use('html-loader')
            .loader('html-loader');

        // Remove the old 'app' entry
        config.entryPoints.delete('app');

        // IE11 required by the webpack runtime for async import().
        // babel polyfills don't help us here
        config.entry('app').add('core-js/features/promise');

        // IE11 play nice with vue-virtual-scroller
        config.entry('app').add('core-js/features/array/virtual/find-index');
        config.entry('app').add('core-js/features/array/virtual/includes');

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
