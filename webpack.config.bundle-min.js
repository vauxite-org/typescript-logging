const path = require("path");

module.exports = {
  mode: "production",
  entry: "./dist/commonjs/typescript-logging.js",
  devtool: "source-map",
  output: {
    libraryTarget: "var",
    library: "TSL",
    path: path.resolve(__dirname, "dist/bundle"),
    filename: "typescript-logging.bundle.min.js"
  },
  plugins: []
};
