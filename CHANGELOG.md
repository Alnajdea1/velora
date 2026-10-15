# Changelog

## 1.2.21 — 2026-10-15
### Salla marketplace compatibility

- Declared the Twilight built-in homepage feature components required by Salla as supported while preserving Velora's default homepage sequence.
- Added product tax-included messaging, unit price and total price in cart, category imagery, and a product gallery for images, video, YouTube, and 3D models.
- Updated the selected-variant image in the product gallery and kept Salla option availability feedback connected to the add-to-cart control.
- Restricted offers, fragrance facts, ingredients, hero metrics, articles, categories, and gift contents to merchant-provided or live store data. Removed sample countdowns and unsupported shipping, payment, delivery, authenticity, sample, return, and discount promises.
- Removed a duplicate product-card script include and added static checks for the Salla review requirements.

### API and manifest review

- Checked feature identifiers against Salla's `twilight.json` format and current built-in feature list.
- Confirmed the documented product tax property `product.is_taxable`, gallery properties `video_url`, `video_type`, and `three_d_image_url`, and the `cart.taxes_included` review requirement.
- Kept Salla components for variant selection, add-to-cart/notify, dynamic quick order, comments, social sharing, cart coupons, cart summary/checkout, loyalty, and cart quantity controls.

### Verification status

- Local build and static review checks pass.
- Theme source package is below Salla's documented 1 MB limit when dependency installation and Git internals are excluded.
- Live demo-store review, viewport/browser checks, checkout verification, and Lighthouse thresholds remain unverified until the owner can authorize a Salla Partners preview.

