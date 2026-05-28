import fs from "node:fs";
import path from "node:path";

const AI_RULES = {
  "CLAUDE.md": `# Arabic CLI Rules — Claude Code

## Terminal Output
- Use English for all terminal output, status messages, and log lines.
- Never print Arabic text directly in the terminal or CLI interface.
- Never mix Arabic and English on the same terminal line.
- Never output Arabic inside fenced code blocks printed to the terminal.

## Writing Arabic Content
When Arabic content is required:
1. Write it to \`arabic-output.md\` (UTF-8) unless the user specifies a different file.
2. Wrap Arabic sections in \`<div dir="rtl">\` HTML so they render right-to-left in VS Code and browsers.
3. After writing, confirm with a short English message: \`Written: arabic-output.md\`

## Markdown structure for Arabic files
\`\`\`
<div dir="rtl">

المحتوى العربي هنا.

</div>
\`\`\`

## Code, JSON, and Structured Data
- Code comments: use English unless the user explicitly requests Arabic.
- JSON or YAML with Arabic values: write the full structure to a file, do not print it in the terminal.
- Do not output Arabic inside inline code spans in the terminal.

## Reason
Many terminals — especially on Windows — do not fully support Arabic shaping, RTL direction,
or bidirectional text rendering. Printing Arabic directly causes garbled output: disconnected
letters, reversed text, replacement characters, or question marks. Writing to a UTF-8
Markdown file and reviewing in VS Code preview or a browser guarantees correct display.
`,

  "GEMINI.md": `# Arabic CLI Rules — Gemini CLI

## Terminal Output
- Use English for all terminal output and status messages.
- Never print Arabic text directly in the terminal.
- Never mix Arabic and English on the same terminal line.

## Writing Arabic Content
When Arabic content is required:
1. Write it to \`arabic-output.md\` (UTF-8) unless the user specifies otherwise.
2. Wrap Arabic sections in \`<div dir="rtl">\` HTML for correct right-to-left display.
3. Confirm with a short English line: \`Written: arabic-output.md\`

## Markdown structure for Arabic files
\`\`\`
<div dir="rtl">

المحتوى العربي هنا.

</div>
\`\`\`

## Reason
Terminal Arabic rendering is unreliable — RTL direction, glyph shaping, and mixed
bidirectional text all depend on the terminal application. A UTF-8 Markdown file
reviewed in VS Code or a browser is the only reliable way to display Arabic content.
`,

  "AGENTS.md": `# Arabic CLI Rules — AI Agents

## Terminal Output
- Use English for all terminal output, logs, and status messages.
- Never print Arabic text directly in any CLI or terminal interface.
- Never mix Arabic and English on the same terminal line.

## Writing Arabic Content
When Arabic content is needed:
1. Save it to \`arabic-output.md\` (UTF-8) unless a different file is requested.
2. Wrap Arabic content in \`<div dir="rtl">\` HTML for right-to-left rendering.
3. After writing, print only the file path in English.

## Markdown structure for Arabic files
\`\`\`
<div dir="rtl">

المحتوى العربي هنا.

</div>
\`\`\`

## Reason
Arabic requires right-to-left shaping, Unicode bidirectional processing, and proper font
fallback. Most CLI terminals — especially on Windows — do not meet all three requirements.
Writing to a UTF-8 Markdown file protects Arabic text from encoding issues, broken glyphs,
disconnected letters, and incorrect directionality.
`
};

const ARABIC_OUTPUT_TEMPLATE = `# Arabic Output

<div dir="rtl">

اكتب المحتوى العربي هنا.

يمكنك طلب من أداة الذكاء الاصطناعي تحديث هذا الملف مباشرة بترميز UTF-8.

</div>
`;

export function writeAiRuleFiles(targetDir, force = false) {
  fs.mkdirSync(targetDir, { recursive: true });
  const items = [];

  for (const [file, content] of Object.entries(AI_RULES)) {
    const filePath = path.join(targetDir, file);
    const exists = fs.existsSync(filePath);

    if (!force && exists) {
      items.push({ file, status: "skipped" });
      continue;
    }

    fs.writeFileSync(filePath, content, "utf8");
    items.push({ file, status: exists ? "updated" : "created" });
  }

  return { targetDir, items };
}

export function writeArabicOutputFile(targetDir, filename = "arabic-output.md") {
  fs.mkdirSync(targetDir, { recursive: true });
  const safeName = filename.endsWith(".md") ? filename : `${filename}.md`;
  const filePath = path.join(targetDir, safeName);

  if (fs.existsSync(filePath)) {
    return { targetDir, items: [{ file: safeName, status: "skipped" }] };
  }

  fs.writeFileSync(filePath, ARABIC_OUTPUT_TEMPLATE, "utf8");
  return { targetDir, items: [{ file: safeName, status: "created" }] };
}
