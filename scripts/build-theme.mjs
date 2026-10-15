import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'src', 'assets');
const output = path.join(root, 'public');

const flattenStrings = (value, prefix = '') => Object.entries(value || {}).flatMap(([key, child]) => {
  const full = prefix ? `${prefix}.${key}` : key;
  return child && typeof child === 'object' && !Array.isArray(child)
    ? flattenStrings(child, full)
    : typeof child === 'string' ? [[full, child]] : [];
});
const arLocale = Object.fromEntries(flattenStrings(JSON.parse(fs.readFileSync(path.join(root, 'src/locales/ar.json'), 'utf8'))));
const enLocale = Object.fromEntries(flattenStrings(JSON.parse(fs.readFileSync(path.join(root, 'src/locales/en.json'), 'utf8'))));
const localePairs = Object.keys(arLocale)
  .filter((key) => typeof enLocale[key] === 'string')
  .map((key) => [arLocale[key], enLocale[key]])
  .filter(([ar, en]) => ar && en && ar !== en);

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

const assets = [
  ['styles/app.css', 'app.css'],
  ['styles/add-product-toast.css', 'add-product-toast.css'],
  ['js/i18n.js', 'i18n.js'],
  ['js/product-card.js', 'product-card.js'],
  ['js/app.js', 'app.js'],
  ['js/add-product-toast.js', 'add-product-toast.js']
];

for (const [from, to] of assets) {
  const input = path.join(source, from);
  if (!fs.existsSync(input)) throw new Error(`Missing source asset: ${from}`);
  const contents = fs.readFileSync(input, 'utf8');
  const outputContents = from === 'js/i18n.js'
    ? contents.replace('__LOCALE_PAIRS__', JSON.stringify(localePairs))
    : contents;
  if (from === 'js/i18n.js' && outputContents === contents) {
    throw new Error('Could not inject the locale dictionary into i18n.js');
  }
  fs.writeFileSync(path.join(output, to), outputContents);
}

console.log(`Built ${assets.length} Twilight assets in public/`);
