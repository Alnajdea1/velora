import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredPages = [
  'src/views/pages/index.twig',
  'src/views/pages/product/index.twig',
  'src/views/pages/product/single.twig',
  'src/views/pages/cart.twig',
  'src/views/pages/customer/profile.twig',
  'src/views/pages/customer/orders/index.twig',
  'src/views/pages/customer/orders/single.twig',
  'src/views/pages/customer/wishlist.twig',
  'src/views/pages/customer/notifications.twig',
  'src/views/pages/blog/index.twig',
  'src/views/pages/blog/single.twig',
  'src/views/pages/brands/index.twig',
  'src/views/pages/brands/single.twig',
  'src/views/pages/loyalty.twig',
  'src/views/pages/thank-you.twig',
  'src/views/pages/page-single.twig',
  'src/assets/js/app.js',
  'src/assets/styles/app.css',
  'src/locales/ar.json',
  'src/locales/en.json'
];

const errors = [];
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(path.join(root, 'twilight.json'), 'utf8'));
} catch (error) {
  errors.push(`twilight.json is not valid JSON: ${error.message}`);
}

for (const file of requiredPages) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing required file: ${file}`);
}

const localeData = {};
for (const locale of ['ar', 'en']) {
  try {
    localeData[locale] = JSON.parse(fs.readFileSync(path.join(root, `src/locales/${locale}.json`), 'utf8'));
  } catch (error) {
    errors.push(`${locale}.json is not valid JSON: ${error.message}`);
  }
}

const flatten = (value, prefix = '') => Object.entries(value || {}).flatMap(([key, child]) => {
  const full = prefix ? `${prefix}.${key}` : key;
  return child && typeof child === 'object' && !Array.isArray(child) ? flatten(child, full) : [full];
});
if (localeData.ar && localeData.en) {
  const arKeys = new Set(flatten(localeData.ar));
  const enKeys = new Set(flatten(localeData.en));
  for (const key of arKeys) if (!enKeys.has(key)) errors.push(`English locale missing key: ${key}`);
  for (const key of enKeys) if (!arKeys.has(key)) errors.push(`Arabic locale missing key: ${key}`);

  const twigFiles = [];
  const collectTwig = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) collectTwig(full);
      else if (entry.name.endsWith('.twig')) twigFiles.push(full);
    }
  };
  collectTwig(path.join(root, 'src/views'));
  for (const file of twigFiles) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(/trans\(['"]([^'"]+)['"]/g)) {
      if (!match[1].endsWith('.') && !arKeys.has(match[1])) errors.push(`Translation key not found (${path.relative(root, file)}): ${match[1]}`);
    }
    for (const match of source.matchAll(/{%\s*include\s+['"]([^'"]+)['"]/g)) {
      const includeFile = `src/views/${match[1].replaceAll('.', '/')}.twig`;
      if (!fs.existsSync(path.join(root, includeFile))) errors.push(`Included template not found (${path.relative(root, file)}): ${includeFile}`);
    }
    for (const [open, close] of [['if', 'endif'], ['for', 'endfor'], ['block', 'endblock']]) {
      const opens = [...source.matchAll(new RegExp(`{%\\s*${open}\\b`, 'g'))].length;
      const closes = [...source.matchAll(new RegExp(`{%\\s*${close}\\b`, 'g'))].length;
      if (opens !== closes) errors.push(`Unbalanced Twig ${open}/${close} (${path.relative(root, file)}): ${opens}/${closes}`);
    }
  }
}

if (manifest) {
  for (const key of ['name', 'repository', 'author_email', 'features', 'settings', 'components']) {
    if (!(key in manifest)) errors.push(`twilight.json is missing top-level key: ${key}`);
  }
  const componentNames = new Set();
  for (const component of manifest.components || []) {
    if (!component.name || !component.path) errors.push('Every component needs name and path');
    if (componentNames.has(component.name)) errors.push(`Duplicate component name: ${component.name}`);
    componentNames.add(component.name);
    const componentFile = `src/views/components/${String(component.path).replaceAll('.', '/')}.twig`;
    if (!fs.existsSync(path.join(root, componentFile))) errors.push(`Component template missing: ${componentFile}`);
  }
}

const forbidden = ['.env', '.env.local'];
for (const item of forbidden) {
  if (fs.existsSync(path.join(root, item))) errors.push(`Remove forbidden export item before packaging: ${item}`);
}

if (errors.length) {
  console.error(`Theme check failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Theme check passed: ${requiredPages.length} required files and ${manifest.components.length} custom components.`);
