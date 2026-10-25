import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import webpack from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';

const require = createRequire(import.meta.url);
const WatcherPlugin = require('@salla.sa/twilight/watcher.js');

// Keep the watcher alive on ANY async failure. A failed draft sync or a
// dropped live-reload socket (AggregateError) arrives as an unhandled promise
// rejection, which Node turns into a hard exit. That exit is what the CLI
// reports as "Command failed: pnpm run watch".
process.on('uncaughtException', (err) => {
  console.error(`[watch] error ignored, still watching: ${err && err.message ? err.message : err}`);
});
process.on('unhandledRejection', (reason) => {
  const msg = reason && reason.message ? reason.message : String(reason);
  console.error(`[watch] async error ignored, still watching: ${msg}`);
});

const root = process.cwd();
const assetsSource = path.join(root, 'src', 'assets');
const assetsOutput = path.join(root, 'public');

process.env.PATH = `${path.join(root, 'node_modules', '.bin')}${path.delimiter}${process.env.PATH}`;

// Salla's sync expects a theme-root-relative POSIX path on every OS.
// On Windows the watcher passes backslash paths, so the draft never updates.
class PosixWatcherPlugin extends WatcherPlugin {
  constructor(...args) {
    super(...args);
    // The watcher runs `"salla" theme sync`. When cmd.exe finds a quoted name
    // through PATH, the pnpm shim's %~dp0 points at the theme root instead of
    // node_modules/.bin, so it looks for C:\...\@salla.sa\cli and every sync
    // fails. Calling the shim by its absolute path avoids that lookup.
    const shim = path.join(root, 'node_modules', '.bin', 'salla.CMD');
    if (process.platform === 'win32' && fs.existsSync(shim)) this.sallaCli = shim;
  }

  addToQ(file, ...rest) {
    try {
      if (typeof file === 'string') {
        const abs = path.isAbsolute(file) ? file : path.resolve(root, file);
        const rel = path.relative(root, abs);
        if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) {
          file = rel.split(path.sep).join('/');
        }
      }
    } catch (e) {
      console.error(`[watch] could not normalise path ${file}: ${e.message}`);
    }
    return super.addToQ(file, ...rest);
  }
}

const assets = [
  ['styles/app.css', 'app.css'],
  ['styles/add-product-toast.css', 'add-product-toast.css'],
  ['js/i18n.js', 'i18n.js'],
  ['js/product-card.js', 'product-card.js'],
  ['js/app.js', 'app.js'],
  ['js/add-product-toast.js', 'add-product-toast.js']
];

// i18n.js ships with a __LOCALE_PAIRS__ placeholder that build-theme.mjs fills
// from the locale files; a raw copy would break the Arabic/English switch.
const flattenStrings = (value, prefix = '') => Object.entries(value || {}).flatMap(([key, child]) => {
  const full = prefix ? `${prefix}.${key}` : key;
  return child && typeof child === 'object' && !Array.isArray(child)
    ? flattenStrings(child, full)
    : typeof child === 'string' ? [[full, child]] : [];
});
const localePairs = () => {
  const read = (locale) => Object.fromEntries(flattenStrings(JSON.parse(fs.readFileSync(path.join(root, 'src', 'locales', `${locale}.json`), 'utf8'))));
  const ar = read('ar');
  const en = read('en');
  return Object.keys(ar)
    .filter((key) => typeof en[key] === 'string')
    .map((key) => [ar[key], en[key]])
    .filter(([arabic, english]) => arabic && english && arabic !== english);
};
const withLocales = (from) => from === 'js/i18n.js'
  ? { transform: (content) => content.toString().replace('__LOCALE_PAIRS__', JSON.stringify(localePairs())) }
  : {};

await import('./build-theme.mjs');

const compiler = webpack(
  {
    mode: 'development',
    entry: {},
    output: { path: assetsOutput },
    watch: true,
    watchOptions: { aggregateTimeout: 300, ignored: ['**/node_modules/**'] },
    stats: 'errors-warnings',
    plugins: [
      new CopyPlugin({
        patterns: assets.map(([from, to]) => ({ from: path.join(assetsSource, from), to, ...withLocales(from) }))
      }),
      new PosixWatcherPlugin()
    ]
  },
  (err, stats) => {
    if (err) { console.error(err.stack || err); return; }
    if (stats?.hasErrors()) { console.error(stats.toString({ colors: true, errorsOnly: true })); return; }
    console.log(`[watch] src/assets -> public/ synced (${new Date().toLocaleTimeString()})`);
  }
);

console.log('[watch] watching src/assets, src/views (*.twig) and src (*.json) for changes...');

const shutdown = () => {
  if (compiler.watching) compiler.watching.close(() => process.exit(0));
  else process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
