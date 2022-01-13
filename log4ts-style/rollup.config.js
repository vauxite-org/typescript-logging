const sharedConfig = require("../core/rollup.config.base");

import pkg from "./package.json";

module.exports = {
  ...sharedConfig,
  input: "src/typescript/main/typescript-logging-log4ts.ts",
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
