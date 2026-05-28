#!/usr/bin/env node

import { main } from "../lib/cli.js";

main(process.argv.slice(2)).catch((error) => {
  console.error("arabic-cli-fix failed:", error?.message || error);
  process.exit(1);
});
