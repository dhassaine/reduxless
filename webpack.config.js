const path = require('path');
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
    ]
  },
  module: {
    loaders: [
      { 
        test: /\.jsx?$/, 
        loader: 'babel-loader', 
        options: {
          "presets": [
            ["env", { "targets": { "browsers": ["last 2 versions", "ie >= 10"] } }],
            "react",
            "stage-0"
          ],
          "plugins": [
            ["transform-object-assign"]
          ]
        },
        exclude: /node_modules/ 
      },
    ]
  },
  plugins: [
    HtmlWebpackPluginConfig
  ]
};
