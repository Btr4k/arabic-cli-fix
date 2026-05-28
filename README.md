# Arabic CLI Fix

A cross-platform CLI helper to reduce Arabic encoding, font, and terminal display issues in command-line tools.

It is not tied to a specific model or vendor. It can be used with Claude Code, Gemini CLI, Codex, Node.js, Python, npm scripts, and any other terminal command.

## Problem

Arabic text inside CLI tools may appear as:

- question marks
- replacement characters
- disconnected letters
- reversed text
- broken mixed Arabic/English output

This usually comes from terminal rendering, encoding, font fallback, or weak RTL support. Classic CMD on Windows is especially weak for Arabic output.

## What this tool does

Arabic CLI Fix provides:

- environment inspection through `doctor`
- UTF-8 runtime environment variables through `run`
- platform-specific setup guidance through `setup`
- optional AI instruction files through `init-ai`
- a safe Markdown output workflow for Arabic text

## What this tool does not do

It does not install Claude Code, Gemini CLI, Codex, or any AI tool.

It does not replace the terminal renderer.

It cannot guarantee perfect Arabic shaping inside every terminal, because RTL and Arabic glyph shaping depend on the terminal application itself.

## Installation for local development

```bash
npm install
npm link
```

Then run:

```bash
arabic-cli-fix doctor
```

Short alias:

```bash
acf doctor
```

## Usage

### Inspect your environment

```bash
arabic-cli-fix doctor
```

### See setup guidance

```bash
arabic-cli-fix setup
```

### Run any CLI tool with safer UTF-8 environment variables

```bash
arabic-cli-fix run claude
arabic-cli-fix run gemini
arabic-cli-fix run codex
arabic-cli-fix run node app.js
arabic-cli-fix run python main.py
```

### Create AI rule files

```bash
arabic-cli-fix init-ai
```

This creates:

```text
CLAUDE.md
GEMINI.md
AGENTS.md
```

These files instruct AI CLI tools to avoid printing Arabic directly in the terminal and to write Arabic content to Markdown files instead.

### Create Arabic output file

```bash
arabic-cli-fix output
```

This creates:

```text
arabic-output.md
```

## Recommended Windows setup

Use:

```text
Windows Terminal
PowerShell 7
UTF-8
Arabic-capable font
```

Avoid classic CMD for Arabic-heavy CLI work.

Temporary UTF-8 commands:

```powershell
chcp 65001
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()
$env:LANG = "en_US.UTF-8"
$env:LC_ALL = "en_US.UTF-8"
$env:PYTHONIOENCODING = "utf-8"
```

Bundled helper:

```powershell
./scripts/windows-utf8.ps1
```

## Best practice for Arabic content

For short Arabic output, `arabic-cli-fix run <command>` may be enough.

For long Arabic output, use a Markdown file:

```text
Write Arabic content into arabic-output.md using UTF-8.
Do not print Arabic directly in the terminal.
```

Then review the file inside VS Code or a browser.

## Suggested GitHub description

A simple cross-platform CLI helper to reduce Arabic encoding, font, and terminal display issues.

## License

MIT
