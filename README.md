# Lavender in Motion — Salla Twilight Theme

A bilingual Arabic RTL / English LTR beauty and fragrance storefront for Salla Twilight.
The visual system uses lavender, porcelain, aubergine, sage and a restrained coral accent,
with petal, arch and perfume-bottle shapes instead of generic rectangular commerce blocks.

## Current implementation

- Official Twilight page paths for products, cart, customers, orders, wishlist, notifications,
  blog, brands, loyalty, thank-you and static pages.
- Nine merchant-configurable home components declared in `twilight.json`.
- Arabic and English localization files with matching keys.
- Responsive layouts for mobile, tablet and desktop.
- Product gallery, product options, quantity, wishlist, add-to-cart and related products.
- Cart quantity and removal controls, totals, coupon slot and checkout action.
- Search, navigation and filter sheets.
- Interactive Aura Explorer, Note Bloom, Routine Path, Mood Shopping and Gift Composer.
- Loading, empty, focus, disabled and reduced-motion states.
- A local validation command that checks required pages, component templates and translations.

## Project structure

```text
twilight.json
package.json
package-lock.json
scripts/
  validate-theme.mjs
src/
  assets/
    fonts/fonts.css
    js/app.js
    styles/app.css
  locales/
    ar.json
    en.json
  views/
    layouts/master.twig
    components/*.twig
    pages/
      product/index.twig
      product/single.twig
      customer/*
      blog/*
      brands/*
      cart.twig
      loyalty.twig
      thank-you.twig
      page-single.twig
      404.twig
prototype/
```

## Requirements

- A Salla Partners account with a demo store.
- GitHub connected to Salla Partners.
- Node.js LTS and npm.
- Salla CLI authentication (`salla login`).

## Install and validate

```bash
npm install
npm run check
```

## Preview on a Salla demo store

From the project root:

```bash
npx salla login
npm run preview
```

The preview command opens the theme editor and asks you to select a demo store. A live Salla
preview is required to validate real catalog data, checkout, customer sessions and merchant
settings; these cannot be fully simulated by opening Twig files directly.

## Before the first GitHub push

Update these placeholders in `twilight.json`:

- `repository`: the GitHub repository Salla created or imported.
- `author_email`: the real support email.

Do not commit `node_modules`, `.env`, cache folders or generated output. They are already covered
by `.gitignore`.

## Publish

After the full demo-store test passes:

```bash
npm run publish
```

Publishing is not the same as marketplace approval. Complete the theme listing, screenshots,
support details and review request in Salla Partners after the code is synced.

## Important status

This repository is an implementation-ready Twilight theme source, but it has not yet been
authenticated against the owner's Salla Partners account or exercised in the owner's demo store.
Do not describe it as marketplace-approved until that live test and Salla review are complete.
