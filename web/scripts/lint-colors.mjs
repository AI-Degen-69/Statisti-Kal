import { readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, 'src');
const EXTS = ['.tsx', '.ts', '.css'];

function walk(dir, files = []) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) walk(p, files);
    else if (EXTS.includes(extname(f.name))) files.push(p);
  }
  return files;
}

const COLOR_PATTERNS = [
  /\bslate-\d{2,3}\b/g,
  /\bgray-\d{2,3}\b/g,
  /\bzinc-\d{2,3}\b/g,
  /text-\[\s*[\d.]+\s*px\s*\]/g,
  /border-\w+-\d{2,3}/g,  // catches border-slate-800 etc.
];

const RAW_HEX_PATTERN = /(?<![A-Za-z0-9_-])#[0-9A-Fa-f]{3,8}\b/g;

let violations = 0;
const allFiles = walk(SRC_DIR);

for (const f of allFiles) {
  const content = readFileSync(f, 'utf8');
  for (const re of COLOR_PATTERNS) {
    let m;
    while ((m = re.exec(content)) !== null) {
      console.error(`${f}:${content.slice(0, m.index).split('\n').length}:${m[0]}`);
      violations++;
    }
  }

  if (['.ts', '.tsx'].includes(extname(f))) {
    const withoutComments = content
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\\textcolor\{#[0-9A-Fa-f]{3,8}\}/g, '\\textcolor{TOKEN}');
    let m;
    while ((m = RAW_HEX_PATTERN.exec(withoutComments)) !== null) {
      console.error(`${f}:${withoutComments.slice(0, m.index).split('\n').length}:${m[0]}`);
      violations++;
    }
  }
}

if (violations > 0) {
  console.error(`\nlint-colors: ${violations} violation(s) in ${allFiles.length} file(s)`);
  process.exit(1);
} else {
  console.log(`lint-colors: OK (${allFiles.length} files scanned, 0 violations)`);
}
