const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
    entry: {
        main: './app/index.js',
        sw: './app/service-worker.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: { 
                    presets: ['@babel/env', '@babel/preset-react'],
                    plugins: ['@babel/plugin-syntax-dynamic-import']
                }
            },
            {
                test: /\.scss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    { 
                        loader: 'css-loader'
                    },
                    { 
                        loader: 'sass-loader'
                    },
                ]
            },
            {
              test: /\.ttf/,
              type: 'asset/resource'
            },
            {
                test: /\.(png|svg|jpg|jpeg)/,
                type: 'asset/resource'
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].chunk.js',
        chunkFilename:'[name].chunk.js',
        publicPath: '/',
        clean: true
    },
    resolve: { 
        extensions: ['.js', '.jsx'] 
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            publicPath: '/',
            meta: {
                viewport: 'width=device-width, initial-scale=1'
            },
            inject: false,
            templateContent: function (params) {
                return `
                    <!DOCTYPE html>
                    <html>
                        <head>
                            <meta charset="utf-8" />
                            <title>Maginhawa</title>
                            ${params.htmlWebpackPlugin.tags.headTags}
                        </head>
                        <body>
                            <main id="root"></main>
                            ${params.htmlWebpackPlugin.tags.bodyTags}
                        </body>
                    </html>
                `
            },
        }),
        new MiniCssExtractPlugin()
    ],
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        host: 'localhost',
        port: 4321,
        publicPath: 'http://localhost:4321/',
        hot: true
    },
    optimization: {
        usedExports: true,
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        }
    }
}