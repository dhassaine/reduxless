const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: path.resolve(__dirname, "./index.html"),
  filename: "index.html",
  inject: "body"
});

module.exports = {
  entry: path.resolve(__dirname, "./index.js"),
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "demo.js",
    publicPath: ""
  },
  mode: "development",
  target: "web",
  devtool: "source-map",
  resolve: {
    extensions: [".jsx", ".js", ".css"]
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "env",
                { targets: { browsers: ["last 2 versions", "ie >= 10"] } }
              ],
              "react",
              "stage-0"
            ],
            plugins: [["transform-object-assign"]]
          }
        }
      }
    ]
  },
  plugins: [HtmlWebpackPluginConfig],
  devServer: {
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, "dist")
  }
};
