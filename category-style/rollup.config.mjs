import sharedConfig from "../core/rollup.config.base.mjs";

import pkg from "./package.json" assert {type: "json"};

const SETTINGS = {
  ...sharedConfig,
  input: "src/typescript/main/typescript-logging-category.ts",
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
}

export default SETTINGS;
