const webpack = require('webpack');
const path = require('path');

const pkg = require('../package.json');
const banner = `Package name: ${pkg.name}.
Package description: ${pkg.description}.
Package version: ${pkg.version}.`

module.exports = {
    entry: './src',
    output: {
        path: path.resolve(__dirname, "public"),
        publicPath: "/assets/",
        filename: 'bundle.min.js',
        // library: 'Wallkit'
    },
    devtool: 'source-map',
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            comments: false,
            compress: {
                sequences     : true,
                booleans      : true,
                loops         : true,
                unused      : true,
                warnings    : false,
                drop_console: true,
                unsafe      : true
            }
        }),
        new webpack.BannerPlugin(banner)
    ],
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
                }
            }
        ]
    }
};
