(() => {
  'use strict';

  const PAIRS = __LOCALE_PAIRS__;
  const ATTRIBUTES = ['placeholder', 'aria-label', 'title'];
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'IFRAME', 'CODE', 'PRE']);
  const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
  const LATIN_DIGITS = '0123456789';
  const exact = { ar: new Map(), en: new Map() };

  const normalize = (value) => String(value ?? '').trim().replace(/\s+/g, ' ');
  PAIRS.forEach(([arabic, english]) => {
    exact.en.set(normalize(arabic), english);
    exact.ar.set(normalize(english), arabic);
  });

  const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const compileTemplate = (source, target) => {
    const tokenPattern = /\{([^}]+)\}|:([A-Za-z_][A-Za-z0-9_]*)/g;
    const names = [];
    let pattern = '^';
    let lastIndex = 0;
    let match;
    while ((match = tokenPattern.exec(source))) {
      pattern += escapeRegExp(source.slice(lastIndex, match.index)) + '(.+?)';
      names.push(match[1] || match[2]);
      lastIndex = match.index + match[0].length;
    }
    if (!names.length) return null;
    pattern += escapeRegExp(source.slice(lastIndex)) + '$';
    return { regex: new RegExp(pattern, 'u'), names, target };
  };

  const templates = { ar: [], en: [] };
  PAIRS.forEach(([arabic, english]) => {
    const toEnglish = compileTemplate(normalize(arabic), english);
    const toArabic = compileTemplate(normalize(english), arabic);
    if (toEnglish) templates.en.push(toEnglish);
    if (toArabic) templates.ar.push(toArabic);
  });

  const tokenPairs = [
    ['المقاس', 'Size'], ['الطول', 'Length'], ['الكم', 'Sleeve'], ['الخامة', 'Fabric'],
    ['اللون', 'Color'], ['السعر', 'Price'], ['منتجات', 'products'], ['منتج', 'product'],
    ['ر.س', 'SAR'], ['ريال', 'SAR']
  ];

  const convertNumerals = (value, locale) => String(value).replace(/[٠-٩0-9]/g, (digit) => {
    if (locale === 'en') {
      const index = ARABIC_DIGITS.indexOf(digit);
      return index >= 0 ? LATIN_DIGITS[index] : digit;
    }
    const index = LATIN_DIGITS.indexOf(digit);
    return index >= 0 ? ARABIC_DIGITS[index] : digit;
  });

  const translateCore = (value, locale) => {
    const normalized = normalize(value);
    if (!normalized) return value;

    let translated = exact[locale].get(normalized);
    if (!translated) {
      for (const template of templates[locale]) {
        const match = normalized.match(template.regex);
        if (!match) continue;
        const replacements = Object.fromEntries(template.names.map((name, index) => [name, match[index + 1]]));
        translated = template.target.replace(/\{([^}]+)\}|:([A-Za-z_][A-Za-z0-9_]*)/g, (_, braced, named) => replacements[braced || named] ?? '');
        break;
      }
    }

    let output = translated || normalized;
    if (!translated) {
      tokenPairs.forEach(([arabic, english]) => {
        output = output.split(locale === 'en' ? arabic : english).join(locale === 'en' ? english : arabic);
      });
    }
    output = convertNumerals(output, locale);
    if (locale === 'en') output = output.replace(/ر\.\s*س\.?/g, 'SAR');
    else output = output.replace(/\bSAR\b/g, 'ر.س');
    return output;
  };

  const translateValue = (value, locale) => {
    const raw = String(value ?? '');
    const leading = raw.match(/^\s*/)?.[0] || '';
    const trailing = raw.match(/\s*$/)?.[0] || '';
    const core = raw.slice(leading.length, raw.length - trailing.length || undefined);
    if (!normalize(core)) return raw;
    return `${leading}${translateCore(core, locale)}${trailing}`;
  };

  let activeLocale = 'ar';
  let applying = false;

  const translateRoot = (root, locale = activeLocale) => {
    if (!root || applying) return;
    applying = true;
    try {
      const translateTextNode = (node) => {
        if (!node.parentElement || SKIP_TAGS.has(node.parentElement.tagName) || node.parentElement.closest('[data-no-translate]')) return;
        const next = translateValue(node.nodeValue, locale);
        if (next !== node.nodeValue) node.nodeValue = next;
      };

      if (root.nodeType === Node.TEXT_NODE) translateTextNode(root);
      const element = root.nodeType === Node.ELEMENT_NODE ? root : root.parentElement;
      if (!element || SKIP_TAGS.has(element.tagName)) return;

      ATTRIBUTES.forEach((attribute) => {
        if (!element.hasAttribute(attribute)) return;
        const current = element.getAttribute(attribute);
        const next = translateValue(current, locale);
        if (next !== current) element.setAttribute(attribute, next);
      });

      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) translateTextNode(node);

      element.querySelectorAll('*').forEach((child) => {
        if (SKIP_TAGS.has(child.tagName) || child.closest('[data-no-translate]')) return;
        ATTRIBUTES.forEach((attribute) => {
          if (!child.hasAttribute(attribute)) return;
          const current = child.getAttribute(attribute);
          const next = translateValue(current, locale);
          if (next !== current) child.setAttribute(attribute, next);
        });
      });
    } finally {
      applying = false;
    }
  };

  const syncControls = (locale) => {
    document.querySelectorAll('[data-language-switch]').forEach((button) => {
      const target = locale === 'ar' ? 'en' : 'ar';
      const label = target === 'en' ? 'EN' : 'AR';
      const ariaLabel = target === 'en' ? 'English' : 'العربية';
      if (button.dataset.languageSwitch !== target) button.dataset.languageSwitch = target;
      if (button.textContent.trim() !== label) button.textContent = label;
      if (button.getAttribute('aria-label') !== ariaLabel) button.setAttribute('aria-label', ariaLabel);
      if (button.disabled) button.disabled = false;
      if (button.dataset.veloraLocaleBound !== 'true') {
        button.dataset.veloraLocaleBound = 'true';
        button.addEventListener('click', async (event) => {
          event.preventDefault();
          event.stopPropagation();
          const nextLocale = String(button.dataset.languageSwitch || 'en').slice(0, 2).toLowerCase();
          button.disabled = true;
          try {
            await switchTo(nextLocale);
          } finally {
            button.disabled = false;
          }
        });
      }
    });
  };

  const applyLocale = (locale, options = {}) => {
    activeLocale = locale === 'en' ? 'en' : 'ar';
    const root = document.documentElement;
    root.lang = activeLocale;
    root.dir = activeLocale === 'ar' ? 'rtl' : 'ltr';
    root.dataset.veloraLocale = activeLocale;
    if (document.body) {
      document.body.dir = root.dir;
      document.body.dataset.locale = activeLocale;
    }
    translateRoot(document.body || root, activeLocale);
    syncControls(activeLocale);

    if (options.persist !== false) {
      try { window.localStorage.setItem('velora-locale', activeLocale); } catch {}
      const url = new URL(window.location.href);
      url.searchParams.set('lang', activeLocale);
      window.history.replaceState(window.history.state, '', url.toString());
      const api = window.salla || window.Salla;
      api?.cookie?.set?.('s-lang', activeLocale);
    }
    window.dispatchEvent(new CustomEvent('velora:locale-changed', { detail: { locale: activeLocale } }));
    return activeLocale;
  };

  const switchTo = (locale) => {
    const target = locale === 'en' ? 'en' : 'ar';
    // Apply the complete client-side locale immediately. Waiting for Salla's
    // optional languages endpoint can leave the control disabled indefinitely
    // in preview stores that expose only one server locale.
    applyLocale(target);
    return Promise.resolve('client');
  };

  const serverLocale = String(document.documentElement.lang || 'ar').slice(0, 2).toLowerCase();
  const queryLocale = new URL(window.location.href).searchParams.get('lang');
  let storedLocale = null;
  try { storedLocale = window.localStorage.getItem('velora-locale'); } catch {}
  const initialLocale = ['ar', 'en'].includes(String(queryLocale).toLowerCase())
    ? String(queryLocale).toLowerCase()
    : (['ar', 'en'].includes(String(storedLocale).toLowerCase()) ? String(storedLocale).toLowerCase() : serverLocale);

  window.VeloraLocale = { apply: applyLocale, switchTo, get current() { return activeLocale; } };
  applyLocale(initialLocale, { persist: false });

  const observer = new MutationObserver((mutations) => {
    if (applying) return;
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => translateRoot(node));
      if (mutation.type === 'attributes') translateRoot(mutation.target);
    });
    syncControls(activeLocale);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ATTRIBUTES });
})();


