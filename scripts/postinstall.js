#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Only run during global install, not local dev installs
if (process.env.npm_config_global !== "true") {
  process.exit(0);
}

const home = os.homedir();
const platform = os.platform();
const MARKER = "# arabic-cli-fix utf-8";

const UNIX_BLOCK = `
${MARKER}
export LC_ALL=en_US.UTF-8
export PYTHONIOENCODING=utf-8
`;

const PS_BLOCK = `
${MARKER}
$env:LC_ALL = "en_US.UTF-8"
$env:PYTHONIOENCODING = "utf-8"
`;

function appendIfMissing(filePath, block) {
  if (!fs.existsSync(filePath)) return "not found";
  const content = fs.readFileSync(filePath, "utf8");
  if (content.includes(MARKER)) return "already configured";
  fs.appendFileSync(filePath, block, "utf8");
  return "updated";
}

function tryWrite(filePath, block) {
  try {
    return appendIfMissing(filePath, block);
  } catch {
    return "failed (no write permission)";
  }
}

const sep = "─".repeat(50);
console.log(`\narabic-cli-fix — post-install setup`);
console.log(sep);

if (platform === "win32") {
  const psProfile = path.join(
    home,
    "Documents",
    "PowerShell",
    "Microsoft.PowerShell_profile.ps1"
  );

  try {
    fs.mkdirSync(path.dirname(psProfile), { recursive: true });
    if (!fs.existsSync(psProfile)) fs.writeFileSync(psProfile, "", "utf8");
  } catch {}

  const status = tryWrite(psProfile, PS_BLOCK);
  console.log(`  PowerShell profile  ${status}`);
  console.log(`  Path: ${psProfile}`);

} else {
  const profiles = [
    path.join(home, ".bashrc"),
    path.join(home, ".zshrc"),
    path.join(home, ".profile"),
  ];

  for (const file of profiles) {
    const status = tryWrite(file, UNIX_BLOCK);
    console.log(`  ${path.basename(file).padEnd(12)}  ${status}`);
  }
}

console.log(sep);
console.log("  UTF-8 settings applied to your shell profile.");
console.log("  Run `source ~/.bashrc` or open a new terminal to activate.");
console.log("  Then verify: acf doctor\n");
