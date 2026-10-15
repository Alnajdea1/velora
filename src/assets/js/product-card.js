(() => {
  'use strict';
  if (customElements.get('custom-salla-product-card')) return;
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]));
  const asPrice = (value) => Array.isArray(value) ? (value[0]?.amount ?? value[0] ?? '') : (value && typeof value === 'object' ? (value.amount ?? '') : (value ?? ''));
  class VeloraProductCard extends HTMLElement {
    set product(value) { this._product = value; if (this.isConnected) this.renderCard(); }
    get product() { return this._product; }
    connectedCallback() {
      if (!this.product) {
        try { this.product = JSON.parse(this.getAttribute('product') || 'null'); } catch { this.product = null; }
      }
      if (!this.product) return;
      if (window.app?.status === 'ready' || window.salla) this.renderCard();
      else document.addEventListener('theme::ready', () => this.renderCard(), { once: true });
    }
    renderCard() {
      const product = this.product;
      if (!product || this.dataset.veloraRendered === 'true') return;
      this.dataset.veloraRendered = 'true';
      const body = document.body;
      const id = esc(product.id);
      const url = esc(product.url || '#');
      const name = esc(product.name || '');
      const image = product.image?.url || product.images?.[0]?.url || product.thumbnail || '';
      const secondImage = product.images?.find((entry) => entry?.url && entry.url !== image)?.url || '';
      const available = product.is_available !== false && product.is_out_of_stock !== true && product.status !== 'out';
      const sale = Boolean(product.is_on_sale);
      const tags = Array.isArray(product.tags) ? product.tags : [];
      const isNew = tags.some((tag) => ['new', 'new arrival', 'جديد', 'وصل حديثاً'].includes(String(tag?.name || tag).trim().toLowerCase()));
      const wishlist = Boolean(product.is_in_wishlist);
      const price = asPrice(sale ? (product.sale_price ?? product.price) : product.price);
      const original = asPrice(product.regular_price);
      const format = (amount) => { try { return window.salla?.money ? window.salla.money(amount) : esc(amount); } catch { return esc(amount); } };
      const badges = [];
      if (product.promotion_title) badges.push('<span class="v-badge">' + esc(product.promotion_title) + '</span>');
      else if (sale) badges.push('<span class="v-badge v-badge--off">' + esc(body.dataset.cardSale || '') + '</span>');
      if (isNew) badges.push('<span class="v-badge v-badge--new">' + esc(body.dataset.cardNew || '') + '</span>');
      if (!available) badges.push('<span class="v-badge v-badge--soldout">' + esc(body.dataset.cardSoldOut || '') + '</span>');
      const notesValue = product.metadata?.fragrance_notes || product.notes;
      const notes = typeof notesValue === 'string' ? notesValue.split(/[,،]/).map((note) => note.trim()).filter(Boolean) : [];
      const brand = product.brand?.name || product.category?.name || '';
      const channels = Array.isArray(product.notify_availability?.channels) ? product.notify_availability.channels.join(',') : '';
      this.classList.add('v-product');
      this.dataset.productId = String(product.id || '');
      this.dataset.productState = available ? (sale ? 'sale' : 'regular') : 'sold-out';
      this.innerHTML = `
        <div class="v-product__media">
          ${image ? `<a class="v-product__image-link" href="${url}" aria-label="${name}"><img src="${esc(image)}" alt="${esc(product.image?.alt || product.name || '')}" loading="lazy" width="640" height="800">${secondImage ? `<img src="${esc(secondImage)}" alt="" loading="lazy" aria-hidden="true">` : ''}</a>` : `<a class="v-product__image-link" href="${url}" aria-label="${name}"><span class="v-bottle v-bottle--card" aria-hidden="true"><i></i><b></b><em></em></span></a>`}
          ${badges.length ? `<div class="v-product__badges">${badges.join('')}</div>` : ''}
          <div class="v-product__quickadd"><salla-add-product-button product-id="${id}" product-status="${available ? esc(product.status || 'sale') : 'out-and-notify'}" product-type="${esc(product.type || 'product')}" ${channels ? `channels="${esc(channels)}"` : ''} class="v-btn v-btn--primary" style="width:100%">${esc(available ? (product.add_to_cart_label || body.dataset.cardQuickAdd) : body.dataset.cardNotify)}</salla-add-product-button></div>
        </div>
        <salla-button shape="icon" fill="none" class="v-pill v-product__wish" onclick="salla.wishlist.toggle(${id})" aria-label="${esc(body.dataset.cardWishlist || '')}" aria-pressed="${wishlist}">${wishlist ? '♥' : '♡'}</salla-button>
        <div class="v-product__info">
          <div class="v-product__meta">${brand ? `<span>${esc(brand)}</span>` : ''}${product.rating?.stars ? `<span class="v-product__rating">★ ${esc(product.rating.stars)}</span>` : ''}</div>
          <h3><a href="${url}">${name}</a></h3>
          ${product.subtitle ? `<p>${esc(product.subtitle)}</p>` : ''}
          <div class="v-product__price"><span class="num">${format(price)}</span>${sale && original ? `<span class="v-product__old">${format(original)}</span>` : ''}${sale && product.discount_percentage ? `<span class="v-badge v-badge--off">−${esc(product.discount_percentage)}</span>` : ''}</div>
          ${notes.length ? `<div class="v-product__notes-wrap"><button type="button" data-toggle-notes aria-expanded="false">${esc(body.dataset.cardNotes || '')}</button><div class="v-product__notes" data-open="false"><div class="v-product__notes-list">${notes.map((note) => `<span class="v-pill">${esc(note)}</span>`).join('')}</div></div></div>` : ''}
        </div>`;
    }
  }
  customElements.define('custom-salla-product-card', VeloraProductCard);
})();
