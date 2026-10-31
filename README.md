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

The homepage always renders every Velora section, so an older saved Salla homepage configuration
cannot produce a blank or legacy-looking preview. Every section is also registered with a stable
Twilight component `key` and `is_default` metadata, and elements added in the editor render
alongside the Velora sections.

The Velora components, in the prototype's order (`Velora-Lavender-Approved-Prototype.html`):

1. `lavender-hero` → `src/views/components/hero.twig`
2. `fragrance-aura-explorer` → `src/views/components/aura-explorer.twig`
3. `season-showcase` → `src/views/components/season-showcase.twig`
4. `botanical-categories` → `src/views/components/botanical-categories.twig`
5. `editorial-story` → `src/views/components/editorial-story.twig`
6. `lavender-routine-path` → `src/views/components/routine-path.twig`
7. `mood-shopping` → `src/views/components/mood-shopping.twig`
8. `gift-composer` → `src/views/components/gift-composer.twig`
9. `journal-grid` → `src/views/components/journal.twig`

The note bloom (`components/note-bloom.twig`) is a product-page section only: the single-product
template renders it from the product's fragrance metadata, so it is not offered as a home component.
The footer is built from Salla components (`salla-social`, `salla-menu`, `salla-contacts`,
`salla-apps-icons`, `salla-payments`, `salla-trust-badges`), so it fills from the store's own data.
Twilight has no newsletter component, so the theme does not show a subscription form.

Velora always renders its full homepage sequence — hero, store features, aura explorer, season
showcase, botanical categories, offer, editorial story, routine path, mood shopping, products slider,
gift composer, testimonials, journal — whatever the editor layout contains. Elements from the editor
layout render too, and a section that is already in the layout is not repeated: when the layout has
its own hero it comes first, otherwise the Velora sections come first. Every section has default
copy in `twilight.json` and the locales, and falls back to the store's latest products or first
categories; without merchant images the hero and offer tiles show the store's newest products, and
the bundled artwork in `src/assets/images/velora/` (copied to `public/images/` by the build) is used
only when the store has none. Sections that would otherwise show placeholders are left out: testimonials
appear once the store has reviews, the journal once articles are configured, and product sections and
the gift composer only when the store has products.

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
- Node.js LTS and pnpm.
- Salla CLI authentication (`salla login`).

## Install and validate

```bash
pnpm install
pnpm run development
pnpm run check
```

## Preview on a Salla demo store

From the project root:

```bash
pnpm exec salla login
pnpm exec salla theme preview --with-editor
```

The preview command requires a Salla Partners login, a connected GitHub account and the
GitHub access requested by Salla. It opens the theme editor and asks you to select a demo store.
A live Salla preview is required to validate real catalog data, checkout, customer sessions and
merchant settings; these cannot be fully simulated by opening Twig files directly.

Do not commit 
ode_modules`, `.env`, cache folders or generated output. They are already covered
by `.gitignore`.

## Publish

After the full demo-store test passes:

```bash
pnpm exec salla theme publish
```

Publishing is not the same as marketplace approval. Complete the theme listing, screenshots,
support details and review request in Salla Partners after the code is synced.

## Current verification status

Local asset build and the repository validator pass. The Salla CLI preview still needs to be run
with a valid Partners authorization token and the owner’s demo store. Marketplace approval and
full Arabic/English responsive review cannot be claimed until Salla’s live preview and review pass.

## Important status

This repository is an implementation-ready Twilight theme source, but it has not yet been
authenticated against the owner's Salla Partners account or exercised in the owner's demo store.
Do not describe it as marketplace-approved until that live test and Salla review are complete.





