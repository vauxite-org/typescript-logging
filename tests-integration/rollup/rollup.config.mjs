import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";

const tsConfigOptions = {
  clean: true,
  abortOnError: true,
  tsconfig: "tsconfig.json",

  tsconfigOverride: {
    compilerOptions: {
      noEmitOnError: true, // Rather have it in tsconfig, but atm this feature is ignored by the plugin.
    },
  },
};

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
    typescript(tsConfigOptions),
    // commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),
  ],
};

