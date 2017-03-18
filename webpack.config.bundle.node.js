var webpack = require("webpack");

module.exports = {

  entry: "./dist/commonjs/typescript-logging.js",
  devtool: "source-map",
  output: {
    libraryTarget: "commonjs",
    library: "TSL",
    path: "./dist-test/bundle",
    filename: "typescript-logging-bundle.js",

  },
  target: "node",
  plugins: []
};