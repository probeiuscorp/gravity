const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.ttf$/,
                use: 'file-loader'
            }
        ]
    },
    entry: {
        main: path.join(__dirname, 'src', 'load.ts')
    },
    output: {
        globalObject: 'self',
        path: path.join(__dirname, 'dist'),
        filename: '[name].bundle.js'
    },
    resolve: {
        extensions: [ '.ts', '.js' ]
    },
    devtool: 'source-map',
    watch: true,
    plugins: [
        new MonacoWebpackPlugin({
            languages: ['typescript']
        })
    ]
}