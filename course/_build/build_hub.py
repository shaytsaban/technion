# Course hub. Run: python3 build_hub.py  ->  ../index.html
# A meeting without a recording yet gets the placeholder box; put a YouTube id in REC to embed it.
import os, re, sys
H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H)
exec(open(os.path.join(H, 'plan.py'), encoding='utf8').read())
n = lambda s: f'<span class="n">{s}</span>'
D = open(os.path.join(H, '..', 'lectures', 'lecture-1', 'presentation.html'), encoding='utf8').read()
NS = D.count('<section class="slide')
NA = len(__import__('json').load(open(os.path.join(H, 'tests', 'manifest.json'), encoding='utf8')))
BUILT = {1}
REC = {}     # meeting -> YouTube id
css = open(os.path.join(H, 'shell', 'hub.css'), encoding='utf8').read() + '''
.hero h1{font-size:clamp(38px,7vw,64px)}.hero .h1s{font-size:clamp(20px,3vw,28px);font-weight:700;color:#7fe3d6;margin-top:6px;line-height:1.25}
.cred{margin-top:18px;display:inline-block;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.28);border-radius:14px;padding:10px 18px;font-size:16px;line-height:1.55;color:#e4ebfb}.cred b{color:#ffd37a}
.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:-34px;position:relative;z-index:2}
.fact{background:#fff;border-radius:18px;padding:16px 20px;box-shadow:0 2px 0 var(--line),0 14px 34px rgba(22,33,58,.1);border-top:6px solid var(--coral)}
.fact:nth-child(2){border-top-color:#0f9d90}.fact:nth-child(3){border-top-color:#e8960c}.fact:nth-child(4){border-top-color:#27447f}
.fact .fi{font-size:28px;line-height:1}.fact b{display:block;font-size:19px;font-weight:800;color:var(--navy2);margin-top:6px}.fact>span{display:block;font-size:15.5px;color:var(--ink2);line-height:1.4;margin-top:2px}
.fact a{direction:ltr;unicode-bidi:isolate;display:inline-block;text-decoration:underline;overflow-wrap:anywhere}
.halves{display:flex;gap:10px;margin-top:16px;font-weight:800;font-size:15.5px;flex-wrap:wrap}
.halves>span{border-radius:99px;padding:5px 16px}.halves .a{background:#dff5f2;color:#087469}.halves .b{background:#ece8ff;color:#4f33c9}.halves .c{background:#fff0d2;color:#a86703}.halves .d{background:#ffe3dc;color:#b8391f}
.funnel{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;align-items:center}.funnel span{background:#fff;border-radius:14px;padding:8px 14px;font-weight:800;color:var(--navy2);box-shadow:0 2px 0 var(--line);font-size:16px}.funnel i{font-style:normal;color:var(--coral);font-weight:800}.funnel span.now{background:var(--coral);color:#fff}
.rec1{margin-top:18px}.recbig{position:relative;aspect-ratio:16/9;border-radius:16px;background:linear-gradient(150deg,#0f1b33,#27447f);display:grid;place-items:center;color:#d6e0f7}.rb-in{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:16px}.rb-in b{color:#fff;font-size:20px}.rb-play{width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.14);display:grid;place-items:center;font-size:24px;color:#fff;direction:ltr}
.pc{min-height:150px}.pc small{display:block;font-size:13.5px;color:var(--ink2);margin-top:4px;line-height:1.35}
.plan{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:14px}
.pc{position:relative;background:#fff;border-radius:16px;padding:14px 16px 36px;box-shadow:0 2px 0 var(--line);border-right:7px solid #0f9d90;display:block;color:inherit;text-decoration:none;min-height:124px;transition:transform .15s}
.pc:hover{transform:translateY(-3px)}.pc.b{border-right-color:#6d4df2}.pc.c{border-right-color:#e8960c}.pc.d{border-right-color:#c4421f}
.pc.on{box-shadow:0 0 0 3px var(--coral),0 14px 30px rgba(255,106,77,.22)}
.pc .pn{display:inline-grid;place-items:center;min-width:32px;height:32px;border-radius:10px;background:var(--navy2);color:#fff;font-weight:800;font-size:17px;margin-bottom:6px}
.pc b{display:block;font-size:17px;line-height:1.3;font-weight:800;color:var(--navy2)}
.pc em{position:absolute;bottom:10px;right:16px;font-style:normal;font-size:13px;font-weight:800;color:var(--mut);background:#eef0f6;border-radius:99px;padding:1px 12px}
.pc.on em{background:var(--coral);color:#fff}
.cgrid{grid-template-columns:1fr 1fr 1fr}
.lec.up .lec-head{padding-bottom:6px}.lec.up .lec-n{background:#8a93aa;width:52px;height:52px;font-size:24px;border-radius:14px}.lec.up .lec-head h3{font-size:21px}
.upb{display:grid;grid-template-columns:1.5fr 1fr;gap:24px;padding:4px 30px 22px;align-items:center}
.upb p{font-size:16px;color:var(--ink2);line-height:1.5}.upb .soon{margin-top:6px;font-weight:700;color:var(--mut)}
.recsm{position:relative;aspect-ratio:16/6;border-radius:14px;background:linear-gradient(150deg,#0f1b33,#27447f);display:flex;gap:12px;align-items:center;justify-content:center;color:#d6e0f7;font-size:15px}
.recsm .play{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.14);display:grid;place-items:center;font-size:16px;color:#fff;direction:ltr}.recsm b{color:#fff;display:block;font-size:15.5px}
@media (max-width:900px){.plan{grid-template-columns:repeat(2,1fr)}.facts{grid-template-columns:repeat(2,1fr)}.cgrid{grid-template-columns:1fr}.upb{grid-template-columns:1fr;padding:4px 18px 18px}}
@media (max-width:560px){.plan{grid-template-columns:1fr}.pc{min-height:0}.facts{grid-template-columns:1fr;margin-top:-22px}}
'''
lk = lambda k, href, e, b, d: f'<a class="lk {k}" href="{href}" target="_blank" rel="noopener"><span class="e">{e}</span><span><b>{b}</b><span class="d">{d}</span></span></a>'
plan = ''.join(f'<a class="pc {k}{" on" if i in BUILT else ""}" href="#lesson-{i}"><span class="pn">{n(i)}</span><b>{t}</b><small>התוצר: {p}</small><em>{"באתר" if i in BUILT else "בקרוב"}</em></a>' for i, t, d, k, p in PLAN)
FUN = ['תהליך עסקי', 'החלטה', 'דרישות', 'נתונים', 'שאילתות', 'מערכת', 'לוח מחוונים', 'בקרה ותקשורת']
funnel = '<i>←</i>'.join(f'<span class="{"now" if j < 3 else ""}">{x}</span>' for j, x in enumerate(FUN))


def rec(i, big=False):
    if i in REC:
        return f'<div class="recbox"><iframe src="https://www.youtube-nocookie.com/embed/{REC[i]}" title="הקלטת מפגש {i}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>'
    if big:
        return f'<div class="recbig"><div class="rb-in"><span class="rb-play">&#9654;</span><b>הקלטת מפגש {n(i)}</b><span>תועלה לאחר המפגש</span></div></div>'
    return f'<div class="recsm" id="rec-{i}"><span class="play">&#9654;</span><span><b>הקלטת מפגש {n(i)}</b>תועלה לאחר המפגש</span></div>'


ups = ''.join(f"""<article class="lec up" id="lesson-{i}"><div class="lec-head"><div class="lec-n">{i}</div><div><h3>{t}</h3><div class="sub">מפגש {n(i)} · בקרוב</div></div></div>
<div class="upb"><div><p>{d}</p><p class="soon">התוצר של המפגש: {p}. המצגת והסיכום יעלו לאתר לקראת המפגש.</p></div>{rec(i)}</div></article>""" for i, t, d, k, p in PLAN if i not in BUILT)
html = f"""<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ניתוח מערכות וניהול פרויקטים בעידן ה-AI | נתונים, מערכות ובינה מלאכותית</title>
<meta name="description" content="אתר המפגשים של ד״ר שי צבאן בתוכנית ניתוח מערכות וניהול פרויקטים בעידן ה-AI, הטכניון, היחידה ללימודי חוץ: מצגות אינטראקטיביות, סיכומים והקלטות.">
<link rel="stylesheet" href="assets/fonts.css">
<style>{css}</style>
</head>
<body>
<header class="hero"><div class="wrap">
<div class="kick"><span>הטכניון, היחידה ללימודי חוץ</span></div>
<h1>ניתוח מערכות וניהול פרויקטים בעידן ה-AI</h1>
<div class="h1s">נתונים, מערכות ובינה מלאכותית: מהתהליך העסקי ועד לוח הבקרה</div>
<p class="lead">בחלק הזה של התוכנית עוברים את הדרך כולה על מקרה אחד, ביסטרו אולאף: מבינים את התהליך ואת ההחלטה, מגדירים דרישות, בונים מודל נתונים, קוראים שאילתות, מחברים מערכת, ומציגים למנהל. עוזר ה-AI כותב מהר. מה לכתוב, ולמה, ואיך בודקים שזה נכון, מחליטים אתם. לכל מפגש: מצגת אינטראקטיבית עם פעילויות ובדיקה מיידית, סיכום כתוב, והקלטה.</p>
<p class="meta">ד״ר שי צבאן · {n(len(PLAN))} מפגשים מתוכננים · בכל מפגש תוצר אחד לתיק המערכת</p>
<div class="cred">בחלק שלנו לומדים את התשתית ואת ההבנה. <b>ד״ר עופרה אור</b> תיקח את הידע הזה לרמת פריסת הפרויקט בשטח, בפועל. היבטים מעשיים יינתנו במידה מסוימת גם בחלק שלנו.</div>
</div></header>
<main class="wrap">
<section class="facts">
<div class="fact"><div class="fi">🧭</div><b>משפך אחד</b><span>שמונה תחנות, מהתהליך העסקי ועד הבקרה. כל מפגש מתקדם תחנה.</span></div>
<div class="fact"><div class="fi">🍽️</div><b>מקרה אחד</b><span>ביסטרו אולאף מלווה את כל המפגשים, ולצדו תהליך אחד מהעבודה שלכם.</span></div>
<div class="fact"><div class="fi">🔎</div><b>קוראים, לא מקלידים</b><span>שאילתות נבנות קליק אחר קליק, עם הסבר לכל חלק. הכתיבה נעשית בעזרת כלי AI.</span></div>
<div class="fact"><div class="fi">✉️</div><b>פניות למרצה</b><span><a href="mailto:shay.tsaban@gmail.com">shay.tsaban@gmail.com</a><br>יש לציין את שם המוסד ואת שם הקורס.</span></div>
</section>
<section class="block" id="plan">
<h2 class="sec">תוכנית המפגשים</h2>
<div class="funnel">{funnel}</div>
<p class="cnote">שלוש התחנות המסומנות נלמדות במפגש {n(1)}.</p>
<div class="halves"><span class="a">מפגש {n(1)}: להבין לפני שבונים</span><span class="b">מפגשים {n(2)} עד {n(4)}: נתונים ושאילתות</span><span class="c">מפגשים {n(5)} עד {n(8)}: מערכת ובינה מלאכותית</span><span class="d">מפגשים {n(9)} עד {n(12)}: לראות, לבקר, להציג</span></div>
<div class="plan">{plan}</div>
<p class="cnote">ייתכנו שינויים בסדר הנושאים, במספר המפגשים ובקצב ההתקדמות. החומרים של כל מפגש עולים לאתר לקראת המפגש.</p>
</section>
<section class="block">
<h2 class="sec">המפגשים</h2>
<article class="lec" id="lesson-1">
<div class="lec-head"><div class="lec-n">1</div><div><h3>מהתהליך העסקי לדף המערכת</h3><div class="sub">מפגש {n(1)} · {n(DATES[1])} · {n(5)} שעות</div></div></div>
<div class="lec-body">
<div><h4>מה עושים במפגש</h4><ul class="learn">
<li>האדריכל והקבלן: מה עוזר AI עושה היטב, ומה נשאר באחריותנו</li>
<li>התהליך העסקי: מצב קיים, נקודות כשל עם מספרים, מצב רצוי</li>
<li>מנתון להחלטה, ותכנון מההחלטה אחורה</li>
<li>מבעיה לדרישה שאפשר לבדוק: סיפור משתמש ותנאי קבלה</li>
<li>ישויות, מאפיינים ומזהים, ושתי שאילתות שנקראות קליק אחר קליק</li>
<li>עבודה עם עוזר AI: הנחיה בארבעה חלקים, שלוש מלכודות, ביקורת פלט</li>
<li>הודעה למנהל: ממצא, משמעות, בקשה</li>
<li>דף המערכת, ותרגילים מסכמים על מקרה חדש</li>
</ul>
<div class="rec1" id="rec-1"><h4>הקלטת המפגש</h4>{rec(1, True)}</div>
</div>
<div><h4>חומרי המפגש</h4>
<div class="grp"><h5>1. במפגש</h5><div class="links">
<a class="lk p" href="lectures/lecture-1/presentation.html"><span class="e">🖥️</span><span><b>מצגת המפגש</b><span class="d">{n(NS)} שקפים ו-{n(NA)} פעילויות: מיון, סידור, הרכבה, בודק ניסוח, שאילתות מונפשות ומשימות עבודה עצמית. כל רעיון נבנה קליק אחר קליק.</span></span></a>
</div></div>
<div class="grp"><h5>2. אחרי המפגש, לחזרה</h5><div class="links">
<a class="lk s" href="lectures/lecture-1/summary.pdf" target="_blank" rel="noopener"><span class="e">📄</span><span><b>סיכום המפגש (PDF)</b><span class="d">כל תוכן המצגת במסמך אחד: הגדרות, דוגמאות, הפעילויות עם התשובות, התרגילים עם ההסברים, ומילון מושגים.</span></span></a>
</div></div>
<div class="grp"><h5>3. תרגול</h5><div class="links">
<a class="lk p" href="lectures/lecture-1/presentation.html#q-open"><span class="e">✍️</span><span><b>תרגילים מסכמים, בתוך המצגת</b><span class="d">שמונה שאלות על מקרה חדש, מהקל אל הקשה, עם הסבר לכל תשובה.</span></span></a>
</div></div>
</div>
</div>
<div class="todo"><h4>📝 עד מפגש {n(2)}</h4><ol>
<li><b>להשלים</b> את דף המערכת של התהליך שלכם, בשבע שורות.</li>
<li><b>להראות</b> אותו לאדם אחד מהעבודה, ולרשום שאלה אחת שהוא שאל ולא ידעתם לענות עליה.</li>
<li><b>לחזור</b> על התרגילים המסכמים ועל הסיכום הכתוב.</li>
</ol></div>
</article>
{ups}
</section>
<footer>ד״ר שי צבאן · הטכניון, היחידה ללימודי חוץ · פניות במייל: <a href="mailto:shay.tsaban@gmail.com">shay.tsaban@gmail.com</a>, עם שם המוסד ושם הקורס</footer>
</main>
</body>
</html>
"""
for bad in ('—', '־', '–'):
    assert bad not in html, bad
open(os.path.join(H, '..', 'index.html'), 'w', encoding='utf8').write(html)
print('hub', len(html), 'slides', NS, 'activities', NA)
