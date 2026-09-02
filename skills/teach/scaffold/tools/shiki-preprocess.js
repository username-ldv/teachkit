/**
 * Compile-time syntax highlighting for lesson pages.
 *
 * Authoring contract, inside any .svelte file:
 *
 *   <CodeBlock lang="go" title="optional caption" hl="3,7-9">
 *   raw, unescaped source code goes here
 *   </CodeBlock>
 *
 *   <CodeTabs>
 *   <CodeBlock lang="go">...</CodeBlock>
 *   <CodeBlock lang="ts">...</CodeBlock>
 *   </CodeTabs>
 *
 * The preprocessor runs BEFORE the Svelte compiler, so the body is plain text:
 * write `<`, `&` and `{` literally — no HTML entities, no escaping.
 *
 * Each block is highlighted by Shiki (the TextMate grammars VS Code uses) at
 * build time and rewritten into a component call carrying the finished HTML:
 *
 *   <CodeBlock html={"..."} lang="go" label="Go" title="..." />
 *   <CodeTabs panes={[{ label, lang, html }, ...]} />
 *
 * Nothing from Shiki reaches the browser — the highlighter never ships.
 *
 * Known limitation: svelte-check reports diagnostics against the ORIGINAL text
 * of a file, so pages using <CodeBlock> are excluded from it in tsconfig.json.
 * `npm run build` compiles them for real.
 */
import { createHighlighter } from 'shiki';

const THEMES = { light: 'github-light', dark: 'tokyo-night' };

const LANGS = {
  go: { id: 'go', label: 'Go' },
  ts: { id: 'typescript', label: 'TypeScript' },
  typescript: { id: 'typescript', label: 'TypeScript' },
  js: { id: 'javascript', label: 'JavaScript' },
  javascript: { id: 'javascript', label: 'JavaScript' },
  json: { id: 'json', label: 'JSON' },
  bash: { id: 'bash', label: 'Shell' },
  shell: { id: 'bash', label: 'Shell' },
  sh: { id: 'bash', label: 'Shell' },
  html: { id: 'html', label: 'HTML' },
  css: { id: 'css', label: 'CSS' },
  text: { id: 'text', label: 'Text' },
  txt: { id: 'text', label: 'Text' }
};

let highlighterPromise = null;

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: [THEMES.light, THEMES.dark],
    langs: [...new Set(Object.values(LANGS).map((l) => l.id))]
  });
  return highlighterPromise;
}

/** Parse `a="b" c="d"` into an object. */
function parseAttrs(raw) {
  const attrs = {};
  const re = /([a-zA-Z_:][-\w:.]*)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(raw)) !== null) attrs[m[1]] = m[2];
  return attrs;
}

/** "3,7-9" -> Set{3,7,8,9} */
function parseLines(spec) {
  const lines = new Set();
  if (!spec) return lines;
  for (const part of spec.split(',')) {
    const [a, b] = part.trim().split('-').map(Number);
    if (Number.isNaN(a)) continue;
    for (let i = a; i <= (Number.isNaN(b) ? a : b); i++) lines.add(i);
  }
  return lines;
}

/** Strip the shared leading indentation an author used to keep the .svelte file tidy. */
function dedent(code) {
  const lines = code.replace(/\t/g, '  ').split('\n');
  while (lines.length && lines[0].trim() === '') lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  const indents = lines.filter((l) => l.trim() !== '').map((l) => l.match(/^ */)[0].length);
  const pad = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(pad)).join('\n');
}

async function highlight(code, langKey, hl) {
  const lang = LANGS[langKey] ?? LANGS.text;
  const highlighter = await getHighlighter();
  const marked = parseLines(hl);
  const html = highlighter.codeToHtml(dedent(code), {
    lang: lang.id,
    themes: THEMES,
    defaultColor: false,
    transformers: [
      {
        line(node, line) {
          node.properties.class = marked.has(line) ? 'line hl' : 'line';
        }
      }
    ]
  });
  return { html, label: lang.label, lang: lang.id };
}

const BLOCK_RE = /<CodeBlock\b([^>]*)>([\s\S]*?)<\/CodeBlock>/g;
const TABS_RE = /<CodeTabs\b([^>]*)>([\s\S]*?)<\/CodeTabs>/g;

/** Replace every regex match using an async replacer. */
async function replaceAsync(source, re, replacer) {
  const jobs = [];
  source.replace(re, (...args) => {
    jobs.push(replacer(...args));
    return '';
  });
  const done = await Promise.all(jobs);
  let i = 0;
  return source.replace(re, () => done[i++]);
}

export function shikiPreprocess() {
  return {
    name: 'shiki-code-blocks',
    async markup({ content, filename }) {
      if (!content.includes('<CodeBlock')) return;

      let code = content;

      // 1. Whole <CodeTabs> groups collapse into one component call.
      code = await replaceAsync(code, TABS_RE, async (_full, attrRaw, inner) => {
        const attrs = parseAttrs(attrRaw);
        const panes = [];
        for (const m of inner.matchAll(BLOCK_RE)) {
          const a = parseAttrs(m[1]);
          const { html, label, lang } = await highlight(m[2], a.lang, a.hl);
          panes.push({ label: a.label ?? label, lang, html, title: a.title });
        }
        if (panes.length === 0) {
          throw new Error(`<CodeTabs> with no <CodeBlock> children in ${filename}`);
        }
        const extra = attrs.title ? ` title=${JSON.stringify(attrs.title)}` : '';
        return `<CodeTabs panes={${JSON.stringify(panes)}}${extra} />`;
      });

      // 2. Any remaining standalone block.
      code = await replaceAsync(code, BLOCK_RE, async (_full, attrRaw, inner) => {
        const a = parseAttrs(attrRaw);
        const { html, label, lang } = await highlight(inner, a.lang, a.hl);
        const title = a.title ? ` title={${JSON.stringify(a.title)}}` : '';
        return `<CodeBlock html={${JSON.stringify(html)}} lang=${JSON.stringify(lang)} label=${JSON.stringify(a.label ?? label)}${title} />`;
      });

      return { code };
    }
  };
}
