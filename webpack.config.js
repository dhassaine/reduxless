const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: './src/index.html',
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve('dist'),
    filename: 'index_bundle.js'
  },
  devtool: 'source-map',
  resolve: {
    extensions: [
      '.jsx',
      '.js',
      '.css'
    ],
    alias: {
      'react'                        : 'preact-compat/dist/preact-compat',
      'react-dom'                    : 'preact-compat/dist/preact-compat',
      'react-addons-create-fragment' : 'preact-compat/dist/preact-compat'
    }
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  },
  plugins: [HtmlWebpackPluginConfig, new webpack.DefinePlugin({preact: require('preact')})]
};
