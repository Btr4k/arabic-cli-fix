import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const MARKER = path.join(os.homedir(), ".arabic-cli-fix-configured");
const MARKER_UNIX = "# arabic-cli-fix utf-8";
const MARKER_PS = "# arabic-cli-fix utf-8";

const UNIX_BLOCK = `
# arabic-cli-fix utf-8
export LC_ALL=en_US.UTF-8
export PYTHONIOENCODING=utf-8
`;

const PS_BLOCK = `
# arabic-cli-fix utf-8
$env:LC_ALL = "en_US.UTF-8"
$env:PYTHONIOENCODING = "utf-8"
`;

export function isConfigured() {
  return fs.existsSync(MARKER);
}

export function runFirstTimeSetup() {
  if (isConfigured()) return;

  const platform = os.platform();
  const home = os.homedir();
  const results = [];

  if (platform === "win32") {
    const psProfile = path.join(
      home, "Documents", "PowerShell", "Microsoft.PowerShell_profile.ps1"
    );
    try {
      fs.mkdirSync(path.dirname(psProfile), { recursive: true });
      if (!fs.existsSync(psProfile)) fs.writeFileSync(psProfile, "", "utf8");
      results.push(appendIfMissing(psProfile, PS_BLOCK, MARKER_PS));
    } catch {
      results.push({ file: "PowerShell profile", status: "skipped" });
    }
  } else {
    const profiles = [
      path.join(home, ".bashrc"),
      path.join(home, ".zshrc"),
      path.join(home, ".profile"),
    ];
    for (const file of profiles) {
      results.push(appendIfMissing(file, UNIX_BLOCK, MARKER_UNIX));
    }
  }

  try {
    fs.writeFileSync(MARKER, new Date().toISOString(), "utf8");
  } catch {}

  const updated = results.filter(r => r.status === "updated").map(r => r.file);
  if (updated.length === 0) return;

  const sep = "─".repeat(50);
  console.log(`\narabic-cli-fix — first-run setup`);
  console.log(sep);
  for (const r of results) {
    if (r.status !== "not found") {
      console.log(`  ${r.file.padEnd(14)}  ${r.status}`);
    }
  }
  console.log(sep);
  console.log("  UTF-8 env vars added to your shell profile.");

  const platform2 = os.platform();
  if (platform2 === "win32") {
    console.log("  Restart your terminal to activate.\n");
  } else {
    console.log("  Run: source ~/.bashrc  (or open a new terminal)\n");
  }
}

function appendIfMissing(filePath, block, marker) {
  if (!fs.existsSync(filePath)) {
    return { file: path.basename(filePath), status: "not found" };
  }
  try {
    const content = fs.readFileSync(filePath, "utf8");
    if (content.includes(marker)) {
      return { file: path.basename(filePath), status: "already configured" };
    }
    fs.appendFileSync(filePath, block, "utf8");
    return { file: path.basename(filePath), status: "updated" };
  } catch {
    return { file: path.basename(filePath), status: "skipped (no permission)" };
  }
}
