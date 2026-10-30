import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.resolve('src');
const failures = [];
const lineClampOccurrences = [];
const toastCallSites = [];

function recordFailure(file, lineNum, rule, snippet) {
  const relPath = path.relative(process.cwd(), file).replace(/\\/g, '/');
  failures.push({
    file: relPath,
    line: lineNum,
    rule,
    snippet: snippet.trim(),
  });
}

function getAllFiles(dir, exts = ['.js', '.jsx']) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, exts));
    } else if (exts.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

const allSrcFiles = getAllFiles(SRC_DIR);

// Load exported functions from src/utils/messages.js
const messagesPath = path.resolve('src/utils/messages.js');
const messagesCode = fs.readFileSync(messagesPath, 'utf8');
const exportedMessagesFns = new Set(
  [...messagesCode.matchAll(/export\s+function\s+([a-zA-Z0-9_]+)\s*\(/g)].map((m) => m[1])
);

// Helper to extract first argument from balanced parentheses
function extractFirstArgument(code, startIdx) {
  let depth = 0;
  let arg = '';
  for (let i = startIdx; i < code.length; i++) {
    const ch = code[i];
    if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      if (depth === 0) return arg.trim();
      depth--;
    } else if (ch === ',' && depth === 0) {
      return arg.trim();
    }
    arg += ch;
  }
  return arg.trim();
}

// Rule 1: Banned Tailwind default palette classes with numeric shade
const PALETTE_REGEX = /\b(bg|text|border|ring|fill|stroke|from|to|via|divide|outline)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+/;

// Rule 2: Hex or rgb()/rgba() in .jsx files
const HEX_REGEX = /#([0-9a-fA-F]{3,8})\b/;
const RGB_REGEX = /\brgba?\s*\(/;

// Rule 3: Banned tokens: truncate, animate-in, slide-in-from, min-h-screen, NNvh (not dvh)
const TRUNCATE_REGEX = /\btruncate\b/;
const ANIMATE_IN_REGEX = /animate-in/;
const SLIDE_IN_REGEX = /slide-in-from/;
const MIN_H_SCREEN_REGEX = /\bmin-h-screen\b/;
const VH_REGEX = /(?<![a-zA-Z])\d+vh\b/;

// Rule 4: Literal deal_ in user-facing JSX text
const JSX_TEXT_DEAL_REGEX = />[^<]*deal_[^<]*</;

// Rule 5: Hardcoded date literals (only formatters.js and __verify__/ are excluded; mock/ is SCANNED)
const HARDCODED_DATE_REGEX = /new\s+Date\s*\(\s*['"][0-9]{4}|['"][0-9]{4}-[0-9]{2}-[0-9]{2}T/;

// Rule 6: External requests: fetch(, <link (HTML tag, not React Router <Link), url(http
const FETCH_REGEX = /\bfetch\s*\(/;
const HTML_LINK_REGEX = /<link\s+/;
const EXTERNAL_URL_REGEX = /url\s*\(\s*['"]?https?:/;

// Rule 7: Banned arbitrary font sizes below 12px
const ARBITRARY_FONT_SIZE_REGEX = /\btext-\[(\d+)px\]/g;

// Rule 8: Banned line-clamp or truncate in Toast.jsx and NotificationDrawer.jsx
const LINE_CLAMP_OR_TRUNCATE_REGEX = /\b(truncate|line-clamp(?:-\d+)?)\b/;

for (const file of allSrcFiles) {
  const normFile = file.replace(/\\/g, '/');
  const isJsx = normFile.endsWith('.jsx');
  const isDateExcluded = normFile.endsWith('formatters.js') || normFile.includes('/__verify__/');

  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);

  // Line-by-line checks
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const relFile = path.relative(process.cwd(), file).replace(/\\/g, '/');

    // Track remaining line-clamp occurrences across the app
    if (/\bline-clamp(?:-\d+)?\b/.test(line)) {
      lineClampOccurrences.push({
        file: relFile,
        line: lineNum,
        snippet: line.trim(),
      });
    }

    // Check 1: Tailwind palette classes
    if (PALETTE_REGEX.test(line)) {
      recordFailure(file, lineNum, 'No Tailwind default palette classes with numeric shades', line);
    }

    // Check 2: Hex or rgb/rgba in JSX
    if (isJsx) {
      if (HEX_REGEX.test(line)) {
        recordFailure(file, lineNum, 'No raw hex color codes in JSX', line);
      }
      if (RGB_REGEX.test(line)) {
        recordFailure(file, lineNum, 'No raw rgb/rgba in JSX', line);
      }
    }

    // Check 3: Banned classes & units
    if (TRUNCATE_REGEX.test(line)) {
      recordFailure(file, lineNum, 'No "truncate" class (use multiline wrapping / line-clamp)', line);
    }
    if (ANIMATE_IN_REGEX.test(line)) {
      recordFailure(file, lineNum, 'No "animate-in" plugin classes (use pure CSS keyframes)', line);
    }
    if (SLIDE_IN_REGEX.test(line)) {
      recordFailure(file, lineNum, 'No "slide-in-from" plugin classes (use pure CSS keyframes)', line);
    }
    if (MIN_H_SCREEN_REGEX.test(line)) {
      recordFailure(file, lineNum, 'No "min-h-screen" (use min-h-dvh)', line);
    }
    if (VH_REGEX.test(line)) {
      recordFailure(file, lineNum, 'No "vh" units (use dvh)', line);
    }

    // Check 4: Literal deal_ in user-facing text
    if (JSX_TEXT_DEAL_REGEX.test(line)) {
      recordFailure(file, lineNum, 'No raw "deal_" identifiers in user-facing JSX text', line);
    }

    // Check 5: Hardcoded date literals (scans src/mock/** too)
    if (!isDateExcluded && HARDCODED_DATE_REGEX.test(line)) {
      recordFailure(file, lineNum, 'No hardcoded date literals (use relative date helpers)', line);
    }

    // Check 6: External requests
    if (FETCH_REGEX.test(line)) {
      recordFailure(file, lineNum, 'No external requests or fetch()', line);
    }
    if (HTML_LINK_REGEX.test(line)) {
      recordFailure(file, lineNum, 'No external <link> stylesheet tags', line);
    }
    if (EXTERNAL_URL_REGEX.test(line)) {
      recordFailure(file, lineNum, 'No external HTTP/HTTPS assets in url()', line);
    }

    // Check 7: Arbitrary font sizes below 12px (text-[Npx] where N < 12)
    let fsMatch;
    ARBITRARY_FONT_SIZE_REGEX.lastIndex = 0;
    while ((fsMatch = ARBITRARY_FONT_SIZE_REGEX.exec(line)) !== null) {
      const size = parseInt(fsMatch[1], 10);
      if (size < 12) {
        recordFailure(
          file,
          lineNum,
          `No arbitrary font sizes below 12px (found text-[${size}px], minimum is 12px / text-xs)`,
          line
        );
      }
    }

    // Check 8: No truncate or line-clamp in Toast.jsx or NotificationDrawer.jsx
    if (normFile.endsWith('Toast.jsx') || normFile.endsWith('NotificationDrawer.jsx')) {
      if (LINE_CLAMP_OR_TRUNCATE_REGEX.test(line)) {
        recordFailure(file, lineNum, 'No "truncate" or "line-clamp" in Toast.jsx or NotificationDrawer.jsx (messages must wrap)', line);
      }
    }

    // Check 9: safeLocalStorage must never use dynamic seed collection keys
    const BANNED_LOCAL_STORAGE_KEYS_REGEX = /\bsafeLocalStorage\s*\.\s*(?:get|set|remove)\s*\(\s*['"](deals|alerts|messages|documents)['"]/;
    if (BANNED_LOCAL_STORAGE_KEYS_REGEX.test(line)) {
      recordFailure(file, lineNum, 'safeLocalStorage must not access dynamic seed collections ("deals", "alerts", "messages", "documents" belong in safeSessionStorage)', line);
    }

    // Check 10: DealCard.jsx line-clamp constraints (no truncate, no line-clamp-1, line-clamp-2 only on message preview)
    if (normFile.endsWith('DealCard.jsx')) {
      if (/\bline-clamp-1\b/.test(line)) {
        recordFailure(file, lineNum, 'No "line-clamp-1" in DealCard.jsx (address and badge text must wrap)', line);
      }
      if (/\bline-clamp-(?![2]\b)\d+\b/.test(line)) {
        recordFailure(file, lineNum, 'Only "line-clamp-2" allowed in DealCard.jsx on message preview', line);
      }
    }
  });

  // Whole-file check for showToast(...) and setPendingToast(...)
  const toastRegex = /\b(showToast|setPendingToast)\s*\(/g;
  let toastMatch;
  while ((toastMatch = toastRegex.exec(content)) !== null) {
    const fnCalled = toastMatch[1];
    const startIdx = toastMatch.index + toastMatch[0].length;
    const firstArg = extractFirstArgument(content, startIdx);
    const lineNum = content.slice(0, toastMatch.index).split('\n').length;
    const relFile = path.relative(process.cwd(), file).replace(/\\/g, '/');

    // Check if the argument is a call to a function exported by messages.js
    const innerFnMatch = firstArg.match(/^([a-zA-Z0-9_]+)\s*\(/);
    const isMessagesFn = innerFnMatch && exportedMessagesFns.has(innerFnMatch[1]);
    const isBridge = (normFile.endsWith('AppToastBridge.jsx') && firstArg === 'pendingToast') ||
                    (normFile.endsWith('AppContext.jsx') && firstArg === 'null');

    toastCallSites.push({
      file: relFile,
      line: lineNum,
      caller: fnCalled,
      argument: firstArg,
      valid: isMessagesFn || isBridge,
      isBridge,
    });

    if (!isMessagesFn && !isBridge) {
      recordFailure(
        file,
        lineNum,
        `First argument to ${fnCalled}(...) must be a call to a function exported by src/utils/messages.js (got: "${firstArg}")`,
        `${fnCalled}(${firstArg})`
      );
    }
  }
}

console.log('='.repeat(70));
console.log('STATIC CODE AUDIT (scripts/check-static.mjs)');
console.log('='.repeat(70));
console.log('EXCLUSION & PERMISSION RULES:');
console.log('  1. Tailwind Palette: Scanned across ALL src/ files (zero exclusions).');
console.log('  2. Raw Hex / RGB in JSX: Scanned across ALL .jsx files (zero exclusions).');
console.log('  3. Banned Classnames/Units: Scanned across ALL src/ files (zero exclusions).');
console.log('  4. Deal Identifier Leaks: Scanned across ALL user-facing text and toasts.');
console.log('  5. Hardcoded Date Literals: Scanned across ALL files (including src/mock/**). Excludes only formatters.js and __verify__/.');
console.log('  6. External Requests: Scanned across ALL src/ files (zero exclusions).');
console.log('  7. Font Sizes: Any text-[Npx] with N < 12 fails (zero exclusions).');
console.log('  8. Whole-File Toast Rule: First argument to showToast / setPendingToast must be an exported function from messages.js.');
console.log('  9. Toast/Notification Wrapping: Toast.jsx & NotificationDrawer.jsx forbid line-clamp/truncate.');
console.log(' 10. Seed Storage Rule: safeLocalStorage forbidden with "deals", "alerts", "messages", "documents".');
console.log(' 11. DealCard Wrapping: DealCard.jsx forbids truncate and line-clamp-1; line-clamp-2 only on message preview.');
console.log('-'.repeat(70));
console.log(`CHECKED TOAST CALL SITES (${toastCallSites.length} total call sites verified):`);
toastCallSites.forEach((site, idx) => {
  const badge = site.isBridge ? '[REACT CONTEXT BRIDGE]' : '[messages.js FUNCTION CALL]';
  console.log(`  [${idx + 1}] ${site.file}:${site.line} -> ${site.caller}(${site.argument}) ${badge}`);
});
console.log('-'.repeat(70));
console.log(`REMAINING LINE-CLAMP OCCURRENCES (${lineClampOccurrences.length} total across app):`);
lineClampOccurrences.forEach((item, idx) => {
  console.log(`  [${idx + 1}] ${item.file}:${item.line}`);
  console.log(`      ${item.snippet}`);
});
console.log('='.repeat(70));

if (failures.length === 0) {
  console.log(`[PASS] Scanned ${allSrcFiles.length} files across src/. Zero rule violations found.`);
  console.log('='.repeat(70));
  process.exit(0);
} else {
  console.error(`[FAIL] Found ${failures.length} rule violation(s):\n`);
  failures.forEach((f, i) => {
    console.error(`[${i + 1}] ${f.file}:${f.line} -> ${f.rule}`);
    console.error(`    Snippet: ${f.snippet}\n`);
  });
  console.log('='.repeat(70));
  process.exit(1);
}
