/* ═══ Ramz — one scroll, one timeline ═══
   Every section reads its own progress from a single rAF loop. Nothing here
   animates on a timer: the page moves because the reader moves. Sections that
   pin do it with position:sticky inside a taller track, so the browser keeps
   the scrollbar honest and nothing jumps at the hand-off.

   Reduced motion, or a video that cannot be scrubbed, lands on the same static
   page: everything visible, nothing pinned. */
(function () {
  'use strict';

  var root = document.documentElement;
  var motion = matchMedia('(prefers-reduced-motion: reduce)');
  var still = motion.matches;
  var AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  function clamp(v, a, b) {
    if (a === undefined) a = 0;
    if (b === undefined) b = 1;
    return v < a ? a : v > b ? b : v;
  }
  function smoothstep(a, b, v) {
    if (b === a) return v < a ? 0 : 1;
    var t = clamp((v - a) / (b - a));
    return t * t * (3 - 2 * t);
  }
  function band(p, from, to) {
    var fade = Math.max((to - from) * 0.3, 0.03);
    var into = smoothstep(from, from + fade, p);
    var out = to >= 0.999 ? 1 : 1 - smoothstep(to - fade, to, p);
    return { a: Math.min(into, out), into: into, out: out };
  }
  function digits(s) {
    return window.RAMZ && RAMZ.lang === 'ar'
      ? String(s).replace(/[0-9]/g, function (d) { return AR_DIGITS[+d]; })
      : String(s);
  }

  /* ── The loop ─────────────────────────────────────
     Scenes register a measure hook and a frame(progress). Measuring happens on
     resize only; the loop itself never reads layout. */
  var scenes = [];
  var ticking = false;

  function scene(el, opts) {
    if (!el) return null;
    var s = {
      el: el,
      span: opts.span || function (m) { return m.height; },
      offset: opts.offset,
      frame: opts.frame,
      onMeasure: opts.onMeasure,
      top: 0, start: 0, length: 1, last: -1
    };
    scenes.push(s);
    return s;
  }

  function measure() {
    var vh = window.innerHeight;
    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i];
      var rect = s.el.getBoundingClientRect();
      var m = { top: rect.top + window.scrollY, height: rect.height, vh: vh, width: window.innerWidth };
      if (s.onMeasure) s.onMeasure(m);
      s.top = m.top;
      // Scenes that play as they arrive start one screen earlier.
      s.start = m.top + (s.offset ? s.offset(m) : 0);
      s.length = Math.max(s.span(m), 1);
    }
  }

  function frame() {
    ticking = false;
    var y = window.scrollY;
    var vh = window.innerHeight;
    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i];
      var p = clamp((y - s.start) / s.length);
      var near = s.start - vh * 1.4 < y && y < s.start + s.length + vh * 1.4;
      if (!near && s.last === p) continue;   // still settle the edges, then idle
      s.last = p;
      s.frame(p);
    }
  }

  function request() {
    if (ticking || still) return;
    ticking = true;
    requestAnimationFrame(frame);
  }

  /* ── Chrome: progress rail + nav state ───────────── */
  var rail = document.querySelector('.progress__bar');
  function chrome() {
    var max = root.scrollHeight - window.innerHeight;
    var p = max > 0 ? clamp(window.scrollY / max) : 0;
    if (rail) rail.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    document.body.classList.toggle('scrolled', window.scrollY > 20);
  }

  /* ── Theme ───────────────────────────────────────── */
  var themeButton = document.querySelector('.theme-toggle');
  function syncTheme() {
    var dark = root.dataset.theme === 'dark';
    if (themeButton) themeButton.setAttribute('aria-pressed', String(dark));
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#0C0A0E' : '#F5F1EA';
  }
  if (themeButton) {
    themeButton.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('ramz-theme', root.dataset.theme); } catch (e) {}
      syncTheme();
    });
  }
  syncTheme();

  /* ── Hero ────────────────────────────────────────── */
  (function () {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var mark = hero.querySelector('.hero__mark');
    var inner = hero.querySelector('.hero__inner');
    var cue = hero.querySelector('.hero__cue');

    scene(hero, {
      span: function (m) { return m.height; },
      frame: function (p) {
        // Headline settles back and dims while the watermark drifts the other
        // way, so the two layers separate as the page moves.
        inner.style.transform = 'translate3d(0,' + (p * -60).toFixed(1) + 'px,0)';
        inner.style.opacity = (1 - smoothstep(0.35, 0.92, p)).toFixed(3);
        if (mark) mark.style.transform = 'translate3d(' + (p * 90).toFixed(1) + 'px,' + (p * 40).toFixed(1) + 'px,0)';
        if (cue) cue.style.opacity = (1 - smoothstep(0.02, 0.2, p)).toFixed(3);
      }
    });
  })();

  /* ── Reel: scroll drives the clip's timeline ─────── */
  (function () {
    var section = document.querySelector('.reel');
    if (!section) return;
    var track = section.querySelector('.reel__track');
    var stage = section.querySelector('.reel__stage');
    var video = section.querySelector('.reel__video');
    var box = section.querySelector('.reel__captions');
    var lines = [];
    var ready = false, dead = false, lastSeek = -1, activePos = '';

    function build(d) {
      box.innerHTML = '';
      var total = d.reel.length;
      var slot = 1 / total;
      lines = d.reel.map(function (item, i) {
        var el = document.createElement('p');
        el.className = 'reel__line';
        el.dataset.pos = item.pos;
        el.innerHTML = item.text + (item.sub ? '<span class="reel__sub">' + item.sub + '</span>' : '');
        box.appendChild(el);
        return {
          el: el, pos: item.pos, a: -1,
          from: i * slot + slot * 0.04,
          to: i === total - 1 ? 1 : (i + 1) * slot - slot * 0.12
        };
      });
    }

    function fallback() {
      if (dead) return;
      dead = true;
      section.classList.add('reel--static');
      track.style.height = '';
      stage.removeAttribute('data-pos');
      lines.forEach(function (l) { l.el.style.opacity = ''; l.el.style.transform = ''; });
      if (!still && video.readyState > 0) {
        video.loop = true;
        video.play().catch(function () {});
      }
    }

    build(RAMZ.dict());
    RAMZ.onChange(build);

    scene(section, {
      onMeasure: function (m) {
        if (dead || still) { track.style.height = ''; return; }
        // Scroll distance comes from the clip's own length — roughly a third of
        // a second of footage per 100px — bounded so it never drags.
        var duration = ready && isFinite(video.duration) ? video.duration : 8;
        var perSecond = m.width < 720 ? 210 : 300;
        var span = Math.min(Math.max(duration * perSecond, m.vh * 1.6), m.vh * 3.4);
        track.style.height = Math.round(span + m.vh) + 'px';
        m.height = span + m.vh;
      },
      span: function (m) { return Math.max(m.height - m.vh, 1); },
      frame: function (p) {
        if (dead) return;
        if (ready && !document.hidden) {
          var t = p * Math.max(video.duration - 0.05, 0);
          // Skip while a seek is in flight unless the picture has drifted far
          // enough that it would visibly lag the scroll.
          if (!video.seeking || Math.abs(t - video.currentTime) > 0.25) {
            if (Math.abs(t - lastSeek) > 1 / 60) {
              lastSeek = t;
              try { video.currentTime = t; } catch (e) {}
            }
          }
        }
        var pos = 'none';
        for (var i = 0; i < lines.length; i++) {
          var l = lines[i];
          var b = band(p, l.from, l.to);
          var a = b.a < 0.01 ? 0 : b.a;
          if (Math.abs(a - l.a) > 0.008 || (a === 0 && l.a !== 0)) {
            l.a = a;
            l.el.style.opacity = a;
            l.el.style.transform = 'translate3d(0,' + ((1 - b.into) * 18 - (1 - b.out) * 12).toFixed(1) + 'px,0)';
          }
          if (a > 0.35) pos = l.pos;
        }
        if (pos !== activePos) { activePos = pos; stage.dataset.pos = pos; }
      }
    });

    if (still) return fallback();

    video.addEventListener('loadedmetadata', function () {
      if (!isFinite(video.duration) || !video.duration) return fallback();
      ready = true;
      measure();
      request();
    });
    video.addEventListener('error', fallback);
    setTimeout(function () { if (!ready && video.readyState === 0) fallback(); }, 8000);

    // iOS leaves a video undecoded until it has played once; a muted
    // play/pause on the first interaction unlocks seeking.
    var unlock = function () { video.play().then(function () { video.pause(); }).catch(function () {}); };
    addEventListener('touchstart', unlock, { passive: true, once: true });
    addEventListener('pointerdown', unlock, { passive: true, once: true });
  })();

  /* ── Demo: the conversation is the scrollbar ─────── */
  (function () {
    var section = document.querySelector('.demo');
    if (!section) return;
    var track = section.querySelector('.demo__track');
    var thread = section.querySelector('.phone__thread');
    var composer = section.querySelector('.phone__input');
    var bar = section.querySelector('.bar__fill');
    var pct = section.querySelector('.bar__pct');
    var tiles = {};
    Array.prototype.forEach.call(section.querySelectorAll('[data-key]'), function (el) { tiles[el.dataset.key] = el; });
    var steps = [];
    var values = {};
    var progress = 0;

    function build(d) {
      thread.innerHTML = '';
      var slot = 1 / d.chat.length;
      steps = d.chat.map(function (turn, i) {
        var q = document.createElement('div');
        q.className = 'msg msg--me';
        q.textContent = turn.q;
        var a = document.createElement('div');
        a.className = 'msg msg--bot';
        a.innerHTML = '<span class="msg__src">' + turn.src + '</span><span class="msg__text">' + turn.a + '</span>';
        thread.appendChild(q);
        thread.appendChild(a);
        return { q: q, a: a, hit: turn.hit, from: i * slot, slot: slot, state: -1 };
      });

      values = {};
      Object.keys(d.tiles).forEach(function (key) {
        var t = d.tiles[key];
        var el = tiles[key];
        if (!el) return;
        el.querySelector('.tile__label').textContent = t.label;
        var meta = el.querySelector('.tile__meta');
        meta.textContent = t.meta;
        meta.className = 'tile__meta ' + (t.trend || '');
        values[key] = { el: el.querySelector('.tile__value'), to: t.value, suffix: t.suffix, shown: -1 };
      });
    }

    function paint(p) {
      progress = p;
      var focus = null, live = null;

      for (var i = 0; i < steps.length; i++) {
        var st = steps[i];
        var local = clamp((p - st.from) / st.slot);
        var qOn = local > 0.08;
        var aOn = local > 0.42;                 // the answer lands a beat later
        var state = (qOn ? 1 : 0) + (aOn ? 2 : 0);
        if (state !== st.state) {
          var forward = state > st.state;
          st.state = state;
          st.q.classList.toggle('is-in', qOn);
          st.a.classList.toggle('is-in', aOn);
          // Keep the newest bubble in view; only on a state change, never per frame.
          var anchor = aOn ? st.a : st.q;
          if (forward) thread.scrollTop = anchor.offsetTop + anchor.offsetHeight - thread.clientHeight + 16;
          else thread.scrollTop = Math.max(anchor.offsetTop - 16, 0);
        }
        if (qOn && !aOn) live = st;
        if (aOn && local < 1) focus = st;
        if (aOn) {
          var grow = smoothstep(0.42, 0.78, local);
          for (var h = 0; h < st.hit.length; h++) {
            var v = values[st.hit[h]];
            if (!v) continue;
            var shown = v.to * grow;
            if (Math.abs(shown - v.shown) > v.to / 120) {
              v.shown = shown;
              v.el.textContent = digits(shown.toFixed(String(v.to).indexOf('.') > -1 ? 1 : 0)) + (v.suffix || '');
            }
          }
        }
      }

      var keys = focus ? focus.hit : [];
      Object.keys(tiles).forEach(function (k) { tiles[k].classList.toggle('is-hit', keys.indexOf(k) > -1); });

      var fill = smoothstep(0.55, 0.95, p) * 25;
      if (bar) bar.style.transform = 'scaleX(' + (fill / 100).toFixed(3) + ')';
      if (pct) pct.textContent = digits(Math.round(fill)) + (RAMZ.lang === 'ar' ? '٪' : '%');

      // The composer echoes whichever question is currently on screen.
      var text = live ? live.q.textContent : RAMZ.t('demo.placeholder');
      if (composer.textContent !== text) {
        composer.textContent = text;
        composer.classList.toggle('is-typing', !!live);
      }
    }

    function fillStatic() {
      steps.forEach(function (st) { st.q.classList.add('is-in'); st.a.classList.add('is-in'); });
      Object.keys(values).forEach(function (k) {
        var v = values[k];
        v.el.textContent = digits(v.to) + (v.suffix || '');
      });
      if (bar) bar.style.transform = 'scaleX(.25)';
      if (pct) pct.textContent = digits(25) + (RAMZ.lang === 'ar' ? '٪' : '%');
    }

    build(RAMZ.dict());
    RAMZ.onChange(function (d) {
      build(d);
      if (still) return fillStatic();
      measure();
      paint(progress);
      request();
    });

    scene(section, {
      onMeasure: function (m) {
        if (still) { track.style.height = ''; return; }
        var span = Math.min(Math.max(m.vh * 2.6, 1400), m.vh * 3.4);
        track.style.height = Math.round(span + m.vh) + 'px';
        m.height = span + m.vh;
      },
      span: function (m) { return Math.max(m.height - m.vh, 1); },
      frame: paint
    });

    if (still) fillStatic();
  })();

  /* ── Services: four layers dealt out ─────────────── */
  (function () {
    var section = document.querySelector('.services');
    if (!section) return;
    var track = section.querySelector('.services__track');
    var deck = section.querySelector('.deck');
    var cards = [];

    function build(d) {
      deck.innerHTML = '';
      cards = d.services.map(function (item, i) {
        var card = document.createElement('article');
        card.className = 'card';
        card.innerHTML =
          '<span class="card__num">' + digits('0' + (i + 1)) + '</span>' +
          '<h3 class="card__name">' + item.name + '</h3>' +
          '<p class="card__body">' + item.body + '</p>' +
          '<ul class="ticks">' + item.ticks.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>';
        deck.appendChild(card);
        return { el: card, shown: -9 };
      });
    }

    function paint(p) {
      var n = cards.length;
      // A continuous position rather than an index, so cards glide instead of
      // snapping between states.
      var head = p * (n - 1);          // p=1 leaves the last card in front
      for (var i = 0; i < n; i++) {
        var c = cards[i];
        var d = i - head;                       // <0 done, ~0 front, >0 waiting
        if (Math.abs(d - c.shown) < 0.004) continue;
        c.shown = d;
        var y, scale, opacity, z;
        if (d >= 0) {
          y = Math.min(d, 3) * 22;
          scale = 1 - Math.min(d, 3) * 0.04;
          opacity = d > 3.2 ? 0 : 1;
          z = n - i;
        } else {
          // Leaves upward and clears quickly, so two cards are never both
          // legible at once.
          y = d * 90;
          scale = 1 + d * 0.02;
          opacity = clamp(1 + d * 2.6);
          z = n + i;
        }
        c.el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0) scale(' + clamp(scale, 0.8, 1).toFixed(3) + ')';
        c.el.style.opacity = opacity.toFixed(3);
        c.el.style.zIndex = z;
      }
    }

    build(RAMZ.dict());
    RAMZ.onChange(function (d) {
      build(d);
      if (still) return;
      measure();
      request();
    });

    scene(section, {
      onMeasure: function (m) {
        if (still) { track.style.height = ''; return; }
        var span = Math.min(Math.max(m.vh * 2.2, 1200), m.vh * 3);
        track.style.height = Math.round(span + m.vh) + 'px';
        m.height = span + m.vh;
      },
      span: function (m) { return Math.max(m.height - m.vh, 1); },
      frame: paint
    });
  })();

  /* ── Sectors: the strip tracks the scroll ────────── */
  (function () {
    var section = document.querySelector('.sectors');
    var strip = section && section.querySelector('.marquee__track');
    if (!strip) return;

    function build(d) {
      var row = d.sectors.map(function (s) { return '<span>' + s + '</span><i>◆</i>'; }).join('');
      strip.innerHTML = row + row;
    }
    build(RAMZ.dict());
    RAMZ.onChange(build);

    scene(section, {
      offset: function (m) { return -m.vh; },
      span: function (m) { return m.height + m.vh; },
      frame: function (p) {
        var dir = root.dir === 'rtl' ? 1 : -1;
        strip.style.transform = 'translate3d(' + (dir * (p - 0.5) * 42).toFixed(2) + '%,0,0)';
      }
    });
  })();

  /* ── Closing panel opens out as it arrives ───────── */
  (function () {
    var section = document.querySelector('.cta');
    var panel = section && section.querySelector('.cta__panel');
    if (!panel) return;
    var inner = section.querySelector('.cta__inner');

    scene(section, {
      offset: function (m) { return -m.vh; },
      span: function (m) { return m.height * 0.6 + m.vh; },
      frame: function (p) {
        var open = smoothstep(0.12, 0.55, p);
        panel.style.setProperty('--open', open.toFixed(3));
        inner.style.transform = 'translate3d(0,' + ((1 - open) * 26).toFixed(1) + 'px,0)';
        inner.style.opacity = open.toFixed(3);
      }
    });
  })();

  /* ── Boot ────────────────────────────────────────── */
  if (still) root.classList.add('is-still');

  RAMZ.boot();
  RAMZ.onChange(function () {
    syncTheme();
    requestAnimationFrame(function () { measure(); request(); });
  });

  measure();
  chrome();
  request();

  addEventListener('scroll', function () { chrome(); request(); }, { passive: true });

  var last = { w: window.innerWidth, h: window.innerHeight };
  addEventListener('resize', function () {
    // Ignore the small height changes a mobile address bar makes, so pinned
    // sections never re-measure mid-scroll.
    if (window.innerWidth === last.w && Math.abs(window.innerHeight - last.h) < 120) return;
    last = { w: window.innerWidth, h: window.innerHeight };
    measure();
    chrome();
    request();
  }, { passive: true });

  addEventListener('load', function () { measure(); chrome(); request(); });
  if (document.fonts) document.fonts.ready.then(function () { measure(); request(); });
  if (motion.addEventListener) motion.addEventListener('change', function () { location.reload(); });
})();
