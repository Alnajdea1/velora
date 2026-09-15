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
  var statics = [];      // each section's "show it all, no motion" presentation
  var embeds = [];       // sections that cannot animate inside an expanded frame
  var ticking = false;
  var staticApplied = false;
  var embedApplied = false;
  var framed = false, asking = false;
  var body = document.body;
  var page = document.querySelector('.page') || body;
  var scroller = null;

  function onStatic(fn) {
    statics.push(fn);
    if (still) fn();
  }

  // The page can only drive motion from scroll if it is the thing that
  // scrolls. Embedded in a host that expands the frame to full height, it is
  // not — so present the complete page instead of a dead one.
  function pageScrolls() {
    return root.scrollHeight - window.innerHeight > 80;
  }

  // No real viewport is this tall. A frame expanded to its content height is,
  // and sizing tracks against it would grow the content, which grows the
  // frame — so treat it as an embed and stop driving motion from scroll.
  function embedded() { return window.innerHeight > 1600; }

  // Tracks are sized against a sane viewport, never a runaway one.
  function viewport() { return Math.min(window.innerHeight, 1400); }

  // Embedded in a host that expands the frame to its content height, the page
  // never scrolls itself: sticky cannot pin and element coordinates never
  // change, so scroll-linked motion is impossible. IntersectionObserver still
  // reports when a section reaches the reader's screen, so each one plays its
  // own timeline once instead — the same choreography, triggered rather than
  // scrubbed. The deployed site, which does scroll, keeps the pinned version.
  function goEmbedded() {
    if (staticApplied || embedApplied) return;
    embedApplied = true;
    root.classList.add('is-embed');
    for (var e = 0; e < embeds.length; e++) embeds[e]();
    measure();                       // tracks collapse to content height

    scenes.forEach(function (sc) {
      if (sc.played) return;
      var io = new IntersectionObserver(function (entries) {
        if (!entries[entries.length - 1].isIntersecting || sc.played) return;
        sc.played = true;
        io.disconnect();
        play(sc);
      }, { threshold: 0.3 });
      io.observe(sc.el);
    });
  }

  function play(sc) {
    var dur = sc.mode === 'enter' ? 900 : 3200;
    var t0 = performance.now();
    (function step(now) {
      var t = clamp((now - t0) / dur);
      sc.frame(t * t * (3 - 2 * t));
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }

  function goStatic() {
    if (staticApplied) return;
    staticApplied = true;
    still = true;
    root.classList.add('is-still');
    for (var i = 0; i < statics.length; i++) statics[i]();
    measure();   // collapses the pinned tracks back to their content height
  }

  // Ask the top-level viewport how tall it is. IntersectionObserver reports
  // rootBounds in the reader's own screen coordinates, even from inside a
  // frame — the one measurement an expanded frame cannot give us directly.
  function askViewport(done) {
    var io = new IntersectionObserver(function (entries) {
      io.disconnect();
      var b = entries[0].rootBounds;
      done(b && b.height > 200 ? b.height : 0);
    });
    io.observe(document.body);
    setTimeout(function () { io.disconnect(); }, 1500);
  }

  // Pin the document to the real viewport and hand the scrolling to .page, so
  // sticky works again and every chapter plays as it does when deployed.
  function goFramed(h) {
    framed = true;
    root.classList.add('is-framed');
    root.style.height = body.style.height = h + 'px';
    page.style.height = h + 'px';
    scroller = page;
    requestAnimationFrame(function () { measure(); chrome(); request(); });
  }

  function checkMode() {
    if (still || embedApplied || framed || asking) return;
    if (embedded()) {
      asking = true;
      return askViewport(function (h) {
        asking = false;
        if (h) goFramed(h);
        else goEmbedded();        // coordinates withheld: play on arrival
      });
    }
    if (!pageScrolls()) goStatic();
  }

  function scene(el, opts) {
    if (!el) return null;
    var s = {
      el: el,
      mode: opts.mode || 'pin',   // 'pin' plays while stuck, 'enter' while arriving
      chapter: opts.chapter,
      frame: opts.frame,
      onMeasure: opts.onMeasure,
      last: -1
    };
    scenes.push(s);
    return s;
  }

  function measure() {
    var vh = viewport();
    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i];
      if (!s.onMeasure) continue;
      s.onMeasure({ height: s.el.getBoundingClientRect().height, vh: vh, width: window.innerWidth });
    }
  }

  // Progress comes from where the section sits in the viewport right now, so it
  // does not matter whether the window, a wrapper element or an embedding frame
  // is the thing being scrolled.
  function frame() {
    ticking = false;
    if (document.hidden) return;
    var vh = window.innerHeight;
    var i, s, rect;
    var reads = [];

    for (i = 0; i < scenes.length; i++) {           // read first…
      s = scenes[i];
      rect = s.el.getBoundingClientRect();
      if (rect.bottom < -vh || rect.top > vh * 2) { reads.push(-1); continue; }
      reads.push(
        s.mode === 'enter' ? clamp((vh - rect.top) / Math.max(rect.height + vh, 1)) :
        s.mode === 'hero' ? clamp(-rect.top / Math.max(rect.height, 1)) :
        clamp(-rect.top / Math.max(rect.height - vh, 1)));
    }
    for (i = 0; i < scenes.length; i++) {           // …then write
      s = scenes[i];
      var p = reads[i];
      if (p < 0) {                                   // off screen: settle the edge once
        p = s.last > 0.5 ? 1 : 0;
        if (p === s.last) continue;
      }
      if (p === s.last) continue;
      s.last = p;
      if (s.chapter !== undefined && p > 0 && p < 1) markChapter(s.chapter);
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
    var p, past;
    if (scroller) {
      var max = scroller.scrollHeight - scroller.clientHeight;
      past = scroller.scrollTop;
      p = max > 0 ? clamp(past / max) : 0;
    } else {
      var r = body.getBoundingClientRect();
      past = -r.top;
      p = r.height - window.innerHeight > 0 ? clamp(past / (r.height - window.innerHeight)) : 0;
    }
    if (rail) rail.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    body.classList.toggle('scrolled', past > 20);
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

  /* ── Chapter labels and rail ─────────────────────
     Every stage carries the same index, and the rail says which one holds the
     screen. Both read from the same table, so a language switch renumbers. */
  var railEl = document.querySelector('.rail');
  var indices = Array.prototype.slice.call(document.querySelectorAll('.chapter__index'));
  var ticks = [];
  var activeChapter = -1;

  function buildChapters(d) {
    indices.forEach(function (el) {
      var c = d.chapters[+el.dataset.chapter];
      if (c) el.innerHTML = '<b>' + c.n + '</b><i>' + c.label + '</i>';
    });
    if (railEl && !ticks.length) {
      d.chapters.forEach(function () { ticks.push(railEl.appendChild(document.createElement('span'))); });
    }
  }
  buildChapters(RAMZ.dict());
  RAMZ.onChange(buildChapters);

  function markChapter(i) {
    if (i === activeChapter) return;
    activeChapter = i;
    ticks.forEach(function (t, n) {
      t.classList.toggle('is-on', n === i);
      t.classList.toggle('is-done', n < i);
    });
  }

  /* ── Hero ────────────────────────────────────────── */
  (function () {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    var mark = hero.querySelector('.hero__mark');
    var inner = hero.querySelector('.hero__inner');
    var cue = hero.querySelector('.hero__cue');

    scene(hero, {
      mode: 'hero', chapter: 0,
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
    var meter = section.querySelector('.reel__meter span');
    var lines = [];
    var ready = false, dead = false, lastSeek = -1;

    function build(d) {
      box.innerHTML = '';
      var total = d.reel.length;
      var slot = 1 / total;
      lines = d.reel.map(function (item, i) {
        var el = document.createElement('p');
        el.className = 'reel__line';
        el.dataset.index = digits('0' + (i + 1)) + ' / ' + digits('0' + total);
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
      section.style.removeProperty('--open');
      lines.forEach(function (l) { l.el.style.opacity = ''; l.el.style.transform = ''; });
      if (!still && video.readyState > 0) {
        video.loop = true;
        video.play().catch(function () {});
      }
    }

    build(RAMZ.dict());
    RAMZ.onChange(build);

    scene(section, {
      chapter: 1,
      onMeasure: function (m) {
        if (dead || still || embedApplied) { track.style.height = ''; return; }
        // Scroll distance comes from the clip's own length — roughly a third of
        // a second of footage per 100px — bounded so it never drags.
        var duration = ready && isFinite(video.duration) ? video.duration : 8;
        var perSecond = m.width < 720 ? 210 : 300;
        var span = Math.min(Math.max(duration * perSecond, m.vh * 1.6), m.vh * 3.4);
        track.style.height = Math.round(span + m.vh) + 'px';
        m.height = span + m.vh;
      },
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
        section.style.setProperty('--open',
          Math.min(smoothstep(0, 0.07, p), 1 - smoothstep(0.94, 1, p)).toFixed(3));
        if (meter) meter.style.transform = 'scaleX(' + p.toFixed(3) + ')';

        for (var i = 0; i < lines.length; i++) {
          var l = lines[i];
          var b = band(p, l.from, l.to);
          var a = b.a < 0.01 ? 0 : b.a;
          if (Math.abs(a - l.a) > 0.008 || (a === 0 && l.a !== 0)) {
            l.a = a;
            l.el.style.opacity = a;
            l.el.style.transform = 'translate3d(0,' + ((1 - b.into) * 18 - (1 - b.out) * 12).toFixed(1) + 'px,0)';
          }
        }
      }
    });

    onStatic(fallback);
    embeds.push(fallback);
    if (still) return;

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
      chapter: 2,
      onMeasure: function (m) {
        if (still || embedApplied) { track.style.height = ''; return; }
        var span = Math.min(Math.max(m.vh * 2.6, 1400), m.vh * 3.4);
        track.style.height = Math.round(span + m.vh) + 'px';
        m.height = span + m.vh;
      },
      frame: paint
    });

    onStatic(fillStatic);
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
          opacity = clamp(1 + d * 4);
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
      chapter: 3,
      onMeasure: function (m) {
        if (still || embedApplied) { track.style.height = ''; return; }
        var span = Math.min(Math.max(m.vh * 2.2, 1200), m.vh * 3);
        track.style.height = Math.round(span + m.vh) + 'px';
        m.height = span + m.vh;
      },
      frame: paint
    });

    onStatic(function () { paint(0); });
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

    var track = section.querySelector('.sectors__track');
    var note = section.querySelector('.sectors__note');

    scene(section, {
      chapter: 4,
      onMeasure: function (m) {
        if (still || embedApplied) { track.style.height = ''; return; }
        track.style.height = Math.round(Math.min(Math.max(m.vh * 1.6, 900), m.vh * 2.2) + m.vh) + 'px';
      },
      frame: function (p) {
        var dir = root.dir === 'rtl' ? 1 : -1;
        strip.style.transform = 'translate3d(' + (dir * (p - 0.5) * 46).toFixed(2) + '%,0,0)';
        if (note) {
          var a = Math.min(smoothstep(0.01, 0.12, p), 1 - smoothstep(0.93, 1, p));
          note.style.opacity = a.toFixed(3);
          note.style.transform = 'translate3d(0,' + ((1 - a) * 14).toFixed(1) + 'px,0)';
        }
      }
    });
  })();

  /* ── Closing panel opens out as it arrives ───────── */
  (function () {
    var section = document.querySelector('.cta');
    var panel = section && section.querySelector('.cta__panel');
    if (!panel) return;
    var inner = section.querySelector('.cta__inner');

    var track = section.querySelector('.cta__track');

    scene(section, {
      chapter: 5,
      onMeasure: function (m) {
        if (still || embedApplied) { track.style.height = ''; return; }
        track.style.height = Math.round(Math.min(Math.max(m.vh * 1.2, 700), m.vh * 1.8) + m.vh) + 'px';
      },
      frame: function (p) {
        var open = smoothstep(0.02, 0.28, p);
        section.style.setProperty('--open', open.toFixed(3));
        inner.style.transform = 'translate3d(0,' + ((1 - open) * 26).toFixed(1) + 'px,0)';
        inner.style.opacity = Math.max(open, 0.001).toFixed(3);
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
  checkMode();
  request();
  setTimeout(function () { measure(); checkMode(); request(); }, 400);

  // capture: catches scrolling in the window, in a wrapper element, or inside
  // an embedding frame — whichever one actually moves.
  addEventListener('scroll', function () { chrome(); request(); }, { passive: true, capture: true });
  addEventListener('wheel', request, { passive: true });
  addEventListener('touchmove', request, { passive: true });
  addEventListener('pointermove', request, { passive: true });

  // A heartbeat so the page still tracks scrolls no listener reported (smooth
  // scrolling inside a host container, momentum, programmatic jumps).
  (function beat() {
    if (!still) { chrome(); frame(); }
    setTimeout(function () { requestAnimationFrame(beat); }, 60);
  })();

  var last = { w: window.innerWidth, h: window.innerHeight };
  addEventListener('resize', function () {
    // Ignore the small height changes a mobile address bar makes, so pinned
    // sections never re-measure mid-scroll.
    if (window.innerWidth === last.w && Math.abs(window.innerHeight - last.h) < 120) return;
    last = { w: window.innerWidth, h: window.innerHeight };
    measure();
    chrome();
    checkMode();
    request();
  }, { passive: true });

  addEventListener('load', function () { measure(); chrome(); checkMode(); request(); });
  if (document.fonts) document.fonts.ready.then(function () { measure(); request(); });
  if (motion.addEventListener) motion.addEventListener('change', function () { location.reload(); });
})();
