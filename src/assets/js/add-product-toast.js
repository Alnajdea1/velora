(() => {
  'use strict';

  const init = () => {
    const host = document.querySelector('salla-add-product-toast');
    if (!host || host.dataset.toastBound === 'true') return;

    host.setAttribute('aria-live', 'polite');
    host.setAttribute('aria-atomic', 'true');
    let dismissTimer;

    const show = () => {
      const message = host.dataset.message || '';
      if (!message) return;

      const toast = document.createElement('div');
      toast.className = 'v-toast';
      toast.setAttribute('role', 'status');
      toast.textContent = message;
      host.replaceChildren(toast);

      window.clearTimeout(dismissTimer);
      dismissTimer = window.setTimeout(() => toast.remove(), 3200);
    };

    host.show = show;
    const bind = () => {
      if (host.dataset.toastBound === 'true') return true;
      if (window.salla?.cart?.event?.onItemAdded) {
        window.salla.cart.event.onItemAdded(show);
      } else if (window.salla?.event) {
        window.salla.event.on('cart::item.added', show);
      } else {
        return false;
      }
      host.dataset.toastBound = 'true';
      return true;
    };

    if (!bind()) {
      let attempts = 0;
      const retry = window.setInterval(() => {
        attempts += 1;
        if (bind() || attempts >= 30) window.clearInterval(retry);
      }, 100);
    }
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init, { once: true })
    : init();
})();
