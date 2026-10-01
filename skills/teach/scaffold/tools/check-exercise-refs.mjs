/**
 * Every test a lesson page names must exist.
 *
 * A Go course shipped a lesson whose exercise text named four tests that were
 * never in its test files — TestCoalesceReturnsTheSamePointer,
 * TestCloneDoesNotAlias, TestCorrectness, and one that had existed but could
 * not fail — and a fifth in the lesson before it. The learner is told "read
 * TestX first" and there is no TestX. It is mechanical to catch: collect every
 * `Test…` identifier a page mentions and look for `func Test…(` in that
 * lesson's test files.
 *
 * A `-run` pattern gets the same treatment, because a pattern that matches
 * nothing is worse than a wrong name: `go test` prints "[no tests to run]" and
 * exits 0. A data-structures course's page showed `-run 'TestBinarySearch$'`
 * as the way to run one test, in the paragraph warning about exactly that
 * trap; the tests were TestBinarySearchExhaustive and two siblings, so the
 * anchored pattern matched none of them. This check's first run found it.
 *
 *   node tools/check-exercise-refs.mjs                  every lesson
 *   node tools/check-exercise-refs.mjs 4 5              just these
 *   node tools/check-exercise-refs.mjs --root <pattern> override TEST_ROOTS (repeatable)
 *
 * Only Go-style test identifiers are checked. A Vitest `it('…')` name is prose,
 * and a page quoting one is not something this can verify.
 *
 * Not counted as a reference to the exercise's tests: a name the page defines
 * itself in example code (`func TestGreeting(`), a qualified library name
 * (`iotest.TestReader`), the prose placeholder `TestSomething`, and a name
 * written as a prefix (`the three TestHanoi… tests`), which must match the
 * start of some real test. A name that appears only inside a dated correction
 * saying it was removed is reported as retired, not as missing.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Where each lesson's Go tests live, relative to the course root. {nn} is the
// lesson number, two digits. Every *_test.go beneath each root is read, so a
// root may hold one package or a directory of packages. Set this when the
// practice repo is created.
const TEST_ROOTS = ['../go-learning-playground/dsa/lesson{nn}'];

const lessonsDir = 'src/routes/lessons';

/** The page's references to tests that do not exist. */
export function problemsFor(page, have) {
  // A `-run` argument is a regular expression, not a name: it must match at
  // least one test, or `go test` prints "[no tests to run]" and exits 0.
  // Only the part before the first '/' is matched against top-level tests.
  // The flag must start a word ("re-run with" is prose), and '^$' is the
  // idiom for running no tests at all, alongside -bench.
  const runRe = /(?<=[\s>(]|^)-run(?:\s+|=)(?:'([^']+)'|"([^"]+)"|&#39;(.+?)&#39;|([^\s<&'"]+))/g;
  const patterns = [...page.matchAll(runRe)].map((m) => m[1] ?? m[2] ?? m[3] ?? m[4]);
  const badPatterns = [];
  const goodUnanchored = new Set();
  for (const p of new Set(patterns)) {
    if (p === '^$' || p === 'TestSomething') continue;
    let re;
    try {
      re = new RegExp(p.split('/')[0]);
    } catch {
      badPatterns.push(p);
      continue;
    }
    if ([...have].some((t) => re.test(t))) {
      if (/^\w+$/.test(p)) goodUnanchored.add(p);
    } else badPatterns.push(p);
  }
  const prose = page.replace(runRe, ' ');

  const defined = new Set([...prose.matchAll(/\bfunc (Test\w+)\(/g)].map((m) => m[1]));
  const mentions = [...prose.matchAll(/(\.)?\b(Test[A-Z]\w*)\b(…)?/g)].filter((m) => !m[1]);
  const mentioned = new Set(
    mentions
      .filter((m) => !m[3])
      .map((m) => m[2])
      // A prose mention of a string that is also used as a working -run
      // pattern is talking about the pattern ("neither name contains TestX").
      .filter((t) => !defined.has(t) && t !== 'TestSomething' && !goodUnanchored.has(t))
  );
  for (const m of mentions.filter((m) => m[3])) {
    if (![...have].some((t) => t.startsWith(m[2]))) mentioned.add(m[2]);
  }
  const missing = [...mentioned].filter((t) => !have.has(t));
  const retired = missing.filter((t) =>
    new RegExp(`${t}[\\s\\S]{0,400}(removed|could not fail|no longer exists)`).test(page)
  );
  return { mentioned, bad: missing.filter((t) => !retired.includes(t)), retired, badPatterns, patterns };
}

function testFuncs(dir, names = new Set()) {
  if (!existsSync(dir)) return names;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) testFuncs(p, names);
    else if (entry.endsWith('_test.go')) {
      for (const m of readFileSync(p, 'utf8').matchAll(/^func (Test\w+)\(/gm)) names.add(m[1]);
    }
  }
  return names;
}

// ---- the check must still catch what it was written for ----
{
  const page = `Run TestReal first, then TestInvented. func TestExample(t *testing.T) {} ` +
    `uses iotest.TestReader; the TestRea… tests; TestSomething is a placeholder. ` +
    `go test -run 'TestReal$' works, -run TestRead works, and -run 'TestRead$' matches nothing.`;
  const { bad, badPatterns } = problemsFor(page, new Set(['TestReal', 'TestReadAll']));
  if (String(bad) !== 'TestInvented' || String(badPatterns) !== 'TestRead$') {
    console.error(
      `check-exercise-refs: the self-test expected [TestInvented] and [TestRead$], got [${bad}] and [${badPatterns}]`
    );
    process.exit(2);
  }
}

const args = process.argv.slice(2);
const roots = [];
const only = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--root') roots.push(args[++i]);
  else only.push(Number(args[i]));
}
const rootPatterns = roots.length ? roots : TEST_ROOTS;

if (!existsSync(lessonsDir)) {
  console.log('no lessons yet: nothing to check');
  process.exit(0);
}

let problems = 0;
for (const d of readdirSync(lessonsDir).sort()) {
  const n = Number(d.slice(0, 4));
  if (!n || (only.length && !only.includes(n))) continue;
  const page = readFileSync(join(lessonsDir, d, '+page.svelte'), 'utf8');
  const nn = String(n).padStart(2, '0');
  const dirs = rootPatterns.map((p) => p.replaceAll('{nn}', nn));
  const have = new Set();
  for (const dir of dirs) testFuncs(dir, have);
  const { mentioned, bad, retired, badPatterns, patterns } = problemsFor(page, have);
  if (!mentioned.size && !patterns.length) continue;
  if (!have.size) {
    console.log(`FAIL lesson ${n}: the page names tests and there is no *_test.go under ${dirs.join(', ')} — set TEST_ROOTS`);
    problems++;
    continue;
  }
  const failed = bad.length + badPatterns.length;
  console.log(
    `${failed ? 'FAIL' : 'ok  '} lesson ${n}: ${mentioned.size} test names and ${new Set(patterns).size} -run patterns, ` +
      `${have.size} tests in the files` +
      (retired.length ? `, ${retired.length} named only as retired (${retired.join(', ')})` : '')
  );
  for (const t of bad) console.log(`       ${t} is named on the page and is in none of ${dirs.join(', ')}`);
  for (const p of badPatterns) {
    console.log(`       -run '${p}' matches no test: go test would print "[no tests to run]" and exit 0`);
  }
  problems += failed;
}
if (problems) process.exit(1);
