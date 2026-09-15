/* ═══ Ramz — site behaviour ═══ */
(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  function toArabic(n) {
    return String(n).replace(/[0-9]/g, function (d) { return AR_DIGITS[+d]; });
  }

  /* ── Theme ───────────────────────────────── */
  var toggle = document.querySelector('.theme-toggle');
  function syncToggle() {
    var dark = document.documentElement.dataset.theme === 'dark';
    toggle.setAttribute('aria-pressed', String(dark));
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#0C0A0E' : '#F5F1EA';
  }
  toggle.addEventListener('click', function () {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('ramz-theme', next); } catch (e) {}
    syncToggle();
  });
  syncToggle();

  /* ── Scroll state + reveal ───────────────── */
  addEventListener('scroll', function () {
    document.body.classList.toggle('scrolled', scrollY > 20);
  }, { passive: true });

  // Armed only once the observer below is about to run, so a failure
  // anywhere else can never leave the page hidden.
  document.documentElement.classList.add('reveals-armed');
  setTimeout(function () {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }, 2500);

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: .16, rootMargin: '0px 0px -60px' });
  document.querySelectorAll('.reveal, .bar').forEach(function (el) { io.observe(el); });

  /* ── Count-up tiles ──────────────────────── */
  var counted = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      counted.unobserve(e.target);
      countUp(e.target);
    });
  }, { threshold: .5 });

  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var decimals = String(target).includes('.') ? 1 : 0;
    var render = function (v) {
      var s = v.toFixed(decimals);
      el.textContent = (el.hasAttribute('data-arabic') ? toArabic(s) : s) + suffix;
    };
    if (reduced) return render(target);

    var start = performance.now(), dur = 1300;
    (function step(now) {
      var p = Math.min((now - start) / dur, 1);
      render(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }
  document.querySelectorAll('[data-count]').forEach(function (el) { counted.observe(el); });

  /* ── Accordion ───────────────────────────── */
  var items = Array.prototype.slice.call(document.querySelectorAll('.acc__item'));
  items.forEach(function (item, i) {
    var head = item.querySelector('.acc__head');
    if (i === 0) item.classList.add('is-open');
    head.addEventListener('click', function () {
      var open = item.classList.contains('is-open');
      items.forEach(function (other) {
        other.classList.remove('is-open');
        other.querySelector('.acc__head').setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('is-open');
        head.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── Chat demo ───────────────────────────── */
  var CONVOS = [
    {
      q: 'كم عقد وقّعنا هذا الشهر؟',
      src: 'من نظام العقود',
      a: '<b>١٢ عقد</b> هذا الشهر، بقيمة <b>٤.٨ مليون ريال</b> — أعلى بثلاثة عقود عن الشهر اللي راح.',
      hit: ['contracts', 'value']
    },
    {
      q: 'وش الطلبات اللي للحين ما تقفلت؟',
      src: 'من نظام الطلبات',
      a: 'عندك <b>٧ طلبات مفتوحة</b>، منها <b>٢ متأخرة</b> عن موعدها. أرسل لك قائمتها الحين؟',
      hit: ['orders']
    },
    {
      q: 'عطني ملخص مبيعات الأسبوع.',
      src: 'من لوحة المبيعات',
      a: 'مبيعات الأسبوع <b>١.٩ مليون ريال</b>، بزيادة <b>١٤٪</b> عن الأسبوع اللي قبله. أقوى يوم كان الثلاثاء.',
      hit: ['sales']
    },
    {
      q: 'وش صار على المشروع؟',
      src: 'من متابعة المشاريع',
      a: '<b>٣ من ١٢ عقد</b> لسه بانتظار التوقيع — كلها عند الطرف الثاني. أذكّرهم نيابة عنك؟',
      hit: ['pending']
    }
  ];

  var thread = document.getElementById('thread');
  var chips = document.getElementById('chips');
  var composer = document.getElementById('composer');
  var sendBtn = document.getElementById('send');
  var timers = [];
  var index = 0;
  var autoplay = true;

  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function highlight(keys) {
    document.querySelectorAll('[data-key]').forEach(function (el) {
      el.classList.toggle('is-hit', keys.indexOf(el.dataset.key) > -1);
    });
  }

  function bubble(cls, html) {
    var el = document.createElement('div');
    el.className = 'msg ' + cls;
    el.innerHTML = html;
    thread.appendChild(el);
    thread.scrollTop = thread.scrollHeight;
    return el;
  }

  function trim() {
    while (thread.children.length > 6) thread.removeChild(thread.firstChild);
  }

  function typeInto(text, done) {
    if (reduced) { composer.textContent = text; composer.classList.add('is-typing'); return done(); }
    composer.classList.add('is-typing');
    var i = 0;
    (function tick() {
      composer.textContent = text.slice(0, ++i);
      if (i < text.length) later(tick, 28);
      else later(done, 380);
    })();
  }

  function ask(convo, fromUser) {
    clearTimers();
    autoplay = !fromUser;
    index = CONVOS.indexOf(convo);
    markChip();

    typeInto(convo.q, function () {
      composer.textContent = 'اكتب سؤالك…';
      composer.classList.remove('is-typing');
      bubble('msg--me', convo.q);
      trim();

      var wait = bubble('msg--bot', '<span class="typing"><span></span><span></span><span></span></span>');
      later(function () {
        wait.innerHTML = '<span class="msg__src">' + convo.src + '</span><span class="msg__text">' + convo.a + '</span>';
        thread.scrollTop = thread.scrollHeight;
        highlight(convo.hit);
        trim();
        if (autoplay) later(next, 4200);
      }, 1100);
    });
  }

  function next() {
    ask(CONVOS[(index + 1) % CONVOS.length], false);
  }

  function markChip() {
    Array.prototype.forEach.call(chips.children, function (c, i) {
      c.setAttribute('aria-pressed', String(i === index));
    });
  }

  CONVOS.forEach(function (convo, i) {
    var chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = convo.q;
    chip.setAttribute('aria-pressed', 'false');
    chip.addEventListener('click', function () { ask(convo, true); });
    chips.appendChild(chip);
  });

  sendBtn.addEventListener('click', function () { ask(CONVOS[(index + 1) % CONVOS.length], true); });

  var started = false;
  new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (e) {
      if (!e.isIntersecting || started) return;
      started = true;
      obs.disconnect();
      ask(CONVOS[0], false);
    });
  }, { threshold: .3 }).observe(thread);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) clearTimers();
    else if (autoplay && started) later(next, 800);
  });
})();

/* ═══ Scroll-scrubbed reel ═══
   Scroll position drives video.currentTime directly: a sticky stage inside a
   tall track, one rAF loop while the section is on screen, and no layout reads
   outside measure(). Falls back to a still frame with stacked captions
   whenever scrubbing is unavailable, so the story survives either way. */
(function () {
  'use strict';

  var section = document.getElementById('reel');
  if (!section) return;

  var track = section.querySelector('.reel__track');
  var stage = section.querySelector('.reel__stage');
  var video = section.querySelector('.reel__video');
  var cue = section.querySelector('.reel__cue');
  var motionQuery = matchMedia('(prefers-reduced-motion: reduce)');

  var bands = Array.prototype.map.call(section.querySelectorAll('.reel__line'), function (el) {
    var from = parseFloat(el.dataset.from) || 0;
    var to = parseFloat(el.dataset.to) || 1;
    return {
      el: el, from: from, to: to, pos: el.dataset.pos,
      fade: Math.max((to - from) * 0.3, 0.03),
      hold: to >= 0.999,  // closing line stays up through the end of the pin
      a: -1
    };
  });

  var metrics = { top: 0, span: 1, width: 0, height: 0 };
  var target = 0, eased = 0, lastSeek = -1, activePos = '', cueShown = true;
  var ready = false, running = false, onScreen = false, dead = false;

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function smoothstep(a, b, v) {
    if (b === a) return v < a ? 0 : 1;
    var t = clamp((v - a) / (b - a));
    return t * t * (3 - 2 * t);
  }

  // Scroll distance comes from the clip's own length, not a magic number:
  // about a third of a second of footage per 100px of scroll, kept between
  // 1.6 and 3.4 screens so short clips still breathe and long ones never drag.
  function layout() {
    var vh = window.innerHeight;
    var duration = ready && isFinite(video.duration) ? video.duration : 8;
    var perSecond = window.innerWidth < 720 ? 210 : 300;
    var span = Math.min(Math.max(duration * perSecond, vh * 1.6), vh * 3.4);
    track.style.height = Math.round(span + vh) + 'px';
    measure();
  }

  function measure() {
    var rect = track.getBoundingClientRect();
    metrics.top = rect.top + window.scrollY;
    metrics.span = Math.max(track.offsetHeight - stage.offsetHeight, 1);
    metrics.width = window.innerWidth;
    metrics.height = window.innerHeight;
  }

  function paint(p) {
    if (ready && !document.hidden) {
      var t = p * Math.max(video.duration - 0.05, 0);
      // Skip while a seek is in flight unless we have drifted far enough that
      // the picture would visibly lag the scroll.
      if (!video.seeking || Math.abs(t - video.currentTime) > 0.25) {
        if (Math.abs(t - lastSeek) > 1 / 60) {
          lastSeek = t;
          try { video.currentTime = t; } catch (e) { /* not seekable yet */ }
        }
      }
    }

    var pos = 'none';
    for (var i = 0; i < bands.length; i++) {
      var b = bands[i];
      var into = smoothstep(b.from, b.from + b.fade, p);
      var outOf = b.hold ? 1 : 1 - smoothstep(b.to - b.fade, b.to, p);
      var a = Math.min(into, outOf);
      if (a < 0.01) a = 0;
      if (Math.abs(a - b.a) > 0.008 || (a === 0 && b.a !== 0)) {
        b.a = a;
        b.el.style.opacity = a;
        b.el.style.transform = 'translate3d(0,' + ((1 - into) * 18 - (1 - outOf) * 12).toFixed(2) + 'px,0)';
      }
      if (a > 0.35) pos = b.pos;
    }
    if (pos !== activePos) { activePos = pos; stage.dataset.pos = pos; }

    var showCue = p < 0.04;
    if (showCue !== cueShown) { cueShown = showCue; if (cue) cue.style.opacity = showCue ? '1' : '0'; }
  }

  function tick() {
    target = clamp((window.scrollY - metrics.top) / metrics.span);
    var delta = target - eased;
    // Light smoothing only: enough to absorb wheel steps, not enough to feel
    // like the picture is catching up behind the scroll.
    eased += delta * 0.24;
    if (Math.abs(delta) < 0.0004) eased = target;
    paint(eased);

    if (onScreen || Math.abs(target - eased) > 0.0004) requestAnimationFrame(tick);
    else running = false;
  }

  function start() {
    if (running || dead) return;
    running = true;
    requestAnimationFrame(tick);
  }

  function fallback() {
    if (dead) return;
    dead = true;
    running = false;
    section.classList.add('reel--static');
    track.style.height = '';
    stage.removeAttribute('data-pos');
    bands.forEach(function (b) { b.el.style.opacity = ''; b.el.style.transform = ''; });
    if (!motionQuery.matches && video.readyState > 0) {
      video.loop = true;
      video.play().catch(function () { /* poster carries it */ });
    }
  }

  if (motionQuery.matches) {
    fallback();
  } else {
    video.addEventListener('loadedmetadata', function () {
      if (!isFinite(video.duration) || !video.duration) return fallback();
      ready = true;
      layout();
      start();
    });
    video.addEventListener('error', fallback);
    // Nothing decoded at all after 8s: keep the story, drop the scrubbing.
    setTimeout(function () { if (!ready && video.readyState === 0) fallback(); }, 8000);

    // iOS keeps a video undecoded until it has been played once; a muted
    // play/pause on the first interaction unlocks seeking.
    var unlock = function () {
      video.play().then(function () { video.pause(); }).catch(function () {});
      removeEventListener('touchstart', unlock);
      removeEventListener('pointerdown', unlock);
    };
    addEventListener('touchstart', unlock, { passive: true, once: true });
    addEventListener('pointerdown', unlock, { passive: true, once: true });

    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) start();
    }, { rootMargin: '25% 0px' }).observe(track);

    addEventListener('scroll', start, { passive: true });

    // Relayout on real size changes only — ignoring the small height deltas a
    // mobile address bar produces keeps the pinned stage from jumping.
    var pending = false;
    addEventListener('resize', function () {
      if (pending || dead) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        if (window.innerWidth !== metrics.width || Math.abs(window.innerHeight - metrics.height) > 120) layout();
        else measure();
        start();
      });
    }, { passive: true });

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', function (e) { if (e.matches) fallback(); });
    }

    measure();
  }
})();
