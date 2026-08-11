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

  const waitForProductsApi = async () => {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      if (window.salla?.product?.fetch) return true;
      await new Promise((resolve) => window.setTimeout(resolve, 100));
    }
    return false;
  };

  const formatMoney = (value, currency = 'SAR') => {
    const locale = document.documentElement.lang || 'ar';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const hydrateDemoCards = async () => {
    const cards = $$('[data-demo-card]');
    if (!cards.length || !(await waitForProductsApi())) return;

    try {
      const response = await salla.product.fetch({
        source: 'latest',
        source_value: '',
        limit: Math.min(cards.length, 50),
        includes: ['brand', 'rating'],
        with: ['images'],
      });
      const products = response?.data || [];
      if (!products.length) return;

      cards.forEach((card, index) => {
        const product = products[index % products.length];
        const imageUrl = product.image?.url || product.images?.[0]?.url;
        const price = product.is_on_sale && product.sale_price ? product.sale_price : product.price;
        const rating = product.rating?.starts ?? product.rating?.rate ?? 0;
        const media = $('.v-product__media', card);
        const wishlist = $('[data-demo-wishlist]', card);
        const quickAdd = $('[data-demo-quickadd]', card);
        const oldPrice = $('[data-demo-old]', card);

        card.dataset.cardUrl = product.url || card.dataset.cardUrl;
        card.dataset.productId = String(product.id);

        if (wishlist) {
          wishlist.dataset.productId = String(product.id);
          wishlist.setAttribute('aria-pressed', String(Boolean(product.is_in_wishlist)));
          wishlist.textContent = product.is_in_wishlist ? '♥' : '♡';
        }

        if (quickAdd) {
          quickAdd.dataset.productId = String(product.id);
          quickAdd.disabled = product.is_available === false;
        }

        if (imageUrl && media) {
          let image = $('.v-demo-real-image', media);
          if (!image) {
            image = document.createElement('img');
            image.className = 'v-demo-real-image';
            media.prepend(image);
          }
          image.src = imageUrl;
          image.alt = product.image?.alt || product.name || '';
          $('.v-bottle--card', media)?.setAttribute('hidden', '');
        }

        const brand = $('[data-demo-brand]', card);
        const ratingNode = $('[data-demo-rating]', card);
        const name = $('[data-demo-name]', card);
        const subtitle = $('[data-demo-subtitle]', card);
        const priceNode = $('[data-demo-price]', card);
        const notes = $('[data-demo-notes]', card);

        if (brand) brand.textContent = product.brand?.name || product.category?.name || 'VELORA';
        if (ratingNode) ratingNode.textContent = `★ ${Number(rating).toFixed(1)}`;
        if (name) name.textContent = product.name || name.textContent;
        if (subtitle) subtitle.textContent = product.subtitle || subtitle.textContent;
        if (priceNode) priceNode.textContent = formatMoney(price, product.currency || 'SAR');
        if (notes && product.description) {
          const plainDescription = product.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          if (plainDescription) notes.textContent = plainDescription.slice(0, 90);
        }

        if (oldPrice) {
          const showOldPrice = product.is_on_sale && product.regular_price > price;
          oldPrice.hidden = !showOldPrice;
          if (showOldPrice) oldPrice.textContent = formatMoney(product.regular_price, product.currency || 'SAR');
        }
      });
    } catch {
      // Keep the approved visual demo cards if live products are unavailable in the editor.
    }
  };

  const init = () => {
    const header = $('[data-component="header"]');
    const syncHeader = () => header?.setAttribute('data-scrolled', String(window.scrollY > 18));
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

    document.addEventListener('click', async (event) => {
      const demoQuickAdd = event.target.closest('[data-demo-quickadd]');
      if (demoQuickAdd) {
        event.preventDefault();
        event.stopPropagation();
        const productId = Number(demoQuickAdd.dataset.productId || 0);
        if (!productId || !window.salla?.cart?.quickAdd) {
          window.location.assign(demoQuickAdd.dataset.fallbackUrl);
          return;
        }
        demoQuickAdd.disabled = true;
        try {
          await salla.cart.quickAdd(productId);
          showToast(demoQuickAdd.textContent.trim());
        } finally { demoQuickAdd.disabled = false; }
        return;
      }

      const demoWishlist = event.target.closest('[data-demo-wishlist]');
      if (demoWishlist) {
        event.preventDefault();
        event.stopPropagation();
        const productId = Number(demoWishlist.dataset.productId || 0);

        if (!productId || !window.salla?.wishlist?.toggle) {
          window.location.assign(demoWishlist.dataset.fallbackUrl);
          return;
        }

        demoWishlist.disabled = true;
        try {
          await salla.wishlist.toggle(productId);
          const selected = demoWishlist.getAttribute('aria-pressed') !== 'true';
          demoWishlist.setAttribute('aria-pressed', String(selected));
          demoWishlist.textContent = selected ? '♥' : '♡';
        } finally {
          demoWishlist.disabled = false;
        }
        return;
      }

      const opener = event.target.closest('[data-open]');
      if (opener) setOverlay(opener.dataset.open, true);

      const languageSwitcher = event.target.closest('[data-language-switch]');
      if (languageSwitcher) {
        event.preventDefault();
        const targetLanguage = languageSwitcher.dataset.languageSwitch;
        const sallaApi = window.salla || window.Salla;
        const currentLanguage = String(
          sallaApi?.config?.get?.('user.language_code') || document.documentElement.lang || 'ar'
        ).slice(0, 2);
        languageSwitcher.disabled = true;

        try {
          const languages = await sallaApi?.config?.languages?.();
          const target = languages?.find((language) => {
            const code = String(language.code || language.iso_code || '').slice(0, 2).toLowerCase();
            return code === targetLanguage;
          });

          if (target?.url) {
            sallaApi?.cookie?.set?.('s-lang', targetLanguage);
            window.location.assign(target.url);
            return;
          }
        } catch {
          // Fall back to Salla's language query parameter if the languages API is unavailable.
        }

        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set('lang', targetLanguage);
        if (currentLanguage && currentLanguage !== targetLanguage) {
          nextUrl.pathname = nextUrl.pathname.replace(
            new RegExp(`/${currentLanguage}(?=/|$)`),
            `/${targetLanguage}`
          );
        }

        sallaApi?.cookie?.set?.('s-lang', targetLanguage);
        window.location.assign(nextUrl.toString());
        languageSwitcher.disabled = false;
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
        try { await salla.cart.deleteItem(remove.dataset.removeCart); }
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

    hydrateDemoCards();

    $$('[data-offer-countdown]').forEach((section) => {
      let remaining = (2 * 24 * 60 * 60) + (11 * 60 * 60) + (48 * 60) + 20;
      const units = {
        days: $('[data-countdown-unit="days"]', section),
        hours: $('[data-countdown-unit="hours"]', section),
        minutes: $('[data-countdown-unit="minutes"]', section),
        seconds: $('[data-countdown-unit="seconds"]', section),
      };
      const localize = (value) => new Intl.NumberFormat(document.documentElement.lang || 'ar', { minimumIntegerDigits: 2, useGrouping: false }).format(value);
      const render = () => {
        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;
        if (units.days) units.days.textContent = localize(days);
        if (units.hours) units.hours.textContent = localize(hours);
        if (units.minutes) units.minutes.textContent = localize(minutes);
        if (units.seconds) units.seconds.textContent = localize(seconds);
      };
      render();
      window.setInterval(() => { remaining = Math.max(0, remaining - 1); render(); }, 1000);
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
        else if (chosen.size < max) chosen.set(id, { label:button.textContent.trim(), price:Number(button.dataset.price || 0), demo:button.dataset.demoGift === 'true' });
        button.setAttribute('aria-pressed', String(chosen.has(id)));
        render();
      }));
      $$('[data-gift-shape]', root).forEach((button) => button.addEventListener('click', () => {
        $$('[data-gift-shape]', root).forEach((item) => item.setAttribute('aria-pressed', 'false'));
        button.setAttribute('aria-pressed', 'true');
        $('[data-gift-box]', root).dataset.shape = button.dataset.giftShape;
      }));
      add?.addEventListener('click', async () => {
        if ([...chosen.values()].some((item) => item.demo)) {
          window.location.assign(root.dataset.fallbackUrl);
          return;
        }
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
