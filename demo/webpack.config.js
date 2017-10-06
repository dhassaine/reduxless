const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: path.resolve(__dirname, './index.html'),
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  entry: path.resolve(__dirname, './index.js'),
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
    ]
  },
  module: {
    loaders: [
      
      { test: /\.jsx?$/, use: {
        loader: 'babel-loader',
        options: {
          "presets": [
            ["env", { "targets": { "browsers": ["last 2 versions", "ie >= 10"] } }],
            "react",
            "stage-0"
          ],
          "plugins": [
            ["transform-react-jsx"],
            ["transform-object-assign"]
          ]
        }
      }, exclude: /node_modules/ }
    ]
  },
  plugins: [
    HtmlWebpackPluginConfig,
    new webpack.ProvidePlugin({
      ReactDOM: 'react-dom',
      React: 'react'
    })
  ]
};
