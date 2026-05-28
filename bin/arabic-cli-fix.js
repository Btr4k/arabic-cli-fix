#!/usr/bin/env node

import { runFirstTimeSetup } from "../lib/setup.js";
import { main } from "../lib/cli.js";

runFirstTimeSetup();

main(process.argv.slice(2)).catch((error) => {
  console.error("arabic-cli-fix failed:", error?.message || error);
  process.exit(1);
});
