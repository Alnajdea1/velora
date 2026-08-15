import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredPages = [
  'src/views/layouts/master.twig',
  'src/views/header.twig',
  'src/views/pages/index.twig',
  'src/views/pages/404.twig',
  'src/views/pages/product/index.twig',
  'src/views/pages/product/single.twig',
  'src/views/pages/cart.twig',
  'src/views/pages/customer/profile.twig',
  'src/views/pages/customer/orders/index.twig',
  'src/views/pages/customer/orders/single.twig',
  'src/views/pages/customer/wishlist.twig',
  'src/views/pages/customer/notifications.twig',
  'src/views/pages/customer/wallet.twig',
  'src/views/pages/blog/index.twig',
  'src/views/pages/blog/single.twig',
  'src/views/pages/brands/index.twig',
  'src/views/pages/brands/single.twig',
  'src/views/pages/loyalty.twig',
  'src/views/pages/thank-you.twig',
  'src/views/pages/page-single.twig',
  'src/views/pages/partials/product/options.twig',
  'src/assets/js/app.js',
  'src/assets/js/add-product-toast.js',
  'src/assets/styles/app.css',
  'src/assets/styles/add-product-toast.css',
  'scripts/build-theme.mjs',
  'public/app.js',
  'public/add-product-toast.js',
  'public/app.css',
  'public/add-product-toast.css',
  'src/locales/ar.json',
  'src/locales/en.json'
];

const errors = [];
const requiredComponents = {
  'src/views/layouts/master.twig': ['salla-offer-modal', 'salla-login-modal', 'salla-scopes', 'salla-search', 'salla-add-product-toast'],
  'src/views/pages/cart.twig': ['salla-cart-item-offers', 'salla-conditional-offer', 'salla-loyalty-panel', 'salla-tiered-offer'],
  'src/views/pages/customer/orders/index.twig': ['salla-orders'],
  'src/views/pages/customer/orders/single.twig': ['salla-order-totals-card', 'salla-order-details', 'salla-order-branch', 'salla-edit-order-button', 'salla-review-factors-tags'],
  'src/views/pages/customer/profile.twig': ['salla-user-settings'],
  'src/views/pages/customer/wallet.twig': ['salla-wallet'],
  'src/views/pages/customer/notifications.twig': ['salla-notifications'],
  'src/views/pages/product/single.twig': ['salla-offer', 'salla-gifting', 'salla-quick-order'],
  'src/views/pages/partials/product/options.twig': ['salla-multiple-bundle-product'],
  'src/views/pages/thank-you.twig': ['salla-order-shipments', 'salla-next-order-coupon']
};
const requiredHooks = {
  'src/views/pages/product/single.twig': [
    'product.single.before_product_info',
    'product.single.before_customer_reviews',
    'product.single.before_product_recommendations',
    'product.single.after_product_recommendations'
  ],
  'src/views/pages/product/index.twig': [
    'product.index.before_products_group_with_filter',
    'product.index.after_products_group_with_filter',
    'product.index.after_testimonials'
  ],
  'src/views/pages/page-single.twig': ['information_page.information_page']
};
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(path.join(root, 'twilight.json'), 'utf8'));
} catch (error) {
  errors.push(`twilight.json is not valid JSON: ${error.message}`);
}

for (const file of requiredPages) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`Missing required file: ${file}`);
}

for (const [file, components] of Object.entries(requiredComponents)) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  const source = fs.readFileSync(full, 'utf8');
  for (const component of components) {
    const occurrences = [...source.matchAll(new RegExp(`<${component}(?:\\s|>)`, 'g'))].length;
    if (occurrences !== 1) errors.push(`Required Twilight component must appear exactly once (${file}): ${component}; found ${occurrences}`);
  }
}

for (const [file, hooks] of Object.entries(requiredHooks)) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  const source = fs.readFileSync(full, 'utf8');
  for (const hook of hooks) {
    const token = `{% hook '${hook}' %}`;
    const occurrences = source.split(token).length - 1;
    if (occurrences !== 1) errors.push(`Required Twilight hook must appear exactly once (${file}): ${hook}; found ${occurrences}`);
  }
  const positions = hooks.map((hook) => source.indexOf(`{% hook '${hook}' %}`));
  if (positions.some((position, index) => index > 0 && position < positions[index - 1])) {
    errors.push(`Required Twilight hooks are not in the expected order: ${file}`);
  }
}

const fixedCopyChecks = {
  'src/views/components/demo-product-card.twig': ['>VELORA<'],
  'src/views/components/footer.twig': ['>LAVENDER, REIMAGINED<'],
  'src/views/header.twig': [">{{ is_ar ? 'EN' : 'AR' }}<", "? 'الجديد' : 'New'"],
  'src/views/components/botanical-categories.twig': ["? 'العطور' : 'Fragrance'"]
};
for (const [file, literals] of Object.entries(fixedCopyChecks)) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  for (const literal of literals) {
    if (source.includes(literal)) errors.push(`Untranslated fixed interface text (${file}): ${literal}`);
  }
}

const informationPage = path.join(root, 'src/views/pages/page-single.twig');
if (fs.existsSync(informationPage)) {
  const source = fs.readFileSync(informationPage, 'utf8');
  if (source.indexOf("page.type == 'customised'") > source.indexOf("{% hook 'information_page.information_page' %}")) {
    errors.push('The information-page hook must be guarded by the customised page type');
  }
}

const headerEntrypoint = path.join(root, 'src/views/header.twig');
if (fs.existsSync(headerEntrypoint)) {
  const source = fs.readFileSync(headerEntrypoint, 'utf8');
  if (!source.includes('<header') || !source.includes('<nav') || !source.includes('<salla-cart-summary')) {
    errors.push('src/views/header.twig must contain the navigation header implementation, not only exist');
  }
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
  for (const key of ['name', 'repository', 'support_url', 'author_email', 'features', 'settings', 'components']) {
    if (!(key in manifest)) errors.push(`twilight.json is missing top-level key: ${key}`);
  }
  for (const key of ['repository', 'support_url', 'author_email']) {
    if (!String(manifest[key] || '').trim()) errors.push(`twilight.json has an empty top-level value: ${key}`);
  }
  const settingIds = new Set();
  for (const setting of manifest.settings || []) {
    if (!setting.id) errors.push('Every theme setting needs an id');
    if (settingIds.has(setting.id)) errors.push(`Duplicate theme setting id: ${setting.id}`);
    settingIds.add(setting.id);
  }
  const toastSetting = (manifest.settings || []).find((setting) => setting.id === 'enable_add_product_toast');
  if (!toastSetting || toastSetting.type !== 'boolean' || toastSetting.value !== true || toastSetting.selected !== true) {
    errors.push('enable_add_product_toast must be a boolean theme setting enabled by default');
  }
  const componentNames = new Set();
  const componentKeys = new Set();
  for (const component of manifest.components || []) {
    if (!component.name || !component.path || !component.key) errors.push('Every component needs name, key and path');
    if (componentNames.has(component.name)) errors.push(`Duplicate component name: ${component.name}`);
    componentNames.add(component.name);
    if (componentKeys.has(component.key)) errors.push(`Duplicate component key: ${component.key}`);
    componentKeys.add(component.key);
    const componentFile = `src/views/components/${String(component.path).replaceAll('.', '/')}.twig`;
    if (!fs.existsSync(path.join(root, componentFile))) errors.push(`Component template missing: ${componentFile}`);
    for (const field of component.fields || []) {
      if (field.type === 'items' && field.source !== String(field.source || '').toLowerCase()) {
        errors.push(`Items source must be lowercase (${component.name}.${field.id}): ${field.source}`);
      }
      if (field.type === 'collection') {
        for (const child of field.fields || []) {
          if (!String(child.id || '').startsWith(`${field.id}.`)) {
            errors.push(`Collection child id must be prefixed (${component.name}.${field.id}): ${child.id}`);
          }
          if (child.type === 'items' && child.source !== String(child.source || '').toLowerCase()) {
            errors.push(`Items source must be lowercase (${component.name}.${child.id}): ${child.source}`);
          }
        }
      }
    }
  }
  if (!(manifest.components || []).some((component) => component.is_default)) {
    errors.push('At least one homepage component must be marked is_default');
  }

  try {
    const packageData = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    if (manifest.version && packageData.version !== manifest.version) {
      errors.push(`Theme version mismatch: package.json=${packageData.version}, twilight.json=${manifest.version}`);
    }
  } catch (error) {
    errors.push(`package.json is not valid JSON: ${error.message}`);
  }
}

const homeTemplate = path.join(root, 'src/views/pages/index.twig');
if (fs.existsSync(homeTemplate)) {
  const source = fs.readFileSync(homeTemplate, 'utf8');
  if (!/{%\s*component\s+home\s*%}/.test(source)) {
    errors.push('Homepage must render merchant-ordered Velora components with {% component home %}');
  }
}

const masterTemplate = path.join(root, 'src/views/layouts/master.twig');
if (fs.existsSync(masterTemplate)) {
  const source = fs.readFileSync(masterTemplate, 'utf8');
  if (!source.includes("'app.css'|asset") && !source.includes("'app.css' | asset")) {
    errors.push("Master layout must load the compiled public asset as {{ 'app.css'|asset }}");
  }
  if (!source.includes("'app.js'|asset") && !source.includes("'app.js' | asset")) {
    errors.push("Master layout must load the compiled public asset as {{ 'app.js'|asset }}");
  }
  for (const asset of ['add-product-toast.css', 'add-product-toast.js']) {
    if (!source.includes(`'${asset}'|asset`) && !source.includes(`'${asset}' | asset`)) {
      errors.push(`Master layout must load the required toast asset: ${asset}`);
    }
  }
}

const toastScript = path.join(root, 'src/assets/js/add-product-toast.js');
if (fs.existsSync(toastScript)) {
  const source = fs.readFileSync(toastScript, 'utf8');
  if (!source.includes('customElements.define("salla-add-product-toast"')) {
    errors.push('salla-add-product-toast must be registered as a functional custom element');
  }
}

const forbiddenThemeFeatures = new Set([
  'fixed-products', 'products-slider', 'featured-products', 'latest-products',
  'fixed-banner', 'photos-slider', 'square-photos', 'store-features'
]);
for (const feature of manifest?.features || []) {
  if (forbiddenThemeFeatures.has(feature)) {
    errors.push(`Remove predefined homepage feature that can revive the previous store design: ${feature}`);
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
