const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("rollup-plugin-typescript2");
const nodeResolve = require("@rollup/plugin-node-resolve");

module.exports = {
  plugins: [
    typescript({
      typescript: require("typescript"),
      clean: true,
      tsconfig: "tsconfig.prod.json",
    }),
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    nodeResolve.nodeResolve(),
  ],
};
