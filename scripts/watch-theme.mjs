import path from 'node:path';
import { createRequire } from 'node:module';
import webpack from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';

const require = createRequire(import.meta.url);
// Official Twilight dev watcher: syncs changed .twig/.json files to the
// Salla draft and drives live reload over the ws port the CLI wrote to
// node_modules/.salla-cli before spawning this script.
const WatcherPlugin = require('@salla.sa/twilight/watcher.js');

const root = process.cwd();
const assetsSource = path.join(root, 'src', 'assets');
const assetsOutput = path.join(root, 'public');

const assets = [
  ['styles/app.css', 'app.css'],
  ['styles/add-product-toast.css', 'add-product-toast.css'],
  ['js/i18n.js', 'i18n.js'],
  ['js/app.js', 'app.js'],
  ['js/add-product-toast.js', 'add-product-toast.js']
];

// Same copy build the production/check scripts run, so `public/` is fresh
// the moment the watcher attaches.
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
        patterns: assets.map(([from, to]) => ({
          from: path.join(assetsSource, from),
          to
        }))
      }),
      new WatcherPlugin()
    ]
  },
  (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      process.exitCode = 1;
      return;
    }
    if (stats?.hasErrors()) {
      console.error(stats.toString({ colors: true, errorsOnly: true }));
      return;
    }
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
