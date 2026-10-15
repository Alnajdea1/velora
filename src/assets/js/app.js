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





