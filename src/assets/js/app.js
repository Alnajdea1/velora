(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const setOverlay = (name, open) => {
    const overlay = $(`[data-overlay="${name}"]`);
    if (!overlay) return;
    overlay.hidden = !open;
    document.documentElement.classList.toggle('v-lock', open);
    if (open) {
      const focusTarget = $('input,button,a,[tabindex]:not([tabindex="-1"])', overlay);
      window.setTimeout(() => focusTarget?.focus(), 30);
    }
  };

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'v-toast';
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    document.body.append(toast);
    window.setTimeout(() => toast.remove(), 3200);
  };

  const init = () => {
    const header = $('[data-component="header"]');
    const syncHeader = () => header?.setAttribute('data-scrolled', String(window.scrollY > 18));
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    document.addEventListener('click', async (event) => {
      const opener = event.target.closest('[data-open]');
      if (opener) setOverlay(opener.dataset.open, true);

      const closer = event.target.closest('[data-close]');
      if (closer) setOverlay(closer.closest('[data-overlay]')?.dataset.overlay, false);

      if (event.target.matches('[data-overlay]')) setOverlay(event.target.dataset.overlay, false);

      const notesButton = event.target.closest('[data-toggle-notes]');
      if (notesButton) {
        const panel = notesButton.parentElement.querySelector('.v-product__notes');
        const open = panel.dataset.open !== 'true';
        panel.dataset.open = String(open);
        notesButton.setAttribute('aria-expanded', String(open));
      }

      const remove = event.target.closest('[data-remove-cart]');
      if (remove && window.salla?.cart) {
        remove.disabled = true;
        try { await salla.cart.deleteItem(remove.dataset.removeCart); }
        catch { remove.disabled = false; }
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') $$('[data-overlay]:not([hidden])').forEach((overlay) => setOverlay(overlay.dataset.overlay, false));
    });

    $$('[data-component="aura-explorer"]').forEach((root) => {
      $$('[data-aura]', root).forEach((tab) => tab.addEventListener('click', () => {
        $$('[data-aura]', root).forEach((item) => item.setAttribute('aria-selected', 'false'));
        $$('[data-aura-panel]', root).forEach((panel) => { panel.hidden = panel.dataset.auraPanel !== tab.dataset.aura; });
        tab.setAttribute('aria-selected', 'true');
      }));
    });

    $$('[data-component="note-bloom"]').forEach((root) => {
      $$('[data-bloom]', root).forEach((tab, index) => tab.addEventListener('click', () => {
        $$('[data-bloom]', root).forEach((item) => item.setAttribute('aria-selected', 'false'));
        $$('[data-bloom-panel]', root).forEach((panel) => { panel.hidden = panel.dataset.bloomPanel !== tab.dataset.bloom; });
        $$('[data-bloom-ring]', root).forEach((ring, ringIndex) => ring.dataset.active = String(ringIndex === index));
        tab.setAttribute('aria-selected', 'true');
      }));
    });

    $$('[data-component="mood-shopping"]').forEach((root) => {
      $$('[data-mood]', root).forEach((tab) => tab.addEventListener('click', () => {
        $$('[data-mood]', root).forEach((item) => item.setAttribute('aria-pressed', 'false'));
        $$('[data-mood-panel]', root).forEach((panel) => { panel.hidden = panel.dataset.moodPanel !== tab.dataset.mood; });
        tab.setAttribute('aria-pressed', 'true');
      }));
    });

    $$('[data-component="routine-path"]').forEach((root) => {
      $$('[data-step]', root).forEach((step) => $('button', step)?.addEventListener('click', () => {
        $$('.v-path__node', root).forEach((node) => node.setAttribute('aria-current', 'false'));
        $('button', step).setAttribute('aria-current', 'true');
      }));
    });

    $$('[data-component="gift-composer"]').forEach((root) => {
      const chosen = new Map();
      const max = Number(root.dataset.maxItems || 3);
      const wrap = Number(root.dataset.wrapPrice || 0);
      const total = $('[data-gift-total]', root);
      const list = $('[data-gift-chosen]', root);
      const add = $('[data-gift-add]', root);
      const render = () => {
        list.innerHTML = [...chosen.values()].map((item) => `<span>${item.label}</span>`).join('');
        total.textContent = chosen.size ? new Intl.NumberFormat(document.documentElement.lang, { style:'currency', currency:'SAR' }).format([...chosen.values()].reduce((sum, item) => sum + item.price, wrap)) : '—';
        add.disabled = !chosen.size;
      };
      $$('[data-gift-item]', root).forEach((button) => button.addEventListener('click', () => {
        const id = button.dataset.giftItem;
        if (chosen.has(id)) chosen.delete(id);
        else if (chosen.size < max) chosen.set(id, { label:button.textContent.trim(), price:Number(button.dataset.price || 0) });
        button.setAttribute('aria-pressed', String(chosen.has(id)));
        render();
      }));
      $$('[data-gift-shape]', root).forEach((button) => button.addEventListener('click', () => {
        $$('[data-gift-shape]', root).forEach((item) => item.setAttribute('aria-pressed', 'false'));
        button.setAttribute('aria-pressed', 'true');
        $('[data-gift-box]', root).dataset.shape = button.dataset.giftShape;
      }));
      add?.addEventListener('click', async () => {
        if (!window.salla?.cart) return;
        add.disabled = true;
        try {
          for (const id of chosen.keys()) await salla.cart.quickAdd(id);
          showToast(add.textContent.trim());
        } finally { add.disabled = false; }
      });
    });

    $$('[data-gallery]').forEach((root) => {
      $$('[data-gallery-thumb]', root).forEach((thumb) => thumb.addEventListener('click', () => {
        $$('[data-gallery-thumb]', root).forEach((item) => item.setAttribute('aria-selected', 'false'));
        $$('[data-gallery-slide]', root).forEach((slide) => { slide.hidden = slide.dataset.gallerySlide !== thumb.dataset.galleryThumb; });
        thumb.setAttribute('aria-selected', 'true');
      }));
    });

    const viewRoot = $('[data-products]');
    $$('[data-view]').forEach((button) => button.addEventListener('click', () => {
      $$('[data-view]').forEach((item) => item.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      viewRoot?.setAttribute('data-view', button.dataset.view);
    }));

    $('#product-filter')?.addEventListener('change', (event) => {
      const url = new URL(window.location.href);
      url.searchParams.set('sort', event.target.value);
      window.location.assign(url.toString());
    });

    $('salla-product-options')?.addEventListener('changed', (event) => {
      const detail = event.detail?.detail || event.detail || {};
      const image = detail.image?.url || detail.image;
      const activeImage = $('[data-gallery-slide]:not([hidden]) img, .v-gallery__main > img');
      if (image && activeImage) activeImage.src = image;
      const addButton = $('salla-add-product-button[product-id]');
      const unavailable = detail.is_available === false || detail.is_out_of_stock === true || detail.out_of_stock === true;
      if (addButton) addButton.toggleAttribute('disabled', unavailable);
    });

    $('[data-page-index]')?.addEventListener('change', (event) => {
      if (event.target.value) window.location.assign(event.target.value);
    });

    const addedMessage = document.documentElement.lang === 'ar' ? 'أُضيف إلى السلة' : 'Added to bag';
    if (window.salla?.cart?.event?.onItemAdded) salla.cart.event.onItemAdded(() => showToast(addedMessage));
    else if (window.salla?.event) salla.event.on('cart::item.added', () => showToast(addedMessage));
  };

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();
