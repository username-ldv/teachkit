// @ts-nocheck — node builtins, and @types/node is not a dependency of the course.
/**
 * Makes KaTeX's fonts load from the dev server.
 *
 * katex.min.css asks for its fonts by relative URL, so they resolve inside the
 * installed katex package — which lives in a package store outside the project.
 * Two things then go wrong with `npm run dev`:
 *
 *  1. Files outside the project root are only served if they are on
 *     server.fs.allow, and this config deliberately allows just the project. So
 *     the plugin adds the resolved katex directory, wherever the package manager
 *     put it.
 *
 *  2. Allowed outside files are served under /@fs/<absolute path>, and on Windows
 *     that handler strips the drive letter and serves the rest from "/" — i.e.
 *     from the drive the dev server runs on. When the store is on another drive
 *     (courses on D:, the nub store under C:\Users\...) the lookup misses and
 *     every font 404s, leaving math in a fallback font:
 *
 *       [404] GET /@fs/C:/Users/.../katex/dist/fonts/KaTeX_Main-Regular.woff2
 *
 *     The middleware below answers exactly those requests from the real path.
 *
 * Both halves are dev-only: `npm run build` copies the fonts into dist/ as
 * regular assets, which has always worked. The middleware is scoped to font
 * files sitting directly in katex/dist/fonts, and does nothing at all when the
 * store shares a drive with the project or when the drive letter is absent.
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const FS_PREFIX = '/@fs/';

const MIME = { '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };

const slash = (p) => p.replace(/\\/g, '/');
const driveOf = (p) => (/^[a-z]:/i.test(p) ? p.slice(0, 2).toLowerCase() : '');

/** @returns {import('vite').Plugin} */
export function katexFonts() {
  const katexDir = path.dirname(createRequire(import.meta.url).resolve('katex/package.json'));
  const fontsDir = slash(path.join(katexDir, 'dist', 'fonts')).toLowerCase();

  return {
    name: 'katex-fonts',
    apply: 'serve',

    config: () => ({ server: { fs: { allow: [katexDir] } } }),

    configureServer(server) {
      const projectDrive = driveOf(path.resolve(server.config.root));
      if (!projectDrive || driveOf(fontsDir) === projectDrive) return;

      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        if (!req.url?.startsWith(FS_PREFIX) || req.url.includes('?')) return next();

        let file;
        try {
          file = slash(path.resolve(decodeURI(req.url.slice(FS_PREFIX.length))));
        } catch {
          return next();
        }

        const type = MIME[path.extname(file).toLowerCase()];
        if (!type || path.dirname(file).toLowerCase() !== fontsDir) return next();

        stat(file).then(
          (stats) => {
            if (!stats.isFile()) return next();
            res.setHeader('Content-Type', type);
            res.setHeader('Content-Length', stats.size);
            res.setHeader('Cache-Control', 'no-cache');
            if (req.method === 'HEAD') return void res.end();
            createReadStream(file).pipe(res);
          },
          () => next()
        );
      });
    }
  };
}
