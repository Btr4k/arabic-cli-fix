# Arabic CLI Rules — AI Agents

## Terminal Output
- Use English for all terminal output, logs, and status messages.
- Never print Arabic text directly in any CLI or terminal interface.
- Never mix Arabic and English on the same terminal line.

## Writing Arabic Content
When Arabic content is needed:
1. Save it to `arabic-output.md` (UTF-8) unless a different file is requested.
2. Wrap Arabic content in `<div dir="rtl">` HTML for right-to-left rendering.
3. After writing, print only the file path in English.

## Markdown structure for Arabic files
```
<div dir="rtl">

المحتوى العربي هنا.

</div>
```

## Reason
Arabic requires right-to-left shaping, Unicode bidirectional processing, and proper font
fallback. Most CLI terminals — especially on Windows — do not meet all three requirements.
Writing to a UTF-8 Markdown file protects Arabic text from encoding issues, broken glyphs,
disconnected letters, and incorrect directionality.
