const webpack = require('webpack');
const path = require('path');
const EsmWebpackPlugin = require("@purtuga/esm-webpack-plugin");

module.exports = env => {

    return {
        entry: ['./src/Wallkit/index.js'],
        output: {
            path: path.resolve(__dirname, "../dist"),
            filename: 'wallkit.esm.min.js',
            libraryTarget: 'var',
            library: "Wallkit",
        },
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
        plugins: [
            new EsmWebpackPlugin()
        ]
    }
};
