import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SAMPLES = [
  { label: "Basic Arabic",  text: "مرحباً بالعالم" },
  { label: "Numbers",       text: "١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩ ١٠" },
  { label: "Diacritics",    text: "الْعَرَبِيَّة" },
  { label: "Mixed",         text: "Hello مرحباً — Test ١٢٣" },
];

export function runVerify() {
  const sep = "─".repeat(50);
  const tmpFile = path.join(os.tmpdir(), `acf-verify-${Date.now()}.txt`);
  let allPassed = true;

  console.log(`\nArabic CLI Fix — UTF-8 Roundtrip Verify`);
  console.log(sep);

  for (const { label, text } of SAMPLES) {
    try {
      fs.writeFileSync(tmpFile, text, "utf8");
      const readBack = fs.readFileSync(tmpFile, "utf8");
      const expectedBytes = Buffer.byteLength(text, "utf8");
      const actualBytes = fs.statSync(tmpFile).size;

      const textOk = readBack === text;
      const bytesOk = expectedBytes === actualBytes;
      const passed = textOk && bytesOk;

      if (!passed) allPassed = false;

      const icon = passed ? "OK  " : "FAIL";
      console.log(`  ${icon}  ${label.padEnd(16)} ${expectedBytes} bytes`);
    } catch (err) {
      allPassed = false;
      console.log(`  ERR   ${label.padEnd(16)} ${err.message}`);
    } finally {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }

  console.log(sep);

  if (allPassed) {
    console.log("  Result: OK — Arabic UTF-8 roundtrip verified");
    console.log("  Note:   terminal rendering is separate — use `acf output` for display.\n");
  } else {
    console.log("  Result: FAIL — encoding issues detected.");
    console.log("  Run:    acf doctor  for diagnosis.\n");
    process.exitCode = 1;
  }
}
