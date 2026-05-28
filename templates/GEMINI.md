# Arabic CLI Rules — Gemini CLI

## Terminal Output
- Use English for all terminal output and status messages.
- Never print Arabic text directly in the terminal.
- Never mix Arabic and English on the same terminal line.

## Writing Arabic Content
When Arabic content is required:
1. Write it to `arabic-output.md` (UTF-8) unless the user specifies otherwise.
2. Wrap Arabic sections in `<div dir="rtl">` HTML for correct right-to-left display.
3. Confirm with a short English line: `Written: arabic-output.md`

## Markdown structure for Arabic files
```
<div dir="rtl">

المحتوى العربي هنا.

</div>
```

## Reason
Terminal Arabic rendering is unreliable — RTL direction, glyph shaping, and mixed
bidirectional text all depend on the terminal application. A UTF-8 Markdown file
reviewed in VS Code or a browser is the only reliable way to display Arabic content.
