const path = require('node:path');
const CopyPlugin = require('copy-webpack-plugin');
const SallaThemeWatcher = require('./scripts/salla-theme-watcher.cjs');

const root = __dirname;
const asset = file => path.resolve(root, 'src', 'assets', file);
const output = file => path.resolve(root, 'public', file || '');

const assets = [
  ['styles/app.css', 'app.css'],
  ['styles/add-product-toast.css', 'add-product-toast.css'],
  ['js/i18n.js', 'i18n.js'],
  ['js/app.js', 'app.js'],
  ['js/add-product-toast.js', 'add-product-toast.js'],
];

module.exports = {
  entry: {},
  output: {
    path: output(),
    clean: true,
  },
  stats: {
    modules: false,
    assetsSort: 'name',
  },
  plugins: [
    new SallaThemeWatcher(),
    new CopyPlugin({
      patterns: assets.map(([from, to]) => ({
        from: asset(from),
        to: output(to),
      })),
    }),
  ],
};
