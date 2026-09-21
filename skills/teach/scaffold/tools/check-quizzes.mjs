#!/usr/bin/env node
// Guards the ways a <Question> can give its answer away, or can break.
//
// <Question> reshuffles its options on every page load, so the authored order
// is not what the learner sees. Two consequences this checks:
//
//   1. An explanation that says "the third option" is now wrong. Name the
//      option by what it says instead — or pass shuffle={false} if the order
//      genuinely has to hold still.
//   2. Options that only make sense in a fixed order ("all of the above")
//      must say shuffle={false}.
//
// It also keeps the older rule that a correct option must not be the longest:
// length is the tell the shuffle cannot fix.
//
// Run: node tools/check-quizzes.mjs   (reads source; no server needed)
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';

const OPTIONS = /options=\{\[([\s\S]*?)\]\}/;
const ANSWER = /answer=\{(\d+)\}/;
const NO_SHUFFLE = /shuffle=\{false\}/;

const ORDINAL = '(?:first|second|third|fourth|fifth|last|final|top|bottom|middle)';

/** Names an option by where it sits. Unambiguous, so these fail. */
const POSITIONAL = [
  new RegExp(`\\b(?:the\\s+)?${ORDINAL}\\s+(?:two|three|four)?\\s*(?:option|answer|choice)s?\\b`, 'i'),
  /\boption\s+(?:one|two|three|four|five|\d)\b/i
];

/**
 * A bare ordinal — "the last one", "the first three". Often an option, but
 * just as often two recursive calls or two worked examples, so it warns
 * rather than fails and a human decides.
 */
const MAYBE_POSITIONAL = new RegExp(`\\b(?:the\\s+)?${ORDINAL}\\s+(?:two|three|four|one|ones)\\b`, 'i');

/** Option text that only works if the order never changes. */
const ORDER_BOUND = /\b(?:all|none|both|either|any)\s+of\s+the\s+(?:above|others|other)\b/i;

/** Split an options array body into its element source texts. */
function splitElements(body) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') quote = ch;
    else if ('[({'.includes(ch)) depth++;
    else if ('])}'.includes(ch)) depth--;
    else if (ch === ',' && depth === 0) {
      parts.push(body.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(body.slice(start));
  return parts.map((p) => p.trim().replace(/^['"`]|['"`]$/g, ''));
}

/**
 * Every <Question> in a file: its attribute text, its explanation, and the
 * line it starts on. The tag is scanned rather than matched, because `>`
 * appears inside attribute values (`x >>= 1`, `len(name) > 20`) and would
 * end the tag too early.
 */
function questions(src) {
  const found = [];
  for (const open of src.matchAll(/<Question\b/g)) {
    let i = open.index + open[0].length;
    let quote = null;
    let depth = 0;
    for (; i < src.length; i++) {
      const ch = src[i];
      if (quote) {
        if (ch === '\\') i++;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === '`') quote = ch;
      else if (ch === '{') depth++;
      else if (ch === '}') depth--;
      else if (ch === '>' && depth === 0) break;
    }
    const close = src.indexOf('</Question>', i);
    found.push({
      line: src.slice(0, open.index).split('\n').length,
      attrs: src.slice(open.index + open[0].length, i),
      body: close === -1 ? '' : src.slice(i, close)
    });
  }
  return found;
}

/** Strip tags and entities so prose can be pattern-matched. */
function plain(html) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ');
}

const problems = [];
const warnings = [];
let total = 0;

for (const file of globSync('src/routes/**/+page.svelte').sort()) {
  const src = readFileSync(file, 'utf8');
  const short = file.replace(/\\/g, '/').replace('src/routes/', '');
  for (const item of questions(src)) {
    const where = `${short}:${item.line}`;
    const opts = OPTIONS.exec(item.attrs);
    const ans = ANSWER.exec(item.attrs);
    if (!opts || !ans) {
      problems.push(`${where}: <Question> has no options/answer pair`);
      continue;
    }
    total++;
    const options = splitElements(opts[1]);
    const answer = Number(ans[1]);
    const frozen = NO_SHUFFLE.test(item.attrs);

    if (answer >= options.length) {
      problems.push(`${where}: answer={${answer}} is out of range`);
    }

    if (!frozen) {
      const prose = plain(item.body);
      const hit = POSITIONAL.map((rx) => rx.exec(prose)).find(Boolean);
      if (hit) {
        problems.push(
          `${where}: the explanation says “${hit[0].trim()}” — the options are shuffled, ` +
            `so name the option by what it says`
        );
      } else {
        const soft = MAYBE_POSITIONAL.exec(prose);
        if (soft) {
          warnings.push(
            `${where}: the explanation says “${soft[0].trim()}” — check it means something other ` +
              `than an option's position`
          );
        }
      }
      const bound = options.find((o) => ORDER_BOUND.test(plain(o)));
      if (bound) {
        problems.push(`${where}: option “${bound.slice(0, 40)}…” needs shuffle={false}`);
      }
    }

    const correct = options[answer] ?? '';
    const lengths = options.map((o) => plain(o).trim().length);
    const mine = plain(correct).trim().length;
    const runnerUp = Math.max(...lengths.filter((_, i) => i !== answer));
    if (mine > runnerUp && mine - runnerUp >= 8) {
      warnings.push(
        `${where}: the correct option is ${mine - runnerUp} characters longer than every ` +
          `distractor — length is a tell the shuffle cannot fix`
      );
    }
  }
}

console.log(`${total} questions checked`);
for (const w of warnings) console.log(`warn  ${w}`);
if (problems.length) {
  for (const p of problems) console.error(`FAIL  ${p}`);
  process.exit(1);
}
console.log('ok');
