const webpack = require('webpack');
const path = require('path');

const pkg = require('../package.json');
const banner = `Package name: ${pkg.name}.
Package description: ${pkg.description}.
Package version: ${pkg.version}.`

module.exports = env => {
    return {
        entry: ["@babel/polyfill", './src/Wallkit/index.js'],
        output: {
            path: path.resolve(__dirname, "../dist"),
            filename: 'wallkit.umd.min.js',
            libraryTarget: 'umd',
            // library: "Wallkit",
        },
        plugins: [
            new webpack.BannerPlugin(banner)
        ],
        optimization: {
            minimize: true
        },
        watch: !!env.watch,
        mode: 'production',
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        query: {
                            cacheDirectory: './node_modules/.cache/babel'
                        }
                    },
                },
            ],
        },
    }
};
