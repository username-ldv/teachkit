// Proves that the reference solutions in tools/solutions/ pass the shipped
// test suites in the practice repos — which, together with
// sync-solutions.mjs --check, proves that the code printed on the lesson
// pages is code that was compiled and run against the tests the learner has.
//
//   node tools/verify-solutions.mjs            # lessons that have solutions
//   node tools/verify-solutions.mjs 10 12      # only these lesson numbers
//
// For each lesson: back up the repo's stub files, copy the solutions over
// them, run `go test -tags lessonNN` and an un-skipped copy of every Vitest
// spec, then restore the stubs — always, even when a suite fails. The repos
// are left exactly as they were found.

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const here = import.meta.dirname;
const goRepo = join(here, '..', '..', 'go-learning-playground');
const tsRepo = join(here, '..', '..', 'svelte-learning-playground');
const goSolutions = join(here, 'solutions', 'go', 'dsa');
const tsSolutions = join(here, 'solutions', 'ts', 'src', 'dsa');

const wanted = process.argv.slice(2).map(Number);
const lessons = readdirSync(goSolutions)
  .map((d) => Number(d.replace('lesson', '')))
  .filter((n) => !wanted.length || wanted.includes(n))
  .sort((a, b) => a - b);

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, shell: process.platform === 'win32', encoding: 'utf8' });
  return { ok: r.status === 0, out: (r.stdout ?? '') + (r.stderr ?? '') };
}

let failed = 0;
for (const n of lessons) {
  const nn = String(n).padStart(2, '0');
  const goDir = join(goRepo, 'dsa', `lesson${nn}`);
  const tsDirName = readdirSync(tsSolutions).find((d) => d.startsWith(`lesson-${nn}-`));
  const tsDir = join(tsRepo, 'src', 'dsa', tsDirName);

  const backups = new Map();
  const verifySpecs = [];
  const swapIn = (srcDir, dstDir, ext) => {
    for (const f of readdirSync(srcDir).filter((f) => f.endsWith(ext))) {
      const dst = join(dstDir, f);
      backups.set(dst, existsSync(dst) ? readFileSync(dst) : null);
      writeFileSync(dst, readFileSync(join(srcDir, f)));
    }
  };

  try {
    swapIn(join(goSolutions, `lesson${nn}`), goDir, '.go');
    swapIn(join(tsSolutions, tsDirName), tsDir, '.ts');
    for (const f of readdirSync(tsDir).filter((f) => f.endsWith('.spec.ts'))) {
      const copy = join(tsDir, f.replace(/\.spec\.ts$/, '.verify.spec.ts'));
      writeFileSync(copy, readFileSync(join(tsDir, f), 'utf8').replace(/describe\.skip\(/g, 'describe('));
      verifySpecs.push(copy);
    }

    const go = run('go', ['test', '-count=1', `-tags=lesson${nn}`, `./dsa/lesson${nn}`], goRepo);
    const ts = run('npx', ['vitest', 'run', join('src', 'dsa', tsDirName)], tsRepo);
    const tsSummary = (ts.out.match(/Tests\s+.*$/m) ?? [ts.out.slice(-300)])[0].trim();
    console.log(`lesson ${nn}  go: ${go.ok ? 'ok' : 'FAIL'}  ts: ${ts.ok ? 'ok' : 'FAIL'}  (${tsSummary})`);
    if (!go.ok) console.log(go.out.split('\n').filter((l) => /FAIL|---/.test(l)).join('\n'));
    if (!ts.ok) console.log(ts.out.split('\n').filter((l) => /×|FAIL|Error/.test(l)).slice(0, 20).join('\n'));
    if (!go.ok || !ts.ok) failed++;
  } finally {
    for (const [dst, content] of backups) {
      if (content === null) unlinkSync(dst);
      else writeFileSync(dst, content);
    }
    for (const f of verifySpecs) if (existsSync(f)) unlinkSync(f);
  }
}

// After restoring, the stubs must still be in place: the sync check reads
// tools/solutions, not the repos, so it is unaffected either way.
console.log(failed ? `${failed} lesson(s) FAILED` : `all ${lessons.length} lesson(s) verified; stubs restored`);
process.exit(failed ? 1 : 0);
