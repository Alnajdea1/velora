(() => {
  'use strict';

  const PAIRS = [["المتجر","Store"],["ابحثي عن عطر أو مكوّن…","Search a scent or ingredient…"],["بحث","Search"],["السلة","Bag"],["المفضلة","Wishlist"],["حسابي","Account"],["القائمة","Menu"],["إغلاق","Close"],["الرئيسية","Home"],["اكتشفي","Discover"],["العودة للرئيسية","Back home"],["ر.س","SAR"],["arabic-indic","latin"],["توصيل مجاني","Free delivery"],["للطلبات فوق ٢٥٠ ر.س — استخدمي كود","on orders above 250 SAR — use code"],["مجموعة الحصاد الجديدة","New harvest collection"],["اللافندر","Lavender"],["في حركة","always in"],["دائمة","motion"],["عطور وعناية مستوحاة من حقول اللافندر عند الغروب: بتلات باهتة، سيقان نحيلة، وأوراق خضراء هادئة تتنفس مع الضوء.","Fragrance and care inspired by lavender fields at twilight: pale petals, slender stems, and quiet green leaves breathing with the light."],["استكشفي المجموعة","Explore the collection"],["اعرفي عائلتك العطرية","Find your scent family"],["اختيار المحررة","Editor\u0027s pick"],["عبير البنفسج ٥٠مل","Violet Veil 50ml"],["زجاجة عطر شفافة وسط طبقات من اللافندر","A translucent perfume bottle layered with lavender forms"],["برغموت مشرق","Bright bergamot"],["لافندر مقطوف يدوياً","Hand-picked lavender"],["مسك مخملي","Velvet musk"],["٤٨","48"],["تركيبة عطرية","scent formulas"],["٩٦٪","96%"],["يعيدون الشراء","repurchase"],["٢٤س","24h"],["توصيل سريع","fast delivery"],["قطع منحوتة من حصاد هذا الموسم","Sculpted pieces from this season\u0027s harvest"],["ثلاث تركيبات اختارها فريق التركيب بعد ٢٠٠ محاولة تقطير.","Three formulas selected after 200 distillation trials."],["سيقان وأوراق","Stems \u0026 leaves"],["تنقّلي بين الأقسام كما تتنقّل اليد بين السيقان","Move between categories like a hand moving through stems"],["{n} منتجاً","{n} products"],["هالة العطر","Fragrance aura"],["ستّ عائلات عطرية، هالة واحدة تشبهك","Six scent families, one aura that reads as you"],["تصفّحي هذه العائلة","Browse this family"],["{n} منتجات","{n} products"],["زهري","Floral"],["خشبي","Woody"],["شرقي","Oriental"],["منعش","Fresh"],["مسكي","Musky"],["حمضي","Citrus"],["بتلات مقطوفة فجراً، ندى خفيف، ودفء أنثوي هادئ.","Petals cut at dawn, light dew, and a quiet feminine warmth."],["سيقان جافة وخشب أبيض وأرض دافئة بعد الغروب.","Dry stems, white wood, and warm earth after twilight."],["راتنجات وتوابل ناعمة ودفء يزداد قرباً مع الوقت.","Resins, soft spice, and warmth that draws closer over time."],["أوراق خضراء وهواء بارد وماء شفاف.","Green leaves, cool air, and translucent water."],["أثر مخملي نظيف يلتصق بالبشرة بهدوء.","A clean velvet trail that rests softly on skin."],["قشور مشرقة ومرارة رقيقة تفتح الحواس.","Bright peel and delicate bitterness opening the senses."],["تفتّح المقاطع","Note bloom"],["ثلاث طبقات تتفتّح على بشرتك","Three layers blooming on skin"],["مقدمة العطر","Top notes"],["قلب العطر","Heart notes"],["قاعدة العطر","Base notes"],["أول عشر دقائق: حمضيات باردة وورق أخضر مكسور.","The first ten minutes: cool citrus and broken green leaf."],["بعد نصف ساعة: اللافندر يتفتّح مع البنفسج والياسمين.","After half an hour: lavender opens with violet and jasmine."],["حتى نهاية اليوم: مسك وخشب أبيض قريبان من الجلد.","Until the day ends: musk and white wood close to skin."],["برغموت, ورق أخضر, ليمون","Bergamot, Green leaf, Lemon"],["لافندر, بنفسج, ياسمين","Lavender, Violet, Jasmine"],["مسك, خشب أبيض, عنبر","Musk, White wood, Amber"],["مسار اللافندر","Lavender path"],["روتين متدفّق، لا صفوف من البطاقات","A flowing routine, not rows of cards"],["ابني روتينك الآن","Build your routine"],["تنظيف لطيف","Gentle cleanse"],["رغوة خفيفة بماء اللافندر تزيل الأثر دون جفاف.","A light lavender-water foam removes traces without dryness."],["موازنة","Balance"],["تونر بأوراق الميرمية يهدّئ ويعيد الحموضة الطبيعية.","Sage-leaf toner calms and restores the natural pH."],["ترميم","Repair"],["زيت مركّز يُدفأ بين الكفين ثم يُطبّق بالضغط.","A concentrated oil warmed between the palms and pressed into skin."],["ختم","Seal"],["كريم ليلي يحبس الرطوبة ويترك أثراً عطرياً خفيفاً.","Night cream locks in moisture and leaves a light scented trail."],["تسوّق بالمزاج","Shop by mood"],["ما الذي تريدين أن تشعري به؟","What do you want to feel?"],["اختاري إحساساً بدلاً من فئة، وسنعرض التركيبات التي تحمله.","Choose a feeling instead of a category and we\u0027ll surface the formulas that carry it."],["هادئ","Calm"],["دافئ","Warm"],["جريء","Bold"],["حالم","Dreamy"],["مسائي","Evening"],["مؤلّف الهدايا","Gift composer"],["صمّمي علبة تُفتح مرتين","Compose a box that opens twice"],["اختاري شكل العلبة ثم ثلاث قطع كحد أقصى. نضيف بطاقة مكتوبة بخط اليد ورباطاً مرجانياً.","Choose a box shape, then up to three pieces. We add a handwritten card and a coral ribbon."],["١ — شكل العلبة","1 — Box shape"],["٢ — القطع (حتى ٣)","2 — Pieces (up to 3)"],["إجمالي العلبة","Box total"],["أضيفي العلبة","Add the box"],["من الحقل إلى الزجاجة","From field to bottle"],["حصاد الفجر في حقول اللافندر","The dawn harvest in lavender fields"],["نقطف البتلات قبل شروق الشمس حين يكون الزيت في أعلى تركيزه، ثم نقطّرها في نفس اليوم على حرارة منخفضة للحفاظ على الطبقات الخضراء الهادئة.","We pick petals before sunrise when the oil is most concentrated, then distil them the same day at low heat to preserve the quiet green layers."],["قطف يدوي","Hand-picked"],["تقطير بارد","Cold distilled"],["بدون كحول قاسٍ","No harsh alcohol"],["اقرأي الحكاية كاملة","Read the full story"],["تفاصيل المنتج","Product details"],["العائلة العطرية","Scent family"],["الحجم","Size"],["الكمية","Quantity"],["أضيفي إلى السلة","Add to bag"],["إضافة سريعة","Quick add"],["أبلغني عند التوفر","Notify me"],["مقاطع العطر","Fragrance notes"],["نفذت الكمية","Sold out"],["متوفّر — آخر {n} قطع","In stock — last {n} pieces"],["{n} تقييماً","{n} reviews"],["يكتمل مع","Completes with"],["المكوّنات","Ingredients"],["قسّمي على ٤ دفعات بدون فوائد","Split into 4 interest-free payments"],["توصيل ٢٤ ساعة","24h delivery"],["أصلي ١٠٠٪","100% authentic"],["إرجاع ١٤ يوماً","14-day returns"],["عيّنة مجانية","Free sample"],["بقي {n} فقط","Only {n} left"],["الخيارات المتاحة","Available variants"],["داخل التركيبة","Inside the formula"],["مكوّنات تُحسّ قبل أن تُقرأ","Ingredients felt before they are read"],["لافندر الفجر","Dawn lavender"],["مقطوف يدوياً قبل شروق الشمس حين يبلغ الزيت أعلى تركيزه.","Hand-picked before sunrise when its oil reaches peak concentration."],["بتلات البنفسج","Violet petals"],["طبقة زهرية شفافة تمنح القلب نعومة باردة.","A translucent floral layer bringing a cool softness to the heart."],["قاعدة قريبة من الجلد تطيل الأثر من دون ثقل.","A skin-close base that extends the trail without heaviness."],["الصفات الحسية","Sensory qualities"],["ناعم","Soft"],["نظيف","Clean"],["طويل الأثر","Long-lasting"],["كما وصلت الرائحة إليهم","How the scent reached them"],["كل العطور والعناية","All fragrance \u0026 care"],["الفلاتر","Filters"],["مسح الفلاتر","Clear filters"],["أظهري النتائج","Show results"],["الترتيب","Sort"],["المميّزة","Featured"],["الأقل سعراً","Price: low"],["الأعلى سعراً","Price: high"],["الأعلى تقييماً","Top rated"],["شبكة","Grid"],["قائمة","List"],["السعر","Price"],["التالي","Next"],["لا شيء في هذا الحقل بعد","Nothing in this field yet"],["وسّعي نطاق السعر أو أزيلي إحدى العائلات العطرية.","Widen the price range or drop one of the scent families."],["سلّتك","Your bag"],["نغلّف كل قطعة بورق حريري ونضيف عيّنة عطرية مجاناً.","Every piece is wrapped in silk paper with a free scent sample."],["إزالة","Remove"],["ملاحظة للتغليف","Packaging note"],["مثال: اكتبوا «إلى دانة» على البطاقة","e.g. write “To Dana” on the card"],["ملخّص الطلب","Order summary"],["المجموع","Subtotal"],["الشحن","Shipping"],["مجاني","Free"],["الخصم","Discount"],["الإجمالي","Total"],["كود الخصم","Discount code"],["تطبيق","Apply"],["تم تطبيق الخصم","Discount applied"],["الكود غير صحيح","That code is not valid"],["إتمام الشراء","Checkout"],["دفع آمن عبر مدى، أبل باي، تابي وتمارا.","Secure payment with mada, Apple Pay, Tabby and Tamara."],["صار الشحن مجاني لطلبك 🎉","Your order now ships free 🎉"],["باقي {amount} على الشحن المجاني","Add {amount} for free shipping"],["السلّة ما زالت فارغة","The bag is still empty"],["ابدئي من هالة العطر واختاري العائلة التي تشبهك.","Start from the fragrance aura and pick the family that reads as you."],["أُضيف إلى السلة","Added to bag"],["لا شيء محفوظ بعد","Nothing saved yet"],["اضغطي القلب على أي بطاقة لتحفظيها هنا.","Tap the heart on any card to keep it here."],["الملف الشخصي","Profile"],["الطلب","Order"],["الحالة","Status"],["الإشعارات","Notifications"],["لا توجد إشعارات جديدة","No new notifications"],["ما عندك طلبات حتى الآن","You have no orders yet"],["أهلاً، {name}","Hello, {name}"],["عضوة منذ {year}","Member since {year}"],["نقاط اللافندر","Lavender points"],["طلباتي","Orders"],["العناوين","Addresses"],["الولاء","Loyalty"],["إعادة الطلب","Reorder"],["تتبّع","Track"],["التفاصيل","Details"],["تم التوصيل","Delivered"],["في الطريق","On the way"],["ملغى","Cancelled"],["من المجلة","From the journal"],["كل المقالات","All articles"],["لا توجد مقالات حتى الآن","No articles yet"],["{n} دقائق قراءة","{n} min read"],["ثلاث مراتب، هدية في كل واحدة","Three tiers, a gift inside each"],["اجمعي النقاط مع كل طلب واستبدليها بمكافآت وتجارب خاصة.","Collect points with every order and redeem them for rewards and special experiences."],["بتلة","Petal"],["ساق","Stem"],["حقل","Field"],["وصل طلبك إلينا","Your order is with us"],["نغلّفه اليوم ونرسل رقم التتبّع على جوالك خلال ساعتين.","We wrap it today and send the tracking number to your phone within two hours."],["رقم الطلب","Order number"],["طريقة الدفع","Payment"],["التوصيل المتوقّع","Expected delivery"],["تتبّع الطلب","Track the order"],["هذه الصفحة تبدّدت كرائحة","This page evaporated like a top note"],["ربما تغيّر الرابط. ابدئي من الرئيسية أو ابحثي عن مكوّن.","The link may have changed. Start from home or search an ingredient."],["لا نتائج مطابقة","No matches yet"],["جرّبي اسم مكوّن أو عائلة عطرية.","Try an ingredient or a scent family."],["رسالة واحدة شهرياً، عن رائحة الموسم","One letter a month, about the season’s scent"],["إصدارات محدودة، مذكرات التقطير، ودعوات مسبقة لمعمل العطور.","Limited releases, distillation notes, and early invitations to the perfume lab."],["بريدك الإلكتروني","Your email"],["اشتركي","Subscribe"],["تم الاشتراك، شكراً لك","Subscribed, thank you"],["المتجر","Shop"],["المساعدة","Help"],["من نحن","About"],["تواصلي معنا","Contact"],["الشيبنغ والتوصيل","Shipping"],["الاستبدال والإرجاع","Returns"],["تتبّع الطلب","Track order"],["الأسئلة الشائعة","FAQ"],["حتى نهاية الأسبوع","Ends this weekend"],["خصم ٣٠٪","30% off"],["على حصاد اللافندر","the lavender harvest"],["يشمل العطور بحجم ٥٠ و٧٥ مل، ومجموعات العناية الليلية. الخصم يُطبّق تلقائياً في السلة.","Covers 50ml and 75ml parfums and the night care sets. The discount applies automatically at checkout."],["الوقت المتبقي على العرض","Time remaining on the offer"],["يوم","Days"],["ساعة","Hours"],["دقيقة","Min"],["ثانية","Sec"],["تصفّحي العرض","Shop the offer"],["فئات العرض","Offer categories"],["٥٠ مل","50ml"],["٧٥ مل","75ml"],["عناية ليلية","Night care"],["هدايا","Gifts"],["لوحة مراجعة الشاشات","Screen review panel"],["الشاشات","Screens"],["الماركات","Brands"],["متجر تجريبي","Demo Store"],["الجديد","New"],["العطور","Fragrance"],["العناية","Care"],["الهدايا","Gifts"],["المجلة","Journal"],["العناية بالبشرة","Skincare"],["العناية بالشعر","Haircare"],["عبير البنفسج","Violet Veil"],["ليل اللافندر","Lavender Nocturne"],["جذور الميرمية","Sage Roots"],["ندى الحقول","Field Dew"],["حمضيات بيضاء","White Citrus"],["أو دو بارفان ٥٠ مل","Eau de parfum 50ml"],["أو دو بارفان ٧٥ مل","Eau de parfum 75ml"],["عطر خشبي ٥٠ مل","Woody parfum 50ml"],["ماء عطري ١٠٠ مل","Scented water 100ml"],["زيت عطري ٣٠ مل","Perfume oil 30ml"],["كولونيا ١٠٠ مل","Cologne 100ml"],["برغموت، لافندر، مسك","Bergamot, Lavender, Musk"],["عنبر، بنفسج، فانيلا","Amber, Violet, Vanilla"],["ميرمية، أرز، فيتيفر","Sage, Cedar, Vetiver"],["نعناع، ليمون، أوراق خضراء","Mint, Lemon, Green leaves"],["مسك، أوركيد، خشب أبيض","Musk, Orchid, White wood"],["جريب فروت، نيرولي، مسك","Grapefruit, Neroli, Musk"],["زيت الترميم","Repair Oil"],["الأكثر طلباً","Best seller"],["الأكثر طلبًا","Best seller"],["جديد","New"],["كيف تختارين عطراً يهدأ مع بشرتك؟","How to choose a scent that settles with your skin"],["طقوس المساء: أربع خطوات بلا استعجال","Evening ritual: four unhurried steps"],["من الحقل إلى الزجاجة في يوم واحد","From field to bottle in one day"],["دليل العطر","Scent guide"],["حكاياتنا","Stories"],["بلوزة","Blouse"],["تنورة","Skirt"],["فستان","Dress"],["قميص","Shirt"],["قائمة الأمنيات","Wishlist"],["الحساب","Account"]];
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
      button.dataset.languageSwitch = target;
      button.textContent = target === 'en' ? 'EN' : 'AR';
      button.setAttribute('aria-label', target === 'en' ? 'English' : 'العربية');
      button.disabled = false;
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

  const languageCandidates = (languages) => {
    if (Array.isArray(languages)) return languages;
    if (languages && typeof languages === 'object') return Object.values(languages);
    return [];
  };

  const switchTo = async (locale) => {
    const target = locale === 'en' ? 'en' : 'ar';
    const api = window.salla || window.Salla;
    try {
      if (api?.onReady) await api.onReady();
      const languages = await Promise.resolve(api?.config?.languages?.());
      const candidate = languageCandidates(languages).find((item) => {
        const code = typeof item === 'string' ? item : item?.code || item?.language_code || item?.locale || item?.id;
        return String(code || '').slice(0, 2).toLowerCase() === target;
      });
      const serverUrl = candidate && typeof candidate === 'object'
        ? candidate.url || candidate.link || candidate.redirect_url
        : null;
      if (serverUrl) {
        try { window.localStorage.setItem('velora-locale', target); } catch {}
        api?.cookie?.set?.('s-lang', target);
        window.location.assign(serverUrl);
        return 'server';
      }
    } catch {}
    applyLocale(target);
    return 'client';
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
