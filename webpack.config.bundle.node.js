const path = require("path");

module.exports = {

  entry: "./dist/commonjs/typescript-logging.js",
  devtool: "source-map",
  output: {
    libraryTarget: "commonjs",
    library: "TSL",
    path: path.resolve(__dirname, "dist-test/bundle"),
    filename: "typescript-logging-bundle.js",
  },
  target: "node",
  plugins: []
};