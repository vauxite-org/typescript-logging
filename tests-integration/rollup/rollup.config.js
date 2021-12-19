import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "src/typescript/main/index.ts",
  output: [
    {
      file: "dist/app/js/gen/app.js",
      name: "myapp",
      format: "iife",
      sourcemap: true,
    },
  ],

  plugins: [
    typescript({
      typescript: require("typescript"),
      clean: true,
      tsconfig: "tsconfig.json",
    }),
    // commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),
  ],
};
