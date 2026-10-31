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

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.reduceMotion === 'true';
    if (!reducedMotion) {
      const movingSections = $$('[data-component]').filter((section) => section.querySelector(':scope > .v-wrap'));
      movingSections.forEach((section) => section.classList.add('v-motion-ready'));
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.dataset.inView = 'true';
            observer.unobserve(entry.target);
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
        movingSections.forEach((section) => observer.observe(section));
      } else movingSections.forEach((section) => { section.dataset.inView = 'true'; });

      $$('[data-hero-motion]').forEach((hero) => {
        const reset = () => {
          hero.style.setProperty('--hero-x', '0px');
          hero.style.setProperty('--hero-y', '0px');
          hero.style.setProperty('--hero-x-reverse', '0px');
          hero.style.setProperty('--hero-y-reverse', '0px');
        };
        hero.addEventListener('pointermove', (event) => {
          if (event.pointerType === 'touch') return;
          const bounds = hero.getBoundingClientRect();
          const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 14;
          const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 12;
          hero.style.setProperty('--hero-x', `${x.toFixed(2)}px`);
          hero.style.setProperty('--hero-y', `${y.toFixed(2)}px`);
          hero.style.setProperty('--hero-x-reverse', `${(-x * 0.65).toFixed(2)}px`);
          hero.style.setProperty('--hero-y-reverse', `${(-y * 0.65).toFixed(2)}px`);
        }, { passive: true });
        hero.addEventListener('pointerleave', reset, { passive: true });
      });
    }

    const guaranteedGift = $('[data-gift-fallback="true"]');
    const editorGift = $('[data-component="gift-composer"]:not([data-gift-fallback])');
    if (guaranteedGift && editorGift) guaranteedGift.remove();

    const onSallaReady = (callback) => {
      if (!window.salla) return;
      if (typeof salla.onReady === 'function') salla.onReady(callback);
      else callback();
    };
    const productApi = () => window.salla?.api?.product || window.salla?.product?.api;
    const amountOf = (value) => Number(Array.isArray(value) ? (value[0]?.amount ?? value[0]) : (value && typeof value === 'object' ? value.amount : value)) || 0;
    const money = (amount) => {
      try { if (window.salla?.money) return salla.money(amount); } catch {}
      return new Intl.NumberFormat(document.documentElement.lang || 'ar').format(amount);
    };

    // Hidden tab panels keep their product lists in <template> until first opened.
    const openPanel = (panel) => {
      $$('template[data-velora-lazy]', panel).forEach((template) => template.replaceWith(template.content.cloneNode(true)));
    };
    const bindTabs = (root, tabAttr, panelAttr, stateAttr) => {
      $$(`[${tabAttr}]`, root).forEach((tab) => tab.addEventListener('click', () => {
        $$(`[${tabAttr}]`, root).forEach((item) => item.setAttribute(stateAttr, 'false'));
        $$(`[${panelAttr}]`, root).forEach((panel) => {
          panel.hidden = panel.getAttribute(panelAttr) !== tab.getAttribute(tabAttr);
          if (!panel.hidden) openPanel(panel);
        });
        tab.setAttribute(stateAttr, 'true');
      }));
    };
    $$('[data-component="aura-explorer"]').forEach((root) => bindTabs(root, 'data-aura', 'data-aura-panel', 'aria-selected'));
    $$('[data-component="mood-shopping"]').forEach((root) => bindTabs(root, 'data-mood', 'data-mood-panel', 'aria-pressed'));

    $$('[data-component="routine-path"]').forEach((root) => {
      $$('[data-step]', root).forEach((step) => $('button', step)?.addEventListener('click', () => {
        $$('.v-path__node', root).forEach((node) => node.setAttribute('aria-current', 'false'));
        $('button', step).setAttribute('aria-current', 'true');
      }));
    });

    // A picked category with no products falls back to the store's latest products;
    // a section that only lists products is left out when the store has none to show.
    document.addEventListener('productsFetched', (event) => {
      const list = event.target;
      const products = event.detail?.data;
      if (!Array.isArray(products) || products.length || !list?.matches?.('salla-products-list')) return;
      if (!list.hasAttribute('data-velora-fallback')) {
        const section = list.closest('[data-hide-when-empty]');
        if (section) section.hidden = true;
        return;
      }
      const next = document.createElement('salla-products-list');
      ['class', 'limit', 'product-card-component', 'sort-by'].forEach((name) => {
        if (list.hasAttribute(name)) next.setAttribute(name, list.getAttribute(name));
      });
      next.setAttribute('source', list.dataset.veloraFallback);
      list.replaceWith(next);
    });

    // Category tiles without a picked category take the store's own first categories.
    const autoTiles = $$('[data-component="botanical-categories"] [data-category-auto]');
    if (autoTiles.length) onSallaReady(async () => {
      try {
        const response = await productApi()?.categories?.();
        const taken = new Set($$('[data-component="botanical-categories"] .v-botanical__card:not([data-category-auto])').map((tile) => tile.href));
        const queue = (Array.isArray(response?.data) ? response.data : []).filter((category) => category?.url && category?.name && !taken.has(category.url));
        autoTiles.forEach((tile) => {
          if (!tile.hasAttribute('data-title-auto')) return;
          const category = queue.shift();
          if (!category) return;
          tile.href = category.url;
          const title = $('strong', tile);
          if (title) title.textContent = category.name;
          const image = category.image?.url || (typeof category.image === 'string' ? category.image : '');
          const artwork = $('img', tile);
          if (image && artwork && tile.hasAttribute('data-image-auto')) artwork.src = image;
        });
      } catch {}
    });

    if (window.salla?.event?.on) salla.event.on('salla-products-slider::products.fetched', (items) => {
      if (Array.isArray(items) && !items.length) $$('[data-component="products-slider"]').forEach((section) => { if (!$('.v-product', section)) section.hidden = true; });
    });

    // Testimonials appear only once the store has real reviews to show.
    $$('[data-component="testimonials"]').forEach((root) => {
      const reviews = $('salla-reviews', root);
      if (!reviews) return;
      const sync = () => {
        const loaded = Boolean(reviews.querySelector('.s-reviews-container'));
        root.hidden = !loaded;
        return loaded;
      };
      if (!sync()) new MutationObserver((records, observer) => { if (sync()) observer.disconnect(); }).observe(reviews, { childList: true, subtree: true });
    });

    // Without merchant images, the hero and the offer tiles show the store's own newest products.
    const heroArt = $('[data-hero-product]');
    const offerTiles = $$('[data-offer-auto]');
    if (heroArt || offerTiles.length) onSallaReady(async () => {
      let products = [];
      try {
        const response = await productApi()?.fetch?.({ source: 'latest', limit: 8 });
        products = (Array.isArray(response?.data) ? response.data : []).filter((product) => product?.url && (product.image?.url || product.images?.[0]?.url));
      } catch {}
      const imageOf = (product) => product.image?.url || product.images?.[0]?.url;
      if (heroArt && products[0]) {
        const product = products[0];
        const image = $('.v-hero__arch > img', heroArt);
        if (image) {
          image.src = imageOf(product);
          image.alt = product.image?.alt || product.name || image.alt;
          image.classList.replace('v-hero__artwork', 'v-hero__product');
        }
        const pick = $('[data-pick-auto]', heroArt);
        if (pick) {
          const name = $('strong', pick);
          if (name) name.textContent = product.name || name.textContent;
          const link = $('a', pick);
          if (link) link.href = product.url;
        }
      }
      // Offer tiles prefer products the hero is not already showing.
      const pool = products.length > offerTiles.length ? products.slice(1) : products;
      offerTiles.forEach((tile, index) => {
        const product = pool[index];
        if (!product) return;
        tile.href = product.url;
        const photo = document.createElement('img');
        photo.src = imageOf(product);
        photo.alt = '';
        photo.loading = 'lazy';
        tile.prepend(photo);
        tile.classList.add('v-offer__tile--photo');
        const label = $('span', tile);
        if (label && product.name) label.textContent = product.name;
      });
    });

    $$('[data-component="gift-composer"]').forEach((root) => {
      const chosen = new Map();
      const max = Number(root.dataset.maxItems || 3);
      const wrap = Number(root.dataset.wrapPrice || 0);
      const items = $('[data-gift-items]', root);
      const total = $('[data-gift-total]', root);
      const list = $('[data-gift-chosen]', root);
      const add = $('[data-gift-add]', root);
      const render = () => {
        list.replaceChildren(...[...chosen.values()].map((item) => {
          const label = document.createElement('span');
          label.textContent = item.label;
          return label;
        }));
        total.textContent = chosen.size ? money([...chosen.values()].reduce((sum, item) => sum + item.price, wrap)) : '—';
        add.disabled = !chosen.size;
      };
      const bindItem = (button) => button.addEventListener('click', () => {
        const id = button.dataset.giftItem;
        if (chosen.has(id)) chosen.delete(id);
        else if (chosen.size < max) chosen.set(id, { label: button.textContent.trim(), price: Number(button.dataset.price || 0), url: button.dataset.url || '' });
        button.setAttribute('aria-pressed', String(chosen.has(id)));
        render();
      });
      $$('[data-gift-item]', root).forEach(bindItem);

      if (items?.dataset.giftSource) onSallaReady(async () => {
        let products = [];
        try {
          const response = await productApi()?.fetch?.({ source: items.dataset.giftSource, limit: 6 });
          products = Array.isArray(response?.data) ? response.data : [];
        } catch {}
        items.replaceChildren(...products.filter((product) => product?.id && product?.name).map((product) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'v-chip';
          button.dataset.giftItem = String(product.id);
          button.dataset.price = String(amountOf(product.is_on_sale ? (product.sale_price ?? product.price) : product.price));
          if (product.url) button.dataset.url = product.url;
          button.setAttribute('aria-pressed', 'false');
          button.textContent = product.name;
          bindItem(button);
          return button;
        }));
        // No store products to compose a gift from: leave the section out rather than show a notice.
        if (!items.children.length) root.hidden = true;
      });

      $$('[data-gift-shape]', root).forEach((button) => button.addEventListener('click', () => {
        $$('[data-gift-shape]', root).forEach((item) => item.setAttribute('aria-pressed', 'false'));
        button.setAttribute('aria-pressed', 'true');
        $('[data-gift-box]', root).dataset.shape = button.dataset.giftShape;
      }));

      add?.addEventListener('click', async () => {
        if (!window.salla?.cart?.quickAdd) { window.location.assign(root.dataset.fallbackUrl); return; }
        add.disabled = true;
        try {
          for (const [id, item] of chosen) {
            try { await salla.cart.quickAdd(Number(id), 1); }
            catch { if (item.url) { window.location.assign(item.url); return; } }
          }
          if (!document.querySelector('salla-add-product-toast')) showToast(root.dataset.addedText || '');
        } finally { add.disabled = !chosen.size; }
      });
    });

    document.addEventListener('click', async (event) => {
      const opener = event.target.closest('[data-open]');
      if (opener) setOverlay(opener.dataset.open, true);

      const languageSwitcher = event.target.closest('[data-language-switch]');
      if (languageSwitcher) {
        event.preventDefault();
        event.stopPropagation();
        const targetLanguage = String(languageSwitcher.dataset.languageSwitch || 'en')
          .slice(0, 2)
          .toLowerCase();
        languageSwitcher.disabled = true;
        try {
          if (window.VeloraLocale?.switchTo) await window.VeloraLocale.switchTo(targetLanguage);
        } finally {
          languageSwitcher.disabled = false;
        }
        return;
      }

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
        try { await salla.cart.deleteItem(Number(remove.dataset.removeCart)); }
        catch { remove.disabled = false; }
      }

      const card = event.target.closest('[data-card-url]');
      const interactive = event.target.closest('a,button,input,select,textarea,salla-button,salla-add-product-button,[role="button"]');
      if (card && !interactive && card.dataset.cardUrl) window.location.assign(card.dataset.cardUrl);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') $$('[data-overlay]:not([hidden])').forEach((overlay) => setOverlay(overlay.dataset.overlay, false));
      const card = event.target.closest('[data-card-url]');
      if (card && event.target === card && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        window.location.assign(card.dataset.cardUrl);
      }
    });

    $$('[data-gallery]').forEach((root) => {
      $$('[data-gallery-thumb]', root).forEach((thumb) => thumb.addEventListener('click', () => {
        $$('[data-gallery-thumb]', root).forEach((item) => item.setAttribute('aria-selected', 'false'));
        $$('[data-gallery-slide]', root).forEach((slide) => {
          slide.hidden = slide.dataset.gallerySlide !== thumb.dataset.galleryThumb;
          if (slide.hidden) $('video', slide)?.pause();
        });
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

    const optionPicker = $('salla-product-options');
    const productForm = $('#product-form');
    const productButton = $('salla-add-product-button[product-id]');
    const syncOptionPrice = () => {
      if (!productForm || !window.salla?.product?.getPrice) return;
      const isComplete = Array.from(productForm.elements).every((element) => !element.willValidate || element.validity.valid);
      if (isComplete) salla.product.getPrice(new FormData(productForm)).catch(() => {});
    };
    optionPicker?.addEventListener('changed', (event) => {
      const payload = event.detail?.detail || event.detail || {};
      const selectedDetail = payload.detail || payload;
      const image = selectedDetail.image?.url || selectedDetail.image;
      const gallery = $('[data-gallery]');
      if (image && gallery) {
        const slides = $$('[data-gallery-slide]', gallery);
        const primarySlide = slides[0];
        if (primarySlide) {
          let variantImage = $('img[data-variant-image]', primarySlide);
          if (!variantImage) {
            primarySlide.replaceChildren();
            variantImage = document.createElement('img');
            variantImage.dataset.variantImage = 'true';
            variantImage.alt = document.querySelector('.v-product-title')?.textContent?.trim() || '';
            variantImage.loading = 'eager';
            primarySlide.append(variantImage);
          }
          variantImage.src = image;
          slides.forEach((slide, index) => { slide.hidden = index !== 0; });
          $$('[data-gallery-thumb]', gallery).forEach((thumb, index) => thumb.setAttribute('aria-selected', index === 0 ? 'true' : 'false'));
        }
      }
      optionPicker?.hasOutOfStockOption?.().then((unavailable) => {
        if (productButton) productButton.hasOutOfStockOption = Boolean(unavailable);
      });
      syncOptionPrice();
    });

    if (window.salla?.product?.event?.onPriceUpdated) {
      salla.product.event.onPriceUpdated((response, productId) => {
        const expectedId = $('#product-form input[name="id"]')?.value;
        if (productId && expectedId && String(productId) !== String(expectedId)) return;
        const data = response?.data;
        const price = Number(data?.price);
        const regularPrice = Number(data?.regular_price);
        if (!Number.isFinite(price)) return;
        const hasSalePrice = Boolean(data.has_sale_price) && Number.isFinite(regularPrice) && regularPrice > price;
        const currentPrice = $('[data-current-price]');
        const comparePrice = $('[data-regular-price]');
        const discountBadge = $('[data-discount-badge]');
        const startingLabel = $('[data-starting-price]');
        const priceRoot = $('[data-product-price]');
        const unavailableMessage = $('[data-product-unavailable]');
        if (currentPrice) currentPrice.textContent = salla.money(price);
        if (comparePrice) {
          comparePrice.textContent = salla.money(regularPrice);
          comparePrice.hidden = !hasSalePrice;
        }
        if (discountBadge) {
          const percentage = hasSalePrice ? Math.round((1 - price / regularPrice) * 100) : 0;
          discountBadge.textContent = percentage ? `−${new Intl.NumberFormat(document.documentElement.lang).format(percentage)}%` : '';
          discountBadge.hidden = !percentage;
        }
        if (startingLabel) startingLabel.hidden = true;
        if (priceRoot) priceRoot.hidden = false;
        if (unavailableMessage) unavailableMessage.hidden = true;
        if (productButton) {
          productButton.setAttribute('amount', String(price));
          productButton.hasOutOfStockOption = false;
        }
      });
    }
    if (window.salla?.event) {
      salla.event.on('product::price.updated.failed', () => {
        const priceRoot = $('[data-product-price]');
        const unavailableMessage = $('[data-product-unavailable]');
        if (priceRoot) priceRoot.hidden = true;
        if (unavailableMessage) unavailableMessage.hidden = false;
        if (productButton) productButton.hasOutOfStockOption = true;
      });
    }
    $('[data-page-index]')?.addEventListener('change', (event) => {
      if (event.target.value) window.location.assign(event.target.value);
    });

    if (!document.querySelector('salla-add-product-toast')) {
      const addedMessage = () => document.documentElement.lang === 'ar' ? 'أُضيف إلى السلة' : 'Added to bag';
      if (window.salla?.cart?.event?.onItemAdded) salla.cart.event.onItemAdded(() => showToast(addedMessage()));
      else if (window.salla?.event) salla.event.on('cart::item.added', () => showToast(addedMessage()));
    }
  };

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
})();





