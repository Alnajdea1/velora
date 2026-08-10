# Lavender in Motion — Salla Twilight Theme

A bilingual Arabic RTL / English LTR beauty and fragrance storefront for Salla Twilight.
The visual system uses lavender, porcelain, aubergine, sage and a restrained coral accent,
with petal, arch and perfume-bottle shapes instead of generic rectangular commerce blocks.

## Current implementation

- Official Twilight page paths for products, cart, customers, orders, wishlist, notifications,
  blog, brands, loyalty, thank-you and static pages.
- Ten merchant-configurable Velora components declared in `twilight.json`.
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
```

## Approved homepage order

In Salla's theme editor, add the following components in this exact order to reproduce
`Velora-Lavender-Approved-Prototype.html`:

1. `lavender-hero` → `src/views/components/hero.twig`
2. `fragrance-aura-explorer` → `src/views/components/aura-explorer.twig`
3. `season-showcase` → `src/views/components/season-showcase.twig`
4. `botanical-categories` → `src/views/components/botanical-categories.twig`
5. `editorial-story` → `src/views/components/editorial-story.twig`
6. `lavender-routine-path` → `src/views/components/routine-path.twig`
7. `mood-shopping` → `src/views/components/mood-shopping.twig`
8. `gift-composer` → `src/views/components/gift-composer.twig`
9. `journal-grid` → `src/views/components/journal.twig`

`fragrance-note-bloom` is also reusable from the editor and is rendered directly on the
single-product template. The closing newsletter is global, matching the prototype, and is
rendered from `layouts/master.twig` before `footer.twig`.

The homepage template deliberately contains only `{% component home %}`. Built-in Salla
homepage feature components are not enabled, so a previous store design is not substituted for
Velora. All catalog imagery and commerce actions remain dynamic Salla data; the prototype's CSS
perfume bottle is retained only as the intentional fallback artwork when no image is configured.

## Page mapping

| Prototype screen | Twilight file |
| --- | --- |
| Collection/search/tag/sale | `src/views/pages/product/index.twig` |
| Product story and purchase | `src/views/pages/product/single.twig` |
| Cart and empty cart | `src/views/pages/cart.twig` |
| Profile, orders, wishlist, notifications | `src/views/pages/customer/**` |
| Journal and article | `src/views/pages/blog/**` |
| Brands index and brand story | `src/views/pages/brands/**` |
| Loyalty | `src/views/pages/loyalty.twig` |
| Order confirmation | `src/views/pages/thank-you.twig` |
| Policies/promotional content | `src/views/pages/page-single.twig` |
| Not found | `src/views/pages/404.twig` |

Enable the optional `reviewer_panel` theme setting when reviewers need the prototype-style
screen index. It is disabled by default for customers.

## Requirements

- A Salla Partners account with a demo store.
- GitHub connected to Salla Partners.
- Node.js LTS and npm.
- Salla CLI authentication (`salla login`).

## Install and validate

```bash
npm ci
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
