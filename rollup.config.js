/* tslint:disable:object-literal-sort-keys */
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";
import {uglify} from "rollup-plugin-uglify";
import pkg from "./package.json";

const buildBrowser = process.env.BUNDLE_BROWSER || false;

console.log("Bundling for browser=" + buildBrowser);

const outputNonBrowser = [
  {
    file: pkg.main,
    format: "cjs",
    sourcemap: true,
  },
  {
    file: pkg.module,
    format: "esm",
    sourcemap: true,
  },
];

const outputBrowser = [
  {
    file: pkg.browser,
    format: "iife",
    name: "TSL",
    sourcemap: true,

    globals: {
      "stacktrace-js": "ST",
    },
  }
];

const output = buildBrowser ? outputBrowser : outputNonBrowser;

const plugins = [
  typescript({
    typescript: require("typescript"),
  }),
  commonjs({
    namedExports: {
      "node_modules/stacktrace-js/stacktrace.js": [
        "fromError",
      ],
    },
  }),
  // Allow node_modules resolution, so you can use 'external' to control
  // which external modules to include in the bundle
  // https://github.com/rollup/rollup-plugin-node-resolve#usage
  resolve(),
  (buildBrowser && uglify()),
];

export default {
  input: "src/logging/typescript-logging.ts",
  output,
  plugins,
  // Disable, or watch only works once funnily enough. With this set it does work.
  watch: {
    chokidar: false,
  },
};
