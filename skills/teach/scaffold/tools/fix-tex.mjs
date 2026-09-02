/**
 * TeX props are JS string literals, so a control sequence needs its backslash
 * doubled ('\\alpha', not '\alpha' — which JS reads as an escape and silently
 * turns into a bell character). This pass repairs the backslashes inside
 * <Derivation> and <Math> tags.
 *
 * Every backslash in these props starts a TeX control sequence, and a course
 * page never needs TeX's own `\\` line break, so any run of backslashes
 * becomes exactly two. That is what keeps the pass idempotent — an earlier
 * version used a negative lookahead and turned `\\dots` into `\\\dots` on the
 * second run.
 *
 * Usage:  node tools/fix-tex.mjs
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const TEX_TAG = /<(?:Derivation|Math)\b[\s\S]*?\/>/g;
const BACKSLASH_RUN = /\\+/g;
const BS2 = '\\'.repeat(2);

function* pages(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* pages(path);
    else if (entry === '+page.svelte') yield path;
  }
}

let total = 0;
for (const page of pages('src/routes')) {
  const src = readFileSync(page, 'utf8');
  let fixed = 0;
  const out = src.replace(TEX_TAG, (tag) => {
    const next = tag.replace(BACKSLASH_RUN, BS2);
    if (next !== tag) fixed++;
    return next;
  });
  if (out !== src) {
    writeFileSync(page, out);
    console.log(`${page}: ${fixed} TeX block(s) escaped`);
    total += fixed;
  }
}
console.log(`total: ${total}`);
