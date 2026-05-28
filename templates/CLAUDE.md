# Arabic CLI Rules — Claude Code

## Terminal Output
- Use English for all terminal output, status messages, and log lines.
- Never print Arabic text directly in the terminal or CLI interface.
- Never mix Arabic and English on the same terminal line.
- Never output Arabic inside fenced code blocks printed to the terminal.

## Writing Arabic Content
When Arabic content is required:
1. Write it to `arabic-output.md` (UTF-8) unless the user specifies a different file.
2. Wrap Arabic sections in `<div dir="rtl">` HTML so they render right-to-left in VS Code and browsers.
3. After writing, confirm with a short English message: `Written: arabic-output.md`

## Markdown structure for Arabic files
```
<div dir="rtl">

المحتوى العربي هنا.

</div>
```

## Code, JSON, and Structured Data
- Code comments: use English unless the user explicitly requests Arabic.
- JSON or YAML with Arabic values: write the full structure to a file, do not print it in the terminal.
- Do not output Arabic inside inline code spans in the terminal.

## Reason
Many terminals — especially on Windows — do not fully support Arabic shaping, RTL direction,
or bidirectional text rendering. Printing Arabic directly causes garbled output: disconnected
letters, reversed text, replacement characters, or question marks. Writing to a UTF-8
Markdown file and reviewing in VS Code preview or a browser guarantees correct display.
