import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";

import pkg from "./package.json";

export default {
  input: "src/typescript/main/typescript-logging-core.ts",

  // Note commonjs is for jest as its not very good with esm modules.
  output: [
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
  ],

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
    resolve(),
  ],
};
