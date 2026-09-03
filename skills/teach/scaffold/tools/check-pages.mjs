/**
 * Crawl every route of a running course and assert nothing is broken.
 *
 * Starts at `/`, follows every same-origin link it finds, and for each page
 * reports the counts that matter (figures, highlighted code blocks, quizzes,
 * maths, SVG) plus anything that should never reach a reader:
 *
 *   - a non-200 status, or a link to a page that does not exist
 *   - a `#fragment` whose target id is missing
 *   - an unreplaced authoring marker
 *   - a KaTeX parse error
 *   - box-drawing characters, i.e. ASCII art that should have been a diagram
 *   - a Svelte brace escape that leaked into visible text
 *
 * This is the check that covers lesson pages, which tsconfig.json excludes
 * from `svelte-check` (the reason is written out there).
 *
 * Usage:  node tools/check-pages.mjs [baseUrl]
 */

const base = (process.argv[2] ?? 'http://127.0.0.1:8321').replace(/\/$/, '');

/** Routes to visit even if nothing links to them. */
const EXTRA_ROOTS = ['/dev/diagrams'];

const count = (html, re) => (html.match(re) ?? []).length;

// Svelte appends a scope class when a component has its own <style>, so every
// class match has to tolerate other classes around it.
const cls = (name) => new RegExp(`class="(?:[^"]* )?${name}(?:[ "])`, 'g');

const BOX_DRAWING = /[─-╿]/;

/** Same-origin, non-asset links out of one page. */
function linksIn(html, from) {
  const out = [];
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const raw = m[1];
    if (/^(https?:|mailto:|tel:|#|data:)/.test(raw)) {
      if (raw.startsWith('#')) out.push({ path: from, hash: raw.slice(1) });
      continue;
    }
    if (!raw.startsWith('/')) continue;
    if (/\.(svg|png|jpg|jpeg|webp|ico|css|js|json|woff2?)$/.test(raw)) continue;
    const [path, hash] = raw.split('#');
    out.push({ path: path.replace(/\/$/, '') || '/', hash });
  }
  return out;
}

const pages = new Map(); // path -> html
const queue = ['/', ...EXTRA_ROOTS];
const seen = new Set(queue);
const wanted = []; // {path, hash, from}
let failed = 0;
const fail = (route, msg) => {
  failed++;
  console.log(`FAIL ${route}\n     ${msg}`);
};

while (queue.length) {
  const route = queue.shift();
  let res, html;
  try {
    res = await fetch(base + route);
    html = await res.text();
  } catch (err) {
    fail(route, `${err.message} — is the server running? (npm run dev)`);
    continue;
  }
  if (!res.ok) {
    fail(route, `HTTP ${res.status}`);
    continue;
  }
  pages.set(route, html);

  for (const link of linksIn(html, route)) {
    wanted.push({ ...link, from: route });
    if (!seen.has(link.path)) {
      seen.add(link.path);
      queue.push(link.path);
    }
  }
}

for (const [route, html] of pages) {
  const problems = [];
  if (/@@[A-Z]/.test(html)) problems.push('unreplaced authoring marker (@@…)');
  if (html.includes('katex-error')) problems.push('KaTeX parse error');
  if (BOX_DRAWING.test(html)) problems.push('box-drawing characters — ASCII art, make it a diagram');
  if (/&amp;#12[35];/.test(html)) problems.push('double-escaped brace in text');
  // An entity written inside a {…} expression prop is escaped rather than
  // decoded, so it reaches the reader as literal "&rsquo;" text.
  const ent = html.match(/&amp;(?:[a-zA-Z][a-zA-Z0-9]{1,10}|#\d{2,5});/);
  if (ent) problems.push(`escaped HTML entity in text (${ent[0]}) — it will render literally`);

  const stats = {
    figures:
      count(html, cls('figure')) +
      count(html, cls('derivation')) +
      count(html, cls('trace')) +
      count(html, cls('flow')),
    code: count(html, /<pre class="shiki/g),
    tabs: count(html, cls('code-tabs')),
    quiz: count(html, cls('q-text')),
    katex: count(html, cls('katex')),
    svg: count(html, /<svg[^>]*class="(?:[^"]* )?dg[ "]/g)
  };
  const line = Object.entries(stats)
    .map(([k, v]) => `${k}=${v}`)
    .join(' ');

  if (problems.length) fail(route, `${problems.join('; ')}\n     ${line}`);
  else console.log(`ok   ${route.padEnd(46)} ${line}`);
}

// Links and fragments, once every page has been fetched.
for (const { path, hash, from } of wanted) {
  const target = pages.get(path);
  if (!target) {
    fail(from, `broken link → ${path}`);
    continue;
  }
  if (hash && !new RegExp(`id="${hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(target)) {
    fail(from, `dead fragment → ${path}#${hash}`);
  }
}

console.log(
  failed ? `\n${failed} problem(s) across ${pages.size} pages` : `\nall ${pages.size} pages clean`
);
process.exit(failed ? 1 : 0);
