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
