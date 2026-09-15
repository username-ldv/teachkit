// Keeps the "Solution + discussion" code blocks in the lesson pages identical
// to the verified reference solutions in the practice repos.
//
// A lesson page marks a block like this:
//
//   <!-- @solution go dsa/lesson10/write_pointer.go -->
//   <CodeBlock lang="go" label="Go">
//   ...
//   </CodeBlock>
//
// and this script replaces the block's body with the file's solution body:
// for Go, everything after the last "// Narrow to one test" header line; for
// TypeScript, everything after the header doc-comment's closing " */", with
// import lines dropped. The paths are relative to the practice repos, and
// the files are read from tools/solutions/{go,ts}/ — a mirror of the repo
// layout holding the reference solutions (the repos themselves hold stubs).
//
//   node tools/sync-solutions.mjs          # rewrite the pages
//   node tools/sync-solutions.mjs --check  # exit 1 if any page differs
//
// tools/verify-solutions.mjs copies those same files over the repo stubs,
// runs the shipped suites, and restores the stubs — so a page that passes
// --check shows code that was actually compiled and tested. That is the rule
// from the Lesson 9 incident: "the solution on the page" and "the solution
// that was verified" must be the same bytes.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const check = process.argv.includes('--check');
const roots = {
  go: join(import.meta.dirname, 'solutions', 'go'),
  ts: join(import.meta.dirname, 'solutions', 'ts')
};

function goBody(text) {
  const lines = text.split(/\r?\n/);
  let last = -1;
  lines.forEach((l, i) => {
    if (l.startsWith('// Narrow to one test')) last = i;
  });
  if (last < 0) throw new Error('no "// Narrow to one test" header line');
  return trim(lines.slice(last + 1));
}

function tsBody(text) {
  const lines = text.split(/\r?\n/);
  let run = lines.findIndex((l) => l.startsWith(' * Run: npx vitest'));
  if (run < 0) throw new Error('no " * Run: npx vitest" header line');
  let end = lines.findIndex((l, i) => i > run && l.trim() === '*/');
  const body = lines.slice(end + 1).filter((l) => !/^import\b/.test(l));
  return trim(body);
}

function trim(lines) {
  while (lines.length && lines[0].trim() === '') lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  return lines.join('\n') + '\n';
}

const marker =
  /(<!-- @solution (go|ts) (\S+) -->\r?\n\s*<CodeBlock[^>]*>\r?\n)([\s\S]*?)(<\/CodeBlock>)/g;

const lessonsDir = join(import.meta.dirname, '..', 'src', 'routes', 'lessons');
let changed = 0;
let blocks = 0;
for (const dir of readdirSync(lessonsDir)) {
  const page = join(lessonsDir, dir, '+page.svelte');
  let text;
  try {
    text = readFileSync(page, 'utf8');
  } catch {
    continue;
  }
  const out = text.replace(marker, (whole, open, lang, rel, body, close) => {
    blocks++;
    const file = readFileSync(join(roots[lang], rel), 'utf8');
    const want = lang === 'go' ? goBody(file) : tsBody(file);
    if (body !== want) {
      changed++;
      console.log(`${check ? 'DIFFERS' : 'updated'}: ${dir} ← ${rel}`);
    }
    return open + want + close;
  });
  if (!check && out !== text) writeFileSync(page, out);
}
console.log(`${blocks} solution blocks, ${changed} ${check ? 'differ' : 'updated'}`);
if (check && changed) process.exit(1);
