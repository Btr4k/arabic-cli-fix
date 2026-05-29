import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildDoctorReport, printDoctorReport } from "./doctor.js";
import { writeAiRuleFiles, writeArabicOutputFile } from "./templates.js";
import { runVerify } from "./verify.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const require = createRequire(import.meta.url);
const { version: VERSION } = require("../package.json");

export async function main(args) {
  const command = args[0] || "help";

  switch (command) {
    case "help":
    case "--help":
    case "-h":
      printHelp();
      return;

    case "version":
    case "--version":
    case "-v":
      console.log(VERSION);
      return;

    case "doctor":
      printDoctorReport(buildDoctorReport());
      return;

    case "test":
      runArabicTest();
      return;

    case "verify":
      runVerify();
      return;

    case "fix":
      printFixGuide();
      return;

    case "init-ai": {
      const targetDir = getTargetDir(args.slice(1));
      const force = args.includes("--force");
      const result = writeAiRuleFiles(targetDir, force);
      printWriteResult(result);
      return;
    }

    case "output": {
      const targetDir = getTargetDir(args.slice(1));
      const filename = getOption(args.slice(1), "--file") || "arabic-output.md";
      const result = writeArabicOutputFile(targetDir, filename);
      printWriteResult(result);
      return;
    }

    case "setup":
      printSetupGuide();
      return;

    case "run":
      await runWrappedCommand(args.slice(1));
      return;

    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exitCode = 1;
  }
}

function printHelp() {
  console.log(`
Arabic CLI Fix ${VERSION}

Usage:
  arabic-cli-fix <command> [options]
  acf <command> [options]

Commands:
  doctor                      Inspect terminal, shell, encoding, and Arabic-readiness.
  verify                      Confirm Arabic UTF-8 roundtrip works (file write/read test).
  test                        Print Arabic text to verify terminal rendering.
  fix                         Show UTF-8 fix commands for your current platform.
  setup                       Show full platform-specific setup guidance.
  run <cmd> [...args]         Run any CLI command with UTF-8 environment applied.
  init-ai [--force] [--dir]   Create CLAUDE.md, GEMINI.md, AGENTS.md Arabic rules.
  output [--file] [--dir]     Create a UTF-8 Markdown file for Arabic output.

Options:
  --dir <path>   Target directory (default: current working directory)
  --file <name>  Output filename for the output command (default: arabic-output.md)
  --force        Overwrite existing files (init-ai only)

Examples:
  acf doctor
  acf verify
  acf test
  acf fix
  acf run claude
  acf run gemini
  acf run node app.js
  acf init-ai
  acf init-ai --force
  acf output --file report.md
`);
}

function runArabicTest() {
  const sep = "─".repeat(50);
  console.log(`\nArabic CLI Fix — Rendering Test`);
  console.log(sep);
  console.log("The lines below should appear as proper Arabic text.");
  console.log("If you see ??? or broken symbols, run: arabic-cli-fix setup\n");

  console.log("  Basic:       مرحباً بالعالم");
  console.log("  Sentence:    هذا اختبار للنص العربي في سطر الأوامر");
  console.log("  Numbers:     ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩ ١٠");
  console.log("  Alphabet:    أ ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي");
  console.log("  Mixed:       Hello مرحباً — World عالم — Test ١٢٣");

  console.log(`\n${sep}`);
  console.log("RTL note: Arabic direction in the terminal depends on your terminal app.");
  console.log("Windows Terminal and iTerm2 support RTL natively.");
  console.log("For guaranteed RTL, write to a Markdown file: acf output");
  console.log("Then open the file in VS Code preview or a browser.\n");
}

function printFixGuide() {
  const platform = os.platform();
  const sep = "─".repeat(50);

  console.log(`\nArabic CLI Fix — Quick Fix`);
  console.log(sep);
  console.log("Run these commands in your current terminal session:\n");

  if (platform === "win32") {
    console.log("  chcp 65001");
    console.log("  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()");
    console.log("  [Console]::InputEncoding  = [System.Text.UTF8Encoding]::new()");
    console.log('  $OutputEncoding = [System.Text.UTF8Encoding]::new()');
    console.log('  $env:LANG = "en_US.UTF-8"');
    console.log('  $env:LC_ALL = "en_US.UTF-8"');
    console.log('  $env:PYTHONIOENCODING = "utf-8"');
    console.log(`\nOr apply all at once by dot-sourcing the bundled script:`);
    console.log(`  . "${path.join(rootDir, "scripts", "windows-utf8.ps1")}"`);
  } else {
    console.log("  export LANG=en_US.UTF-8");
    console.log("  export LC_ALL=en_US.UTF-8");
    console.log("  export PYTHONIOENCODING=utf-8");
    console.log("\nTo persist these, add them to your shell profile (~/.bashrc or ~/.zshrc).");
  }

  console.log(`\n${sep}`);
  console.log("After applying, verify with:");
  console.log("  arabic-cli-fix doctor");
  console.log("  arabic-cli-fix test\n");
}

function printSetupGuide() {
  const platform = os.platform();
  const sep = "─".repeat(50);

  console.log(`\nArabic CLI Fix — Setup Guide`);
  console.log(sep);

  if (platform === "win32") {
    console.log("Recommended Windows stack for Arabic CLI:\n");
    console.log("  1. Windows Terminal  https://aka.ms/terminal");
    console.log("  2. PowerShell 7      https://aka.ms/powershell");
    console.log("  3. Code page 65001   (run: chcp 65001)");
    console.log("  4. Arabic font       Cascadia Code or Noto Sans Arabic\n");
    console.log("Apply temporary UTF-8 settings:");
    console.log("  chcp 65001");
    console.log("  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()");
    console.log("  [Console]::InputEncoding  = [System.Text.UTF8Encoding]::new()");
    console.log('  $env:LANG = "en_US.UTF-8"');
    console.log('  $env:LC_ALL = "en_US.UTF-8"');
    console.log('  $env:PYTHONIOENCODING = "utf-8"');
    console.log(`\nOr dot-source the bundled helper:`);
    console.log(`  . "${path.join(rootDir, "scripts", "windows-utf8.ps1")}"`);
    console.log("\nWindows Terminal RTL:");
    console.log("  Settings > Profile > Appearance > Text direction > Right to left");
  } else {
    console.log("Recommended Unix/macOS setup:\n");
    console.log("  export LANG=en_US.UTF-8");
    console.log("  export LC_ALL=en_US.UTF-8");
    console.log("  export PYTHONIOENCODING=utf-8");
    console.log("\nAdd to your shell profile for persistence:");
    console.log("  echo 'export LANG=en_US.UTF-8' >> ~/.zshrc");
    console.log("  echo 'export LC_ALL=en_US.UTF-8' >> ~/.zshrc");
    console.log("\nTerminals with good Arabic rendering:");
    console.log("  macOS: iTerm2 (with a Noto Sans Arabic font)");
    console.log("  Linux: GNOME Terminal, Kitty, Alacritty");
  }

  console.log(`\n${sep}`);
  console.log("Verify with: arabic-cli-fix doctor");
  console.log("Test with:   arabic-cli-fix test\n");
}

function getTargetDir(args) {
  const value = getOption(args, "--dir");
  return value ? path.resolve(value) : process.cwd();
}

function getOption(args, name) {
  const index = args.indexOf(name);
  if (index === -1) return null;
  return args[index + 1] || null;
}

function printWriteResult(result) {
  console.log(`\nTarget: ${result.targetDir}\n`);
  for (const item of result.items) {
    const icon = item.status === "created" ? "+" : item.status === "updated" ? "~" : "-";
    console.log(`  [${icon}] ${item.status.padEnd(8)}  ${item.file}`);
  }
  console.log();
}

async function runWrappedCommand(args) {
  if (!args.length) {
    console.error("Missing command. Example: arabic-cli-fix run claude");
    process.exitCode = 1;
    return;
  }

  const isWin = os.platform() === "win32";
  const [command, ...commandArgs] = args;

  const env = {
    ...process.env,
    LANG: process.env.LANG || "en_US.UTF-8",
    LC_ALL: process.env.LC_ALL || "en_US.UTF-8",
    PYTHONIOENCODING: "utf-8",
    FORCE_COLOR: process.env.FORCE_COLOR || "1"
  };

  let child;

  if (isWin) {
    const quotedArgs = [command, ...commandArgs].map(quoteArg);
    const cmdLine = quotedArgs.join(" ");
    child = spawn("cmd.exe", ["/c", `chcp 65001 >nul & ${cmdLine}`], {
      stdio: "inherit",
      env
    });
  } else {
    child = spawn(command, commandArgs, {
      stdio: "inherit",
      env
    });
  }

  child.on("error", (err) => {
    console.error(`Failed to start command "${command}": ${err.message}`);
    process.exitCode = 1;
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exitCode = code ?? 0;
  });
}

function quoteArg(arg) {
  if (/[\s"&|<>^()]/.test(arg)) {
    return `"${arg.replace(/"/g, '""')}"`;
  }
  return arg;
}
