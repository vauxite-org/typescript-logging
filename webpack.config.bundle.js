var webpack = require("webpack");

module.exports = {

    entry: "./dist/commonjs/typescript-logging.js",
    devtool: "source-map",
    output: {
        library: "TSL",
        path: "./dist/bundle",
        filename: "typescript-logging-bundle.js"
    },
    plugins: []
};