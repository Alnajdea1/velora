# RAMZ — build brief for Higgsfield

Everything needed to rebuild this site in Higgsfield's website builder: the
prompt to paste, the brand tokens, the chapter specs, the exact copy in both
languages, and the assets.

Upload alongside the prompt: `assets/media/reel-placeholder.mp4` (replace with
the real footage first — see **Assets**) and `assets/media/reel-poster.jpg`.

---

## 1. The prompt

> Build a bilingual (Arabic RTL / English LTR) marketing site for RAMZ, a Saudi
> company whose product answers questions about your business inside WhatsApp:
> you ask in plain language and the answer comes back from your own systems —
> contracts, orders, sales, projects.
>
> The whole page is one scroll-driven film in six chapters. Each chapter holds
> the full viewport while it plays: it pins in place, its content advances as
> the reader scrolls, then it releases and the next chapter takes the screen.
> Scroll position drives everything — nothing runs on a timer or autoplays.
>
> Chapter 2 is a video whose timeline is bound to scroll: scrolling forward
> advances the clip, scrolling back reverses it, stopping stops it. The video
> is muted, plays inline, has no controls, and fills a card that opens from
> rounded-and-inset to full bleed as the chapter takes the screen, then closes
> again on the way out.
>
> Every chapter carries its number and name in a monospace label on the reading
> edge — 01 The question, 02 The idea, 03 The conversation, 04 The layers,
> 05 The sectors, 06 The start — and a thin vertical rail at the side marks
> which chapter currently holds the screen. The numbering reflects the real
> order of the story, so keep it in sequence.
>
> Two controls sit in a floating pill at the top: a language toggle (Arabic ⇄
> English, switching text direction with it) and a light/dark toggle. Both
> remember the reader's choice. First visit follows the browser language and
> the system colour scheme.
>
> Under `prefers-reduced-motion: reduce`, drop all pinning and scrubbing and
> present the same content as a plain, fully visible document.
>
> Tone of the Arabic copy is Saudi conversational — keep the supplied strings
> exactly as written, do not rewrite them into formal Arabic or corporate
> marketing language.

---

## 2. Brand tokens

| Token | Light | Dark |
|---|---|---|
| Accent | `#7B3FA0` | `#A970D0` |
| Accent soft | `#A46FC4` | `#C9A2E4` |
| Accent deep | `#4E2168` | `#E4D2F2` |
| Page ground | `#F5F1EA` | `#0C0A0E` |
| Ground alt | `#EFE9E0` | `#131017` |
| Surface | `#FFFFFF` | `#17131C` |
| Text | `#1C1420` | `#F6F2F8` |
| Text muted | `#574C5E` | `#B9B0C1` |
| Text faint | `#8A8091` | `#857B8E` |
| Film ground | `#0B090D` | `#0B090D` |

Semantic (both themes): positive `#2E9E5B`, attention `#C9603F`, WhatsApp
bubble `#D9F5D0` on light / `#22482A` on dark.

**Type** — three roles, no others:

| Role | Face | Weight | Notes |
|---|---|---|---|
| Display | Rubik | 900 / 800 | headlines, stat values, sector words; tracking −0.045em on the largest sizes |
| Body | Readex Pro | 300 (500 on buttons) | all running text, both scripts |
| Utility | IBM Plex Mono | 300 | chapter labels, data labels, source chips, letter-spacing 0.26em |

All three are on Google Fonts and cover Arabic and Latin. Radii: 12 / 18 / 28px
and a full pill. Container width 1180px with a 1.25rem minimum side gutter.

---

## 3. The six chapters

**01 — The question** (page ground, not film)
Headline, one line of supporting text, a primary button, and three short facts
on a hairline rule. As the reader scrolls, the block eases back and dims while
a giant faint "رمز" watermark drifts the opposite way. Must be fully readable
at rest, before any scrolling.

**02 — The idea** (film)
The scroll-scrubbed video. Five captions appear and leave across the clip, each
with its own index (01/05 … 05/05), all on the same reading edge at the lower
third — never centred over the subject. A hairline at the foot of the frame
fills as the clip advances. Text is white on a gradient that darkens only the
foot of the frame, plus a soft vignette; never darken the whole picture.

**03 — The conversation** (pinned)
Two columns: a WhatsApp-style thread and a live dashboard. Scroll plays four
exchanges — the question appears, the answer follows a beat later with a
source chip naming the system it came from — and each answer lights the
matching dashboard tile while its number counts up. The composer echoes
whichever question is on screen. Arabic uses Arabic-Indic digits, English uses
Latin.

**04 — The layers** (pinned)
Four service cards dealt one over the next as the chapter plays: the front card
is fully legible, the ones behind are stacked and slightly scaled, the outgoing
one lifts away and clears quickly so two are never readable at once.

**05 — The sectors** (pinned)
One line of copy and a horizontal strip of sector names at display size that
travels across the screen as the reader scrolls — not a CSS loop.

**06 — The start** (pinned)
Closing panel: the accent gradient opens from a rounded inset card to full
bleed as the chapter arrives, carrying the closing headline, one line, a button
and the contact email.

---

## 4. Copy

### Chapter labels
| # | Arabic | English |
|---|---|---|
| ٠١ / 01 | السؤال | The question |
| ٠٢ / 02 | الفكرة | The idea |
| ٠٣ / 03 | المحادثة | The conversation |
| ٠٤ / 04 | الطبقات | The layers |
| ٠٥ / 05 | القطاعات | The sectors |
| ٠٦ / 06 | البداية | The start |

### Navigation
| Arabic | English |
|---|---|
| رمـز | RAMZ |
| الخدمات | Services |
| الديمو | Demo |
| تواصل معنا | Talk to us |

### 01 — The question
**AR** eyebrow: `RAMZ — أتمتة الأعمال`
headline: `اسأل شركتك على الواتساب،` / `ورمز يعطيك الزبدة.` (accent on «الزبدة»)
lede: `نربط أنظمة شركتك، فتسأل بلغتك ويجيك الجواب مباشرة — بدون تقارير ولا انتظار أحد.`
button: `جرّب الديمو`
facts: `ثوانٍ` — `بدل تقارير تاخذ أيام` · `على واتساب` — `بدون تطبيق جديد يتعلمونه` · `من أنظمتك` — `الجواب من بياناتك، مو تخمين`

**EN** eyebrow: `RAMZ — BUSINESS AUTOMATION`
headline: `Ask your company on WhatsApp,` / `RAMZ gives you the answer.` (accent on «the answer»)
lede: `We connect your systems, so you ask in plain language and the answer comes straight back — no reports, no waiting on anyone.`
button: `See the demo`
facts: `Seconds` — `instead of reports that take days` · `On WhatsApp` — `no new app for your team to learn` · `From your systems` — `answers from your data, not guesses`

### 02 — The idea (video captions, in order)
| AR | EN |
|---|---|
| مو مجرد واتساب. | Not just WhatsApp. |
| اسأل شركتك. | Ask your company. |
| ورمز يعطيك الزبدة. | RAMZ gives you the answer. |
| معلومة. ملف. تقرير. طلب. — كلها من نفس المحادثة. | A number. A file. A report. A request. — All from the same chat. |
| هذا رمز. | This is RAMZ. |

### 03 — The conversation
Eyebrow `من بياناتك` / `FROM YOUR DATA` · heading `نفس الجواب، محدَّث لحظة بلحظة.` / `The same answer, current to the minute.` · status `متصل ببيانات الشركة` / `connected to company data` · placeholder `اكتب سؤالك…` / `Ask anything…` · button `اطلب الخدمة وجرّب` / `Request access`

| # | Question | Source | Answer | Lights |
|---|---|---|---|---|
| 1 | كم عقد وقّعنا هذا الشهر؟ / How many contracts did we sign this month? | من نظام العقود / from contracts | ١٢ عقد هذا الشهر، بقيمة ٤.٨ مليون ريال — أعلى بثلاثة عقود عن الشهر اللي راح. / 12 contracts this month, worth SAR 4.8M — three more than last month. | contracts + value |
| 2 | وش الطلبات اللي للحين ما تقفلت؟ / Which orders are still open? | من نظام الطلبات / from orders | عندك ٧ طلبات مفتوحة، منها ٢ متأخرة عن موعدها. أرسل لك قائمتها الحين؟ / You have 7 open orders, 2 of them overdue. Want the list now? | orders |
| 3 | عطني ملخص مبيعات الأسبوع. / Give me this week's sales. | من لوحة المبيعات / from sales | مبيعات الأسبوع ١.٩ مليون ريال، بزيادة ١٤٪ عن الأسبوع اللي قبله. أقوى يوم كان الثلاثاء. / Sales came to SAR 1.9M this week, up 14% on the week before. Tuesday was the strongest day. | sales |
| 4 | وش صار على المشروع؟ / Where did the project get to? | من متابعة المشاريع / from projects | ٣ من ١٢ عقد لسه بانتظار التوقيع — كلها عند الطرف الثاني. أذكّرهم نيابة عنك؟ / 3 of 12 contracts are still waiting on signature — all of them on the other side. Should I chase them for you? | pending |

Dashboard tiles — label / value / meta:
- عقود موقّعة هذا الشهر · ١٢ · +٣ عن الشهر الماضي — Contracts signed this month · 12 · +3 on last month
- قيمة العقود · ٤.٨م · ريال سعودي — Contract value · 4.8M · SAR
- طلبات مفتوحة · ٧ · ٢ منها متأخرة — Open orders · 7 · 2 of them overdue
- مبيعات الأسبوع · ١.٩م · +١٤٪ عن الأسبوع اللي راح — Sales this week · 1.9M · +14% on last week
- Progress bar: عقود بانتظار التوقيع · ٢٥٪ · ٣ من ١٢ عقد لسه ما اكتملت — Contracts awaiting signature · 25% · 3 of 12 contracts still open

### 04 — The layers
Heading `وراء السؤال، شغل كثير.` / `Behind the question, a lot of work.` (accent on «شغل كثير» / «a lot of work»)
Lede `أربع طبقات تشتغل ورا الكواليس، عشان السؤال يطلع جواب.` / `Four layers running backstage, so a question comes back as an answer.`

1. **وكيل ذكي على واتساب** / **An agent on WhatsApp** — `ما فيه تطبيق جديد ولا تدريب. فريقك يسأل من نفس الواتساب اللي يستخدمه كل يوم، بالعامية، ويجيه الجواب من أنظمتكم مباشرة — مع مصدر الجواب عشان تتأكد.` / `No new app, no training. Your team asks in the same WhatsApp they already use, in their own words, and the answer comes from your systems — with its source attached so they can check it.`
   · يفهم اللهجة والاختصارات الداخلية · صلاحيات لكل موظف حسب دوره · يرجّع المصدر مع كل رقم
   · Understands dialect and internal shorthand · Permissions per person and role · Every figure cites its source
2. **أتمتة الإجراءات** / **Automated procedures** — `الشغل المكرر اللي ياخذ من فريقك ساعات — إنشاء عقد، تذكير بتوقيع، متابعة طلب، تحديث حالة — يصير يمشي لحاله وينبّهك بس لما يحتاجك.` / `The repetitive work that eats your team's hours — drafting a contract, chasing a signature, following an order, updating a status — runs on its own and only interrupts you when it needs you.`
   · مسارات موافقة بخطوات واضحة · تنبيهات قبل ما يفوت الموعد · سجل كامل لكل إجراء صار
   · Approval paths with clear steps · Alerts before a deadline passes · A full record of every action
3. **لوحات وتحليلات** / **Dashboards and analytics** — `لوحة وحدة تجمع أرقامك كلها، بنفس المصدر اللي يجاوب منه رمز. تفتحها تلقى الصورة كاملة، وتسأل عن أي رقم فيها بالتفصيل.` / `One board holding all your numbers, off the same source RAMZ answers from. Open it for the whole picture, then ask about any figure on it in detail.`
   · مؤشرات تختارها أنت، مو قوالب جاهزة · تقرير يوصلك على واتساب كل صباح · تصدير للإكسل بضغطة
   · Metrics you choose, not a fixed template · A morning summary on WhatsApp · Export to Excel in one click
4. **حلول ذكاء مخصصة** / **Custom AI solutions** — `عندك حالة ما تشبه أحد؟ نجلس معك، نفهم شغلك، ونبني لك حل على مقاسك — من ربط نظام قديم، لين نموذج يقرأ مستنداتكم ويطلّع منها الزبدة.` / `Got a case that looks like nobody else's? We sit with you, learn how you work, and build to fit — from wiring in a legacy system to a model that reads your documents and pulls out what matters.`
   · ربط مع أنظمتكم الحالية · قراءة المستندات والعقود آليًا · بياناتكم تبقى عندكم
   · Integrates with your current systems · Reads documents and contracts · Your data stays yours

### 05 — The sectors
Line: `بدينا من العقار. ونفس الطريقة تنفع لأي قطاع.` / `We started in real estate. The same approach fits any sector.`
Strip: العقار · المقاولات · التجزئة · اللوجستيات · الخدمات المالية · الرعاية الصحية · التعليم
— Real estate · Construction · Retail · Logistics · Financial services · Healthcare · Education

### 06 — The start
Heading `ورّنا شغلك، ونقولك وش ينفع يتأتمت.` / `Show us how you work, we'll show you what can run itself.`
Lede `جلسة قصيرة، نسمع منك ونوريك الديمو على بياناتك أنت — بدون التزام.` / `A short session: we listen, then walk you through the demo on your own data — no commitment.`
Button `احجز الديمو` / `Book the demo` → `mailto:contact@ramz.net.sa` · email shown: `contact@ramz.net.sa`
Footer `© ٢٠٢٦ رمز — جميع الحقوق محفوظة` / `© 2026 RAMZ — All rights reserved`

---

## 5. Assets

The bundled clip is a **labelled placeholder**, not brand footage. Encode the
real clip for seeking — a keyframe every 5–10 frames is what makes scrubbing
smooth; the usual 2-second interval makes the picture jump:

```sh
ffmpeg -i source.mov -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -g 5 -keyint_min 5 -sc_threshold 0 -crf 20 -movflags +faststart -an \
  reel.mp4
```

Keep it muted with no audio track, and supply a poster frame (first frame,
JPEG). The video should fill its frame — crop through the frame rather than
letterboxing, and keep the subject clear of the lower third where the captions
sit.

---

## 6. Acceptance checklist

- [ ] Scroll forward advances the clip, backward reverses it, stopping stops it — no lag behind the scroll
- [ ] Each chapter pins, plays, and releases with no jump at the hand-off
- [ ] Language toggle switches copy **and** direction; layout mirrors correctly in both
- [ ] Theme toggle works in both languages; nothing loses contrast in either
- [ ] Arabic uses Arabic-Indic digits, English Latin
- [ ] Reduced motion: nothing pins, everything visible
- [ ] No horizontal scrolling at any width down to 390px
- [ ] Works when the video fails to load: captions and content still tell the story
