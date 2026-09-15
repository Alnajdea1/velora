/* ═══ Ramz — copy in both languages ═══
   Every string on the page lives here. Elements carry data-i18n (text) or
   data-i18n-html (markup); repeated content — chat, services, sectors, reel
   captions — is rendered from these tables so a language switch is a
   re-render rather than a second page. */
window.RAMZ = (function () {
  'use strict';

  var COPY = {
    ar: {
      dir: 'rtl',
      title: 'رمـز — اسأل شركتك على الواتساب',
      description: 'رمز يربط أنظمة شركتك بالواتساب، تسأل بلغتك ويجيك الجواب مباشرة.',
      brand: 'رمـز',
      langLabel: 'EN',
      langAria: 'Switch to English',
      themeAria: 'تبديل الوضع الليلي',
      skip: 'تخطَّ للمحتوى',

      'nav.services': 'الخدمات',
      'nav.demo': 'الديمو',
      'nav.cta': 'تواصل معنا',

      'hero.eyebrow': 'RAMZ — أتمتة الأعمال',
      'hero.title': 'اسأل شركتك على الواتساب،<br>ورمز يعطيك <span class="grad">الزبدة</span>.',
      'hero.lede': 'نربط أنظمة شركتك، فتسأل بلغتك ويجيك الجواب مباشرة — بدون تقارير ولا انتظار أحد.',
      'hero.cta': 'جرّب الديمو',
      'hero.f1': 'ثوانٍ', 'hero.f1s': 'بدل تقارير تاخذ أيام',
      'hero.f2': 'على واتساب', 'hero.f2s': 'بدون تطبيق جديد يتعلمونه',
      'hero.f3': 'من أنظمتك', 'hero.f3s': 'الجواب من بياناتك، مو تخمين',
      'hero.cue': 'مرّر',
      'hero.pill': 'الديمو يشتغل على بياناتك أنت',

      chapters: [
        { n: '٠١', label: 'السؤال' },
        { n: '٠٢', label: 'الفكرة' },
        { n: '٠٣', label: 'المحادثة' },
        { n: '٠٤', label: 'الطبقات' },
        { n: '٠٥', label: 'القطاعات' },
        { n: '٠٦', label: 'البداية' }
      ],

      reel: [
        { text: 'مو مجرد واتساب.', pos: 'start' },
        { text: 'اسأل شركتك.', pos: 'start' },
        { text: 'ورمز يعطيك <span class="grad">الزبدة</span>.', pos: 'end' },
        { text: 'معلومة. ملف. تقرير. طلب.', sub: 'كلها من نفس المحادثة.', pos: 'start' },
        { text: 'هذا رمز.', pos: 'center' }
      ],

      'demo.eyebrow': 'من بياناتك',
      'demo.title': 'نفس الجواب، محدَّث لحظة بلحظة.',
      'demo.agent': 'رمز',
      'demo.status': 'متصل ببيانات الشركة',
      'demo.placeholder': 'اكتب سؤالك…',
      'demo.send': 'إرسال',
      'demo.cta': 'اطلب الخدمة وجرّب',
      'demo.pending': 'عقود بانتظار التوقيع',
      'demo.pendingMeta': '٣ من ١٢ عقد لسه ما اكتملت',

      tiles: {
        contracts: { label: 'عقود موقّعة هذا الشهر', value: 12, suffix: '', meta: '+٣ عن الشهر الماضي', trend: 'up' },
        value: { label: 'قيمة العقود', value: 4.8, suffix: 'م', meta: 'ريال سعودي', trend: '' },
        orders: { label: 'طلبات مفتوحة', value: 7, suffix: '', meta: '٢ منها متأخرة', trend: 'down' },
        sales: { label: 'مبيعات الأسبوع', value: 1.9, suffix: 'م', meta: '+١٤٪ عن الأسبوع اللي راح', trend: 'up' }
      },

      chat: [
        { q: 'كم عقد وقّعنا هذا الشهر؟', src: 'من نظام العقود',
          a: '<b>١٢ عقد</b> هذا الشهر، بقيمة <b>٤.٨ مليون ريال</b> — أعلى بثلاثة عقود عن الشهر اللي راح.',
          hit: ['contracts', 'value'] },
        { q: 'وش الطلبات اللي للحين ما تقفلت؟', src: 'من نظام الطلبات',
          a: 'عندك <b>٧ طلبات مفتوحة</b>، منها <b>٢ متأخرة</b> عن موعدها. أرسل لك قائمتها الحين؟',
          hit: ['orders'] },
        { q: 'عطني ملخص مبيعات الأسبوع.', src: 'من لوحة المبيعات',
          a: 'مبيعات الأسبوع <b>١.٩ مليون ريال</b>، بزيادة <b>١٤٪</b> عن الأسبوع اللي قبله. أقوى يوم كان الثلاثاء.',
          hit: ['sales'] },
        { q: 'وش صار على المشروع؟', src: 'من متابعة المشاريع',
          a: '<b>٣ من ١٢ عقد</b> لسه بانتظار التوقيع — كلها عند الطرف الثاني. أذكّرهم نيابة عنك؟',
          hit: ['pending'] }
      ],

      'services.title': 'وراء السؤال، <span class="grad">شغل كثير</span>.',
      'services.lede': 'أربع طبقات تشتغل ورا الكواليس، عشان السؤال يطلع جواب.',
      services: [
        { name: 'وكيل ذكي على واتساب',
          body: 'ما فيه تطبيق جديد ولا تدريب. فريقك يسأل من نفس الواتساب اللي يستخدمه كل يوم، بالعامية، ويجيه الجواب من أنظمتكم مباشرة — مع مصدر الجواب عشان تتأكد.',
          ticks: ['يفهم اللهجة والاختصارات الداخلية', 'صلاحيات لكل موظف حسب دوره', 'يرجّع المصدر مع كل رقم'] },
        { name: 'أتمتة الإجراءات',
          body: 'الشغل المكرر اللي ياخذ من فريقك ساعات — إنشاء عقد، تذكير بتوقيع، متابعة طلب، تحديث حالة — يصير يمشي لحاله وينبّهك بس لما يحتاجك.',
          ticks: ['مسارات موافقة بخطوات واضحة', 'تنبيهات قبل ما يفوت الموعد', 'سجل كامل لكل إجراء صار'] },
        { name: 'لوحات وتحليلات',
          body: 'لوحة وحدة تجمع أرقامك كلها، بنفس المصدر اللي يجاوب منه رمز. تفتحها تلقى الصورة كاملة، وتسأل عن أي رقم فيها بالتفصيل.',
          ticks: ['مؤشرات تختارها أنت، مو قوالب جاهزة', 'تقرير يوصلك على واتساب كل صباح', 'تصدير للإكسل بضغطة'] },
        { name: 'حلول ذكاء مخصصة',
          body: 'عندك حالة ما تشبه أحد؟ نجلس معك، نفهم شغلك، ونبني لك حل على مقاسك — من ربط نظام قديم، لين نموذج يقرأ مستنداتكم ويطلّع منها الزبدة.',
          ticks: ['ربط مع أنظمتكم الحالية', 'قراءة المستندات والعقود آليًا', 'بياناتكم تبقى عندكم'] }
      ],

      'sectors.note': 'بدينا من العقار. ونفس الطريقة تنفع لأي قطاع.',
      sectors: ['العقار', 'المقاولات', 'التجزئة', 'اللوجستيات', 'الخدمات المالية', 'الرعاية الصحية', 'التعليم'],

      'cta.title': 'ورّنا شغلك،<br>ونقولك وش ينفع يتأتمت.',
      'cta.lede': 'جلسة قصيرة، نسمع منك ونوريك الديمو على بياناتك أنت — بدون التزام.',
      'cta.button': 'احجز الديمو',
      'cta.subject': 'طلب ديمو رمز',

      'footer.copy': '© ٢٠٢٦ رمز — جميع الحقوق محفوظة',
      'footer.aria': 'روابط الفوتر'
    },

    en: {
      dir: 'ltr',
      title: 'RAMZ — Ask your company on WhatsApp',
      description: 'RAMZ connects your business systems to WhatsApp. Ask in your own words, get the answer straight from your data.',
      brand: 'RAMZ',
      langLabel: 'ع',
      langAria: 'التبديل إلى العربية',
      themeAria: 'Toggle dark mode',
      skip: 'Skip to content',

      'nav.services': 'Services',
      'nav.demo': 'Demo',
      'nav.cta': 'Talk to us',

      'hero.eyebrow': 'RAMZ — BUSINESS AUTOMATION',
      'hero.title': 'Ask your company on WhatsApp,<br>RAMZ gives you <span class="grad">the answer</span>.',
      'hero.lede': 'We connect your systems, so you ask in plain language and the answer comes straight back — no reports, no waiting on anyone.',
      'hero.cta': 'See the demo',
      'hero.f1': 'Seconds', 'hero.f1s': 'instead of reports that take days',
      'hero.f2': 'On WhatsApp', 'hero.f2s': 'no new app for your team to learn',
      'hero.f3': 'From your systems', 'hero.f3s': 'answers from your data, not guesses',
      'hero.cue': 'scroll',
      'hero.pill': 'The demo runs on your own data',

      chapters: [
        { n: '01', label: 'The question' },
        { n: '02', label: 'The idea' },
        { n: '03', label: 'The conversation' },
        { n: '04', label: 'The layers' },
        { n: '05', label: 'The sectors' },
        { n: '06', label: 'The start' }
      ],

      reel: [
        { text: 'Not just WhatsApp.', pos: 'start' },
        { text: 'Ask your company.', pos: 'start' },
        { text: 'RAMZ gives you <span class="grad">the answer</span>.', pos: 'end' },
        { text: 'A number. A file. A report. A request.', sub: 'All from the same chat.', pos: 'start' },
        { text: 'This is RAMZ.', pos: 'center' }
      ],

      'demo.eyebrow': 'FROM YOUR DATA',
      'demo.title': 'The same answer, current to the minute.',
      'demo.agent': 'RAMZ',
      'demo.status': 'connected to company data',
      'demo.placeholder': 'Ask anything…',
      'demo.send': 'Send',
      'demo.cta': 'Request access',
      'demo.pending': 'Contracts awaiting signature',
      'demo.pendingMeta': '3 of 12 contracts still open',

      tiles: {
        contracts: { label: 'Contracts signed this month', value: 12, suffix: '', meta: '+3 on last month', trend: 'up' },
        value: { label: 'Contract value', value: 4.8, suffix: 'M', meta: 'SAR', trend: '' },
        orders: { label: 'Open orders', value: 7, suffix: '', meta: '2 of them overdue', trend: 'down' },
        sales: { label: 'Sales this week', value: 1.9, suffix: 'M', meta: '+14% on last week', trend: 'up' }
      },

      chat: [
        { q: 'How many contracts did we sign this month?', src: 'from contracts',
          a: '<b>12 contracts</b> this month, worth <b>SAR 4.8M</b> — three more than last month.',
          hit: ['contracts', 'value'] },
        { q: 'Which orders are still open?', src: 'from orders',
          a: 'You have <b>7 open orders</b>, <b>2 of them overdue</b>. Want the list now?',
          hit: ['orders'] },
        { q: 'Give me this week\'s sales.', src: 'from sales',
          a: 'Sales came to <b>SAR 1.9M</b> this week, <b>up 14%</b> on the week before. Tuesday was the strongest day.',
          hit: ['sales'] },
        { q: 'Where did the project get to?', src: 'from projects',
          a: '<b>3 of 12 contracts</b> are still waiting on signature — all of them on the other side. Should I chase them for you?',
          hit: ['pending'] }
      ],

      'services.title': 'Behind the question, <span class="grad">a lot of work</span>.',
      'services.lede': 'Four layers running backstage, so a question comes back as an answer.',
      services: [
        { name: 'An agent on WhatsApp',
          body: 'No new app, no training. Your team asks in the same WhatsApp they already use, in their own words, and the answer comes from your systems — with its source attached so they can check it.',
          ticks: ['Understands dialect and internal shorthand', 'Permissions per person and role', 'Every figure cites its source'] },
        { name: 'Automated procedures',
          body: 'The repetitive work that eats your team\'s hours — drafting a contract, chasing a signature, following an order, updating a status — runs on its own and only interrupts you when it needs you.',
          ticks: ['Approval paths with clear steps', 'Alerts before a deadline passes', 'A full record of every action'] },
        { name: 'Dashboards and analytics',
          body: 'One board holding all your numbers, off the same source RAMZ answers from. Open it for the whole picture, then ask about any figure on it in detail.',
          ticks: ['Metrics you choose, not a fixed template', 'A morning summary on WhatsApp', 'Export to Excel in one click'] },
        { name: 'Custom AI solutions',
          body: 'Got a case that looks like nobody else\'s? We sit with you, learn how you work, and build to fit — from wiring in a legacy system to a model that reads your documents and pulls out what matters.',
          ticks: ['Integrates with your current systems', 'Reads documents and contracts', 'Your data stays yours'] }
      ],

      'sectors.note': 'We started in real estate. The same approach fits any sector.',
      sectors: ['Real estate', 'Construction', 'Retail', 'Logistics', 'Financial services', 'Healthcare', 'Education'],

      'cta.title': 'Show us how you work,<br>we\'ll show you what can run itself.',
      'cta.lede': 'A short session: we listen, then walk you through the demo on your own data — no commitment.',
      'cta.button': 'Book the demo',
      'cta.subject': 'RAMZ demo request',

      'footer.copy': '© 2026 RAMZ — All rights reserved',
      'footer.aria': 'Footer links'
    }
  };

  var lang = 'ar';
  var listeners = [];

  function dict() { return COPY[lang]; }
  function t(key) { return COPY[lang][key]; }

  function apply(next) {
    lang = COPY[next] ? next : 'ar';
    var d = COPY[lang];
    var root = document.documentElement;

    root.lang = lang;
    root.dir = d.dir;
    document.title = d.title;

    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = d.description;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = d[el.dataset.i18n];
      if (typeof v === 'string') el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var v = d[el.dataset.i18nHtml];
      if (typeof v === 'string') el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var v = d[el.dataset.i18nAria];
      if (typeof v === 'string') el.setAttribute('aria-label', v);
    });

    var mail = document.querySelector('[data-mail]');
    if (mail) mail.href = 'mailto:contact@ramz.net.sa?subject=' + encodeURIComponent(d['cta.subject']);

    listeners.forEach(function (fn) { fn(d, lang); });

    try { localStorage.setItem('ramz-lang', lang); } catch (e) {}
  }

  function onChange(fn) { listeners.push(fn); }

  function boot() {
    var saved = null;
    try { saved = localStorage.getItem('ramz-lang'); } catch (e) {}
    if (!saved) saved = (navigator.language || '').toLowerCase().indexOf('ar') === 0 ? 'ar' : 'en';
    apply(saved);

    var button = document.querySelector('.lang-toggle');
    if (button) {
      button.addEventListener('click', function () { apply(lang === 'ar' ? 'en' : 'ar'); });
    }
  }

  return { apply: apply, onChange: onChange, boot: boot, dict: dict, t: t, get lang() { return lang; } };
})();
