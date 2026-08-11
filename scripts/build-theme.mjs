import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'src', 'assets');
const output = path.join(root, 'public');

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

const assets = [
  ['styles/app.css', 'app.css'],
  ['js/i18n.js', 'i18n.js'],
  ['js/app.js', 'app.js']
];

for (const [from, to] of assets) {
  const input = path.join(source, from);
  if (!fs.existsSync(input)) throw new Error(`Missing source asset: ${from}`);
  fs.copyFileSync(input, path.join(output, to));
}

console.log(`Built ${assets.length} Twilight assets in public/`);
