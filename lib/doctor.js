import { execSync } from "node:child_process";
import os from "node:os";

export function buildDoctorReport() {
  const env = process.env;
  const platform = os.platform();
  const shell = detectShell(platform, env);
  const terminal = detectTerminal(env);
  const codePage = detectCodePage(platform);
  const stdoutEncoding = process.stdout.encoding || "unknown";

  return {
    platform,
    release: os.release(),
    node: process.version,
    terminal,
    shell,
    vscode: env.TERM_PROGRAM === "vscode",
    windowsTerminal: Boolean(env.WT_SESSION),
    codePage,
    stdoutEncoding,
    lang: env.LANG || "not set",
    lcAll: env.LC_ALL || "not set",
    pythonIoEncoding: env.PYTHONIOENCODING || "not set",
    ci: Boolean(env.CI),
    warnings: buildWarnings(platform, env, shell, codePage),
    recommendations: buildRecommendations(platform, env, shell)
  };
}

function detectShell(platform, env) {
  if (platform === "win32") {
    const psModule = env.PSModulePath || "";
    const comspec = (env.ComSpec || "").toLowerCase();
    if (psModule.toLowerCase().includes("powershell")) return "powershell";
    if (comspec.includes("cmd.exe")) return "cmd";
    return comspec || "unknown";
  }
  return env.SHELL || "unknown";
}

function detectTerminal(env) {
  if (env.WT_SESSION) return "Windows Terminal";
  if (env.TERM_PROGRAM === "vscode") return "VS Code";
  if (env.TERM_PROGRAM === "iTerm.app") return "iTerm2";
  if (env.TERM_PROGRAM) return env.TERM_PROGRAM;
  if (env.TERM) return env.TERM;
  return "unknown";
}

function detectCodePage(platform) {
  if (platform !== "win32") return null;
  try {
    const out = execSync("chcp", { encoding: "utf8", timeout: 2000, stdio: ["ignore", "pipe", "ignore"] });
    const match = out.match(/:\s*(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  } catch {
    return null;
  }
}

const MINIMAL_LOCALES = /^(c|posix)(\.utf-?8)?$/i;

function buildWarnings(platform, env, shell, codePage) {
  const warnings = [];

  if (platform === "win32") {
    if (shell === "cmd") {
      warnings.push("CMD detected — CMD has very weak Arabic, Unicode, and RTL support. Switch to PowerShell 7.");
    }
    if (codePage !== null && codePage !== 65001) {
      warnings.push(`Active code page is ${codePage}, not UTF-8 (65001). Run: chcp 65001`);
    }
    if (!env.WT_SESSION && env.TERM_PROGRAM !== "vscode") {
      warnings.push("Windows Terminal not detected. Classic terminals have limited Arabic and RTL rendering.");
    }
  }

  if (!env.LANG && platform !== "win32") {
    warnings.push("LANG is not set. UTF-8 locale may not be active.");
  }
  if (env.LANG && !env.LANG.toLowerCase().includes("utf")) {
    warnings.push(`LANG="${env.LANG}" does not use UTF-8.`);
  }
  if (env.LANG && MINIMAL_LOCALES.test(env.LANG)) {
    warnings.push(`LANG="${env.LANG}" is a minimal locale. Arabic text processing may be incomplete. Use en_US.UTF-8 or ar_SA.UTF-8.`);
  }
  if (env.LC_ALL && !env.LC_ALL.toLowerCase().includes("utf")) {
    warnings.push(`LC_ALL="${env.LC_ALL}" does not use UTF-8.`);
  }
  if (!env.PYTHONIOENCODING) {
    warnings.push("PYTHONIOENCODING is not set — Python CLI tools may emit non-UTF-8 output.");
  }

  return warnings;
}

function buildRecommendations(platform, env, shell) {
  const recs = [];
  const langIsUtf8 = (env.LANG || "").toLowerCase().includes("utf");
  const lcAllIsUtf8 = (env.LC_ALL || "").toLowerCase().includes("utf");
  const inVscode = env.TERM_PROGRAM === "vscode";
  const langIsMinimal = MINIMAL_LOCALES.test(env.LANG || "");

  if (platform === "win32") {
    if (!env.WT_SESSION && env.TERM_PROGRAM !== "vscode") {
      recs.push("Use Windows Terminal — it has the best Arabic shaping and RTL support on Windows.");
    }
    if (shell !== "powershell") {
      recs.push("Use PowerShell 7 (pwsh) instead of classic CMD or Windows PowerShell 5.");
    }
    recs.push("Run `chcp 65001` before starting any Arabic CLI session.");
    recs.push("Install a font with Arabic coverage: Cascadia Code + Noto Sans Arabic fallback.");
    if (env.WT_SESSION) {
      recs.push("In Windows Terminal: Settings > Profile > Appearance > set a font that supports Arabic.");
    }
  } else {
    if (!langIsUtf8) {
      recs.push("Set LANG=en_US.UTF-8 in your shell profile (.bashrc / .zshrc).");
    } else if (langIsMinimal) {
      recs.push("Replace LANG=C.UTF-8 with LANG=en_US.UTF-8 for full Arabic text support.");
    }
    if (!lcAllIsUtf8) {
      recs.push("Set LC_ALL=en_US.UTF-8 in your shell profile (.bashrc / .zshrc).");
    }
    if (!inVscode) {
      recs.push("Use a terminal with Arabic shaping support: VS Code, iTerm2, GNOME Terminal, or Kitty.");
    }
  }

  if (!env.PYTHONIOENCODING) {
    recs.push("Set PYTHONIOENCODING=utf-8 to ensure Python tools output UTF-8 correctly.");
  }

  recs.push("Run `acf run <command>` to launch tools with UTF-8 environment applied.");
  recs.push("Run `acf test` to verify Arabic rendering in your terminal.");
  recs.push("Run `acf init-ai` to create Arabic-safe rules for Claude Code, Gemini, and Codex.");

  return recs;
}

export function printDoctorReport(report) {
  const line = "─".repeat(50);

  console.log(`\nArabic CLI Fix — Environment Report`);
  console.log(line);
  console.log(`Platform          ${report.platform} ${report.release}`);
  console.log(`Node.js           ${report.node}`);
  console.log(`Terminal          ${report.terminal}`);
  console.log(`Shell             ${report.shell}`);
  console.log(`VS Code Terminal  ${report.vscode ? "yes" : "no"}`);
  console.log(`Windows Terminal  ${report.windowsTerminal ? "yes" : "no"}`);

  if (report.codePage !== null) {
    const cpStatus = report.codePage === 65001 ? "(UTF-8 — OK)" : "(not UTF-8 — run: chcp 65001)";
    console.log(`Code Page         ${report.codePage} ${cpStatus}`);
  }

  console.log(`stdout encoding   ${report.stdoutEncoding}`);
  console.log(`LANG              ${report.lang}`);
  console.log(`LC_ALL            ${report.lcAll}`);
  console.log(`PYTHONIOENCODING  ${report.pythonIoEncoding}`);
  console.log(`CI environment    ${report.ci ? "yes" : "no"}`);
  console.log(line);

  if (report.warnings.length === 0) {
    console.log("Status            OK — no issues found\n");
  } else {
    console.log(`Status            ${report.warnings.length} warning(s) found\n`);
    console.log("Warnings:");
    for (const w of report.warnings) console.log(`  ! ${w}`);
    console.log();
  }

  console.log("Recommendations:");
  for (const r of report.recommendations) console.log(`  * ${r}`);
  console.log();
}
