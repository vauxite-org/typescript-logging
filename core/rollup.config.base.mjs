import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import nodeResolve from "@rollup/plugin-node-resolve";


const tsConfigOptions = {
  clean: true,
  abortOnError: true,
  tsconfig: "tsconfig.prod.json",

  tsconfigOverride: {
    compilerOptions: {
      noEmitOnError: true, // Rather have it in tsconfig, but atm this feature is ignored by the plugin.
    },
  },
};


const DEFAULTS = {
  plugins: [
    typescript(tsConfigOptions),
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    nodeResolve(),
  ],
};

export default DEFAULTS;
