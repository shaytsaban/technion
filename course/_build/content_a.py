# Lesson content helpers, shared by the deck and the summary. Executed with MODE = 'deck' or 'pdf'.
# The lesson itself is in content_l<N>*.py. Forked from the quantitative-methods kit, without the math layer.
from toons import TOONS
import json, re, html as _html

COURSE = 'ניתוח מערכות וניהול פרויקטים בעידן ה-AI'
INST = 'הטכניון, היחידה ללימודי חוץ'
THREAD = 'נתונים, מערכות ובינה מלאכותית'
LESSON = globals().get('LESSON', 1)
SL = []            # every slide, in order
CUR = [None]       # current part number
NACT = [0]         # activities
MAN = []           # manifest for the tests
G = {}             # glossary

NUM = re.compile(r'(?:(?<![^\s(>])[−-]|(?<![\w.,/]))(?:\d{1,3}(?:,\d{3})+(?:\.\d+)?%?|\d+(?:\.\d+)*%?)')


def TX(s):
    """Prose markup: [[key|text]] glossary term, **bold**, `ltr code`, and LTR isolation of every number."""
    s = re.sub(r'\[\[(\w+)\|([^\]]+)\]\]', r'<span class="term" data-t="\1">\2</span>', s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s, flags=re.S)
    s = re.sub(r'`([^`]+)`', r'<bdi class="en" dir="ltr">\1</bdi>', s)
    return ''.join(seg if seg.startswith('<') else NUM.sub(lambda m: f'<span class="n">{m.group(0)}</span>', seg) for seg in re.split(r'(<[^>]+>)', s))


def S(sid, title, h, body, kick=None, cls='', kind='slide'):
    assert not any(s['id'] == sid for s in SL), 'duplicate slide id ' + sid
    SL.append(dict(id=sid, title=title, h=h, body=body, kick=kick, cls=cls, kind=kind, part=CUR[0]))


def ST(n, html, tag='div', cls=''):
    return f'<{tag} class="st {cls}" data-n="{n * 10}">{html}</{tag}>'


def KICK(t):
    return f'חלק {CUR[0]} · {t}' if CUR[0] else t


def DEF(name, text, demo, n=0, cls=''):
    """One definition with its small demonstration. The English name, in brackets at the end, is isolated."""
    m = re.search(r'\s*\(([A-Za-z][^()]*)\)$', name)
    en = f' <bdi class="den" dir="ltr">({m.group(1)})</bdi>' if m else ''
    if m: name = name[:m.start()]
    inner = f'<b class="dn">{TX(name)}{en}</b><p>{TX(text)}</p><div class="demo"><b>דוגמה:</b> {TX(demo)}</div>'
    return ST(n, inner, cls='card def ' + cls) if n else f'<div class="card def {cls}">{inner}</div>'


def BAND(kind, text, n=0):
    lab = {'dg': 'דגש', 'trap': 'המלכודת', 'tip': 'טיפ', 'real': 'בעולם האמיתי', 'why': 'למה זה חשוב', 'do': 'מחר בעבודה'}.get(kind, '')
    k = {'real': 'note', 'why': 'dg', 'do': 'tip'}.get(kind, kind)
    inner = (f'<b>{lab}:</b> ' if lab else '') + TX(text)
    return ST(n, inner, cls='band ' + k) if n else f'<div class="band {k}">{inner}</div>'


def TABLE(head, rows, cls='', n0=0):
    """n0: when set, row k is revealed at step n0 + k."""
    h = ''.join(f'<th>{TX(x)}</th>' for x in head)
    b = ''.join(f'<tr{(" class=" + chr(34) + "st" + chr(34) + " data-n=" + chr(34) + str((n0 + i) * 10) + chr(34)) if n0 else ""}>' + ''.join(f'<td>{TX(c)}</td>' for c in r) + '</tr>' for i, r in enumerate(rows))
    return f'<table class="tbl2 {cls}"><tr>{h}</tr>{b}</table>'


def CARD(html, n=0, cls=''):
    return ST(n, html, cls='card ' + cls) if n else f'<div class="card {cls}">{html}</div>'


def CT(title, text, n=0, cls=''):
    """A titled card."""
    return CARD(f'<b class="ct">{TX(title)}</b><p>{TX(text)}</p>', n, cls)


def P(t, cls='lg'):
    return f'<p class="{cls}">{TX(t)}</p>'


def ROW(*cols, cls=''):
    return f'<div class="row top {cls}">' + ''.join(f'<div class="col">{c}</div>' for c in cols) + '</div>'


def UL(items, n0=0, cls='blt'):
    return f'<ul class="{cls}">' + ''.join((f'<li class="st" data-n="{(n0 + i) * 10}">' if n0 else '<li>') + TX(x) + '</li>' for i, x in enumerate(items)) + '</ul>'


def opener(n, title, q, learn, mins, note=''):
    CUR[0] = n
    SL.append(dict(id=f'p-{n}', title=f'פתיחת חלק {n}: {title}', h=title, kind='opener', part=n, q=q, learn=learn, mins=mins, note=note, cls='', kick=None, body=''))


def _svg(inner, vb='0 0 120 120', cls=''):
    return f'<svg viewBox="{vb}" dir="ltr" class="{cls}" role="img" aria-hidden="true">{inner}</svg>'


def ART(key):
    """A cartoon from TOONS, or a large emoji."""
    return _svg(TOONS[key]) if key in TOONS else f'<span class="emo">{key}</span>'


def TOON(key, punch, n=0, cls=''):
    """A small cartoon with a punchline, in the empty corner of a slide. Not printed in the summary."""
    if MODE == 'pdf': return ''
    inner = f'{ART(key)}<div class="bub">{TX(punch)}</div>'
    return ST(n, inner, cls='toon ' + cls) if n else f'<div class="toon {cls}">{inner}</div>'


def MEME(sid, title, top, panels, after=None):
    """A meme slide: a top caption and two or three panels (art, caption). Not printed in the summary."""
    if MODE == 'pdf': return
    ps = ''.join(f'<div class="mp"><div class="mart">{ART(a)}</div><div class="mcap">{TX(c)}</div></div>' for a, c in panels)
    aft = ST(1, TX(after), cls='band dg memeafter') if after else ''
    S(sid, title, title, f'<div class="memew"><div class="meme big"><div class="mt">{TX(top)}</div><div class="mps">{ps}</div></div>{aft}</div>', kick=KICK('רגע של חיוך'), cls='memes')


def FLOW(steps, n0=1, cls='', sub=True):
    """An animated process diagram: boxes joined by arrows, one box per click. steps: (icon, title, text)."""
    out = ''
    for i, (ic, t, d) in enumerate(steps):
        arrow = '<div class="fa">←</div>' if i else ''
        box = f'{arrow}<div class="fb"><div class="fi">{ic}</div><b>{TX(t)}</b>' + (f'<span>{TX(d)}</span>' if sub and d else '') + '</div>'
        out += f'<div class="st pop fs" data-n="{(n0 + i) * 10}">{box}</div>' if n0 else f'<div class="fs">{box}</div>'
    if MODE == 'pdf':
        return '<ol class="steps">' + ''.join(f'<li><b>{TX(t)}:</b> {TX(d)}</li>' for ic, t, d in steps) + '</ol>'
    return f'<div class="flow {cls}">{out}</div>'


def CHAT(msgs, n0=1):
    """A mock conversation with an AI assistant, one message per click. msgs: ('u' | 'a' | 'x', text). 'x' is a remark of ours."""
    if MODE == 'pdf':
        lab = {'u': 'אנחנו', 'a': 'העוזר', 'x': 'הערה'}
        return '<div class="card">' + ''.join(f'<p><b>{lab[w]}:</b> {TX(t)}</p>' for w, t in msgs) + '</div>'
    out = ''
    for i, (w, t) in enumerate(msgs):
        who = {'u': '<span class="cw">אנחנו</span>', 'a': '<span class="cw">עוזר ה-AI</span>', 'x': ''}[w]
        out += f'<div class="st cm {w}" data-n="{(n0 + i) * 10}">{who}{TX(t)}</div>'
    return f'<div class="chat"><div class="chatbar"><i></i><i></i><i></i><span>הדמיה של שיחה עם עוזר בינה מלאכותית</span></div>{out}</div>'


# ---------------------------------------------------------------- multiple choice

def mc(qid, q, opts, why):
    """Options are written with the right answer first; a fixed rotation per question places it."""
    r = sum(map(ord, qid)) % len(opts)
    opts = opts[-r:] + opts[:-r] if r else opts
    a = r % len(opts)
    o = ''
    for i, t in enumerate(opts):
        mark = ' correct' if MODE == 'pdf' and i == a else ''
        o += f'<button class="o{mark}" data-i="{i}">{"אבגדה"[i]}. {TX(t)}</button>'
    MAN.append(dict(kind='mc', id=qid, right=re.sub('<[^>]+>', '', TX(opts[a])), n=len(opts)))
    return f'<div class="mc" data-a="{a}" id="{qid}"><div class="q">{TX(q)}</div>{o}<div class="w"><b>הסבר:</b> {TX(why)}</div></div>'


def MC1(sid, title, q, opts, why, art=None, story=None):
    """One multiple choice question on its own slide, in large type, with the story it rests on beside it."""
    item = mc(sid + '-q', q, opts, why)
    if MODE == 'pdf':
        S(sid, title, title, (f'<p>{TX(story)}</p>' if story else '') + item); return
    NACT[0] += 1
    side = f'<div class="mc1art">{ART(art)}</div>' if art else ''
    st = f'<div class="card qstem mc1s"><p>{TX(story)}</p></div>' if story else ''
    S(sid, title, title, f'<div class="mc1">{side}<div class="mc1q">{st}{item}</div></div>', kick=KICK('בדיקת הבנה'))


# ---------------------------------------------------------------- activities
RST = '<button class="abtn ghost rst">איפוס</button>'


SART = {'a-sort': '👷', 'c-sort': '🪜', 'd-sort1': '🩺', 'e-sort': '🧱', 'f-sort': '🪤', 'g-sort': '📣'}


def SORTER(aid, title, h, task, options, rows, story=None):
    """Each row gets one right answer out of options. rows: (text, answer index, why)."""
    if MODE == 'pdf':
        t = ''.join(f'<tr><td>{TX(a)}</td><td><b>{TX(options[b])}</b></td><td>{TX(c)}</td></tr>' for a, b, c in rows)
        S(aid, title, h, (f'<p>{TX(story)}</p>' if story else '') + f'<p>{TX(task)}</p><table class="tbl2"><tr><th>השורה</th><th>תשובה</th><th>נימוק</th></tr>{t}</table>')
        return
    MAN.append(dict(kind='sorter', id=aid + '-w', n=len(rows)))
    NACT[0] += 1
    r = ''
    for a, b, c in rows:
        bs = ''.join(f'<button class="so" data-i="{i}">{TX(o)}</button>' for i, o in enumerate(options))
        r += f'<tr class="srow" data-a="{b}" data-w="{_html.escape(TX(c), quote=True)}"><td>{TX(a)}</td><td>{bs}</td></tr>'
    st = f'<div class="card qstem sm"><p>{TX(story)}</p></div>' if story else ''
    body = (f'{st}<div class="act sorter" id="{aid}-w"><div class="tasktxt"><b>המשימה:</b> {TX(task)}</div><div class="sgrid"><table class="stbl">{r}</table><div class="sart"><span class="emo">{SART.get(aid, "🗂️")}</span>'
            f'<div class="fbbar">בחרו תשובה בכל שורה.</div><div class="actbar">{RST}<span class="score">0 / {len(rows)}</span></div></div></div></div>')
    S(aid, title, h, body, kick=KICK('פעילות'))


def ORDER(aid, title, h, task, items, story=None, hint='חשבו: מה חייב להיות ידוע לפני שאפשר לבצע את השלב הזה?'):
    """Put the steps in order. items: (text, why) in the RIGHT order; shown shuffled by a fixed rotation."""
    if MODE == 'pdf':
        S(aid, title, h, (f'<p>{TX(story)}</p>' if story else '') + f'<p>{TX(task)}</p><ol class="steps">' + ''.join(f'<li><b>{TX(t)}.</b> {TX(w)}</li>' for t, w in items) + '</ol>')
        return
    MAN.append(dict(kind='order', id=aid + '-w', n=len(items)))
    NACT[0] += 1
    k = (sum(map(ord, aid)) % (len(items) - 1)) + 1
    idx = list(range(len(items)))
    sh = idx[k:] + idx[:k]
    sh = sh[::2] + sh[1::2]
    chips = ''.join(f'<button class="oc" data-i="{i}" data-w="{_html.escape(TX(items[i][1]), quote=True)}">{TX(items[i][0])}</button>' for i in sh)
    st = f'<div class="card qstem sm"><p>{TX(story)}</p></div>' if story else ''
    body = (f'{st}<div class="act order" id="{aid}-w" data-hint="{_html.escape(TX(hint), quote=True)}"><div class="tasktxt"><b>המשימה:</b> {TX(task)}</div>'
            f'<div class="ogrid"><div class="opool">{chips}</div><ol class="otrack"></ol></div>'
            f'<div class="fbbar">לחצו על השלב שבא ראשון.</div><div class="actbar">{RST}<span class="score">0 / {len(items)}</span></div></div>')
    S(aid, title, h, body, kick=KICK('פעילות'))


def PICK(aid, title, h, task, items, story=None, cols=1):
    """Find every right item. items: (text, is_right, why)."""
    if MODE == 'pdf':
        t = ''.join(f'<tr><td>{TX(a)}</td><td><b>{"כן" if b else "לא"}</b></td><td>{TX(c)}</td></tr>' for a, b, c in items)
        S(aid, title, h, (f'<p>{TX(story)}</p>' if story else '') + f'<p>{TX(task)}</p><table class="tbl2"><tr><th>הפריט</th><th>לסמן?</th><th>נימוק</th></tr>{t}</table>')
        return
    nr = sum(1 for _, b, _ in items if b)
    MAN.append(dict(kind='pick', id=aid + '-w', n=len(items), right=nr))
    NACT[0] += 1
    bs = ''.join(f'<button class="pk" data-ok="{1 if b else 0}" data-w="{_html.escape(TX(c), quote=True)}">{TX(a)}</button>' for a, b, c in items)
    st = f'<div class="card qstem sm"><p>{TX(story)}</p></div>' if story else ''
    body = (f'{st}<div class="act pick" id="{aid}-w"><div class="tasktxt"><b>המשימה:</b> {TX(task)}</div><div class="pgrid c{cols}">{bs}</div>'
            f'<div class="fbbar">לחצו על כל פריט שלדעתכם מתאים.</div><div class="actbar">{RST}<span class="score">0 / {nr}</span></div></div>')
    S(aid, title, h, body, kick=KICK('פעילות'))


def COMPOSE(aid, title, h, task, slots, story=None, out_label='התוצאה שלכם'):
    """Build a text from parts. slots: (label, [(text, score 0..2, feedback)]). The best option has score 2."""
    if MODE == 'pdf':
        t = ''.join(f'<tr><td><b>{TX(lab)}</b></td><td>{TX(max(opts, key=lambda o: o[1])[0])}</td><td>{TX(max(opts, key=lambda o: o[1])[2])}</td></tr>' for lab, opts in slots)
        S(aid, title, h, (f'<p>{TX(story)}</p>' if story else '') + f'<p>{TX(task)}</p><table class="tbl2"><tr><th>החלק</th><th>הניסוח המומלץ</th><th>מדוע</th></tr>{t}</table>')
        return
    MAN.append(dict(kind='compose', id=aid + '-w', n=len(slots)))
    NACT[0] += 1
    rows = ''
    for si, (lab, opts) in enumerate(slots):
        k = sum(map(ord, aid + str(si))) % len(opts)
        opts = opts[k:] + opts[:k]
        bs = ''.join(f'<button class="co" data-s="{s}" data-w="{_html.escape(TX(w), quote=True)}">{TX(t)}</button>' for t, s, w in opts)
        rows += f'<div class="crow"><b class="cl">{TX(lab)}</b><div class="copts">{bs}</div></div>'
    st = f'<div class="card qstem sm"><p>{TX(story)}</p></div>' if story else ''
    body = (f'{st}<div class="act compose" id="{aid}-w"><div class="tasktxt"><b>המשימה:</b> {TX(task)}</div><div class="cgrid2"><div class="cslots">{rows}</div>'
            f'<div class="cout2"><b>{TX(out_label)}</b><div class="ctext">בחרו ניסוח בכל שורה, והטקסט ייבנה כאן.</div><div class="meter"><i></i></div><div class="mlab">איכות: טרם נבחר</div></div></div>'
            f'<div class="fbbar">בחרו ניסוח אחד בכל שורה. אפשר להחליף בחירה.</div><div class="actbar">{RST}<span class="score">0 / {len(slots)}</span></div></div>')
    S(aid, title, h, body, kick=KICK('מגרש משחקים'))


def HANDS_OLD(sid, title, h, story, steps, mins, sample, out=None, where='בצ׳אט של המפגש'):
    """A hands-on task: full story, numbered steps, a countdown, and a sample answer behind a button."""
    if MODE == 'pdf':
        S(sid, title, h, f'<p>{TX(story)}</p><ol class="steps">' + ''.join(f'<li>{TX(x)}</li>' for x in steps) + f'</ol><div class="band ans"><b>תשובה לדוגמה:</b> {sample if sample.startswith("<") else TX(sample)}</div>')
        return
    NACT[0] += 1
    MAN.append(dict(kind='hands', id=sid + '-w'))
    ol = '<ol class="steps hsteps">' + ''.join(f'<li>{TX(x)}</li>' for x in steps) + '</ol>'
    outp = f'<div class="band dg"><b>התוצר:</b> {TX(out)}</div>' if out else ''
    smp = sample if sample.startswith('<') else f'<p>{TX(sample)}</p>'
    body = (f'<div class="hands" id="{sid}-w"><div class="row top g55"><div class="col"><div class="card qstem"><p>{TX(story)}</p></div>{outp}</div>'
            f'<div class="col"><div class="card"><b class="ct">מה עושים, שלב אחר שלב</b>{ol}</div>'
            f'<div class="hbar"><button class="abtn tmr" data-m="{mins}">⏱ התחילו {mins} דקות</button><span class="tclock" dir="ltr">{mins:02d}:00</span>'
            f'<span class="hwhere">שולחים את התוצר {TX(where)}</span></div>'
            f'<div class="hbar"><button class="abtn ghost morebtn">תשובה לדוגמה</button><div class="more-c" hidden><div class="more-h">תשובה לדוגמה</div>{smp}<p class="lg"><b>שימו לב:</b> זו דוגמה אחת. תשובה אחרת, מנומקת, מתקבלת באותה מידה.</p></div></div>'
            f'</div></div></div>')
    S(sid, title, h, body, kick=KICK(f'עבודה עצמית · {mins} דקות'), cls='handsl')


def CHECKER(sid, title, h, story, kind, placeholder, example):
    """A playground: the student writes a text and gets rule-based feedback. kind: 'req' | 'prompt' | 'story'."""
    if MODE == 'pdf':
        S(sid, title, h, f'<p>{TX(story)}</p><div class="band ans"><b>ניסוח לדוגמה:</b> {TX(example)}</div>')
        return
    NACT[0] += 1
    MAN.append(dict(kind='checker', id=sid + '-w', ck=kind, good=example))
    body = (f'<div class="act checker" id="{sid}-w" data-kind="{kind}"><div class="row top g55"><div class="col"><div class="card qstem"><p>{TX(story)}</p></div>'
            f'<textarea class="ckin" rows="5" placeholder="{_html.escape(placeholder, quote=True)}"></textarea>'
            f'<div class="actbar"><button class="abtn chk">בדקו את הניסוח</button><button class="abtn ghost exb" data-ex="{_html.escape(example, quote=True)}">הציגו ניסוח לדוגמה</button>{RST}</div></div>'
            f'<div class="col"><div class="card ckres"><b class="ct">מה הבודק מחפש</b><ul class="cklist"></ul><div class="meter"><i></i></div><div class="mlab">כתבו ניסוח ולחצו על ״בדקו״</div></div>'
            f'<div class="band note"><b>שימו לב:</b> הבודק פועל לפי כללים פשוטים. הוא מזהה מבנה, ואינו מבין תוכן. השיקול המקצועי נשאר שלכם.</div></div></div></div>')
    S(sid, title, h, body, kick=KICK('מגרש משחקים'))


def SUMMARY(sid, title, items, c3=False):
    """What we learned in this part: plain cards."""
    cards = ''.join(f'<div class="lcard"><b>{TX(t)}</b><p>{TX(d)}</p></div>' for t, d in items)
    if MODE == 'pdf':
        S(sid, title, title, '<ul class="pl">' + ''.join(f'<li><b>{TX(t)}:</b> {TX(d)}</li>' for t, d in items) + '</ul>'); return
    S(sid, title, title, f'<div class="learn{" c3" if c3 else ""}">{cards}</div>', kick=KICK('סיכום ביניים'))


def HAVE(sid, items, done):
    """Interim stop: what is already in hand. items: the deliverables of the lesson, done: how many are finished."""
    if MODE == 'pdf':
        S(sid, 'עצירת ביניים: מה כבר ביד', 'עצירת ביניים: מה כבר ביד', '<ul class="pl">' + ''.join(f'<li>{"✔" if i < done else "☐"} {TX(t)}</li>' for i, (ic, t) in enumerate(items)) + '</ul>'); return
    cs = ''.join(f'<div class="hv {"ok" if i < done else ("now" if i == done else "")}"><span class="hi">{ic}</span><b>{TX(t)}</b><em>{"הושלם" if i < done else ("החלק הבא" if i == done else "בהמשך")}</em></div>' for i, (ic, t) in enumerate(items))
    S(sid, 'עצירת ביניים: מה כבר ביד', 'עצירת ביניים: מה כבר ביד', f'<div class="have">{cs}</div>' + BAND('dg', globals().get('HAVE_END', 'כל תוצר נשען על זה שלפניו. בסוף המפגש הם מתחברים למסמך אחד: דף המערכת של הביסטרו.')), kick=KICK('איפה אנחנו במשפך'))



def QUERY(sid, title, h, question, lines, table, result, kick='קוראים שאילתה, קליק אחר קליק', note=None,
          stem='השאלה העסקית', head='כך נראית השאילתה שעוזר ה-AI כתב. קוראים אותה חלק אחר חלק:', ans='התשובה במילים, למנהל'):
    """A query explained click by click. lines: (code, what it does). table: (name, head, rows, effects) where
    effects = {step: {'cols': [i..] highlighted, 'rows': [i..] kept, 'order': [row order]}}. result: the sentence to the manager."""
    full = table is None
    name, thead, rows, eff = table or ('', [], [], {})
    if MODE == 'pdf':
        t = ''.join(f'<tr><td><bdi class="en" dir="ltr">{_html.escape(c)}</bdi></td><td>{TX(w)}</td></tr>' for c, w in lines)
        S(sid, title, h, f'<p><b>{stem}:</b> {TX(question)}</p><table class="tbl2"><tr><th>החלק בשאילתה</th><th>מה הוא עושה</th></tr>{t}</table><div class="band ans"><b>{ans}:</b> {TX(result)}</div>' + (BAND('dg', note) if note else ''))
        return
    NACT[0] += 1
    MAN.append(dict(kind='query', id=sid))
    ql = ''.join(f'<div class="st qstep" data-n="{(i + 2) * 10}"><code dir="ltr">{_html.escape(c)}</code><span class="qar">→</span><span class="qex">{TX(w)}</span></div>' for i, (c, w) in enumerate(lines))
    th = ''.join(f'<th data-c="{i}">{TX(x)}</th>' for i, x in enumerate(thead))
    tr = ''.join(f'<tr data-r="{ri}">' + ''.join(f'<td data-c="{ci}">{TX(str(v))}</td>' for ci, v in enumerate(r)) + '</tr>' for ri, r in enumerate(rows))
    n = len(lines)
    body = (f'<div class="qviz" data-eff="{_html.escape(json.dumps(eff), quote=True)}"><div class="card qstem sm"><p><b>{stem}:</b> {TX(question)}</p></div>'
            f'<div class="qgrid{" qfull" if full else ""}"><div class="qcode"><div class="st qhd" data-n="10">{TX(head)}</div>{ql}</div>'
            + ('' if full else f'<div class="qtab"><div class="mock"><div class="mb"><span>הטבלה <bdi dir="ltr">{name}</bdi></span><small>הדמיה</small></div><div class="mi"><table><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div></div></div>') + '</div>'
            + ST(n + 2, f'<b>{ans}:</b> {TX(result)}', cls='band ans') + (BAND('dg', note, n + 3) if note else '') + '</div>')
    S(sid, title, h, body, kick=KICK(kick), cls='qsl')



def HANDS(*a, **k):
    """Removed from the class route (frontal lesson). Kept as a no-op so that old content files still build."""
    return


def SCENE(stations, token='📝', kind='slow', cap=None, n=0, mark=None):
    """A looping animation of something travelling along the stations of a process. stations: (emoji, label, sub).
    kind: 'slow' (paper: stops, wobbles, falls on the way) or 'fast' (tablet: arrives at once). mark: {index: css class}."""
    if MODE == 'pdf':
        return '<p>' + ' ← '.join(f'<b>{TX(t)}</b>' + (f' ({TX(d)})' if d else '') for e, t, d in stations) + '</p>' + (f'<p>{TX(cap)}</p>' if cap else '')
    mark = mark or {}
    st = ''.join(f'<div class="sc-st {mark.get(i, "")}"><span class="sc-e">{e}</span><b>{TX(t)}</b>' + (f'<small>{TX(d)}</small>' if d else '') + '</div>' for i, (e, t, d) in enumerate(stations))
    inner = f'<div class="scene {kind}" style="--ns:{len(stations)}"><div class="sc-road"></div><div class="sc-track">{st}</div><div class="sc-tok">{token}</div>' + (f'<div class="sc-cap">{TX(cap)}</div>' if cap else '') + '</div>'
    return ST(n, inner) if n else inner


def ASK(sid, h, q, points, art='🙋', mins=1, link=None):
    """A short, defined class question: the lecturer asks, the class answers aloud, the points are revealed by clicks."""
    if MODE == 'pdf':
        S(sid, h, h, f'<p><b>שאלה לכיתה:</b> {TX(q)}</p><ul class="pl">' + ''.join(f'<li>{TX(x)}</li>' for x in points) + '</ul>'); return
    pts = ''.join(ST(i + 1, TX(x), cls='askp') for i, x in enumerate(points))
    lk = f'<div class="band note">{TX(link)}</div>' if link else ''
    S(sid, h, h, f'<div class="ask"><div class="askq"><span class="emo">{art}</span><p>{TX(q)}</p></div><div class="askps"><b class="ct">מה כדאי שיעלה בכיתה</b>{pts}</div></div>{lk}', kick=KICK(f'שאלה לכיתה · כ-{mins} דק׳'))


def PIC(emoji, title, text, n=0, cls=''):
    """A picture card: a large emoji, a title and one line."""
    inner = f'<span class="pic-e">{emoji}</span><b>{TX(title)}</b><p>{TX(text)}</p>'
    return ST(n, inner, cls='card pic ' + cls) if n else f'<div class="card pic {cls}">{inner}</div>'


# ---------------------------------------------------------------- lesson 2 components

def _qtable(name, head, rows, eff, opts=None, own=False):
    """A mock table for the table walks. opts: xl (spreadsheet look: column letters and row numbers), sub (the small label).
    own: the table carries its own effects (several tables in one walk)."""
    o = opts or {}
    th = ''.join(f'<th data-c="{i}">{TX(x)}</th>' for i, x in enumerate(head))
    if o.get('xl'):
        th = '<tr class="xlh"><th class="xlr"></th>' + ''.join(f'<th class="xlc">{chr(65 + i)}</th>' for i in range(len(head))) + f'</tr><tr><th class="xlr">1</th>{th}</tr>'
        tr = ''.join(f'<tr data-r="{ri}"><td class="xlr">{ri + 2}</td>' + ''.join(f'<td data-c="{ci}">{TX(str(v))}</td>' for ci, v in enumerate(r)) + '</tr>' for ri, r in enumerate(rows))
    else:
        th = f'<tr>{th}</tr>'
        tr = ''.join(f'<tr data-r="{ri}">' + ''.join(f'<td data-c="{ci}">{TX(str(v))}</td>' for ci, v in enumerate(r)) + '</tr>' for ri, r in enumerate(rows))
    ea = f' data-eff="{_html.escape(json.dumps(_effx(eff), ensure_ascii=False), quote=True)}"' if own else ''
    cls = ' xl' if o.get('xl') else ''
    return (f'<div class="qtab"{ea}><div class="mock{cls}"><div class="mb"><span>{TX(name)}</span><small>{TX(o.get("sub", "הדמיה"))}</small></div>'
            f'<div class="mi"><table><thead>{th}</thead><tbody>{tr}</tbody></table></div></div></div>')


def _effx(eff):
    """Effects as the browser reads them: html values of 'set' pass through TX."""
    return {str(k): ({kk: ([[a, b, TX(str(c))] for a, b, c in vv] if kk == 'set' else vv) for kk, vv in e.items()} if isinstance(e, dict) else e) for k, e in eff.items()}


def TABFX(sid, title, h, question, steps, table, result, note=None, kick='רואים את זה קורה, קליק אחר קליק', wide=False, top='', tables=None, layout=''):
    """A table that reacts, step by step, to a short story (no code). steps: text per click.
    table: (name, head, rows, effects[, opts]). effects per step: cols, rows, order, warn (rows), set [[r, c, html]], cw / cg [[r, c]] cells,
    show [rows], showc [cols], pc [[c, 'p1'..'p4']] painted columns; and top level 'hide' (rows) and 'hidec' (cols) hidden until shown.
    tables: several tables, each with its own effects. top: html above the walk. layout: '' | 'stack' (tables in a row above the steps)."""
    tl = tables or [table]
    if MODE == 'pdf':
        S(sid, title, h, f'<p>{TX(question)}</p><ol class="steps">' + ''.join(f'<li>{TX(x)}</li>' for x in steps) + f'</ol><div class="band ans"><b>השורה התחתונה:</b> {TX(result)}</div>' + (BAND('dg', note) if note else ''))
        return
    NACT[0] += 1
    MAN.append(dict(kind='query', id=sid))
    multi = len(tl) > 1
    eff = {} if multi else _effx(tl[0][3])
    ql = ''.join(f'<div class="st qstep qprose" data-n="{(i + 2) * 10}"><span class="qno">{i + 1}</span><span class="qex">{TX(w)}</span></div>' for i, w in enumerate(steps))
    n = len(steps)
    tabs = ''.join(_qtable(t[0], t[1], t[2], t[3], t[4] if len(t) > 4 else None, own=multi) for t in tl)
    if multi: tabs = f'<div class="qtabs n{len(tl)}">{tabs}</div>'
    body = (f'<div class="qviz{" wide" if wide else ""}{" multi" if multi else ""}" data-eff="{_html.escape(json.dumps(eff, ensure_ascii=False), quote=True)}"><div class="card qstem sm"><p>{TX(question)}</p></div>{top}'
            f'<div class="qgrid {layout}"><div class="qcode prose"><div class="st qhd" data-n="10">מה קורה, צעד אחר צעד:</div>{ql}</div>'
            f'<div class="qleft">{tabs}' + ST(n + 2, f'<b>השורה התחתונה:</b> {TX(result)}', cls='band ans') + (BAND('dg', note, n + 3) if note else '') + '</div></div></div>')
    S(sid, title, h, body, kick=KICK(kick), cls='qsl')


def _edge(cx, cy, hw, hh, dx, dy):
    t = min(hw / abs(dx) if dx else 1e9, hh / abs(dy) if dy else 1e9)
    return cx + dx * t, cy + dy * t


def ERD(boxes, links, w=1160, h=440, cls=''):
    """An entity relationship diagram, revealed click by click.
    boxes: (key, x, y, width, title, sub, [(column, 'pk' | 'fk' | 'pkfk' | '')], step). links: (one_key, many_key, kind, label, step),
    kind '1N' (crow's foot at the many end), '11', 'NM'."""
    if MODE == 'pdf':
        bl = ''.join(f'<li><b>{TX(t)}</b> ({TX(sb)}): ' + ', '.join(f'<bdi dir="ltr">{c}</bdi>' + {'pk': ' (מזהה ראשי)', 'fk': ' (מפתח זר)', 'pkfk': ' (מזהה ומפתח זר)'}.get(m, '') for c, m in cols) + '</li>' for k, x, y, bw, t, sb, cols, s in boxes)
        ll = ''.join(f'<li>{TX(l[3])}</li>' for l in links)
        return f'<div class="card"><b class="ct">הטבלאות</b><ul class="pl">{bl}</ul><b class="ct">הקשרים</b><ul class="pl">{ll}</ul></div>'
    geo = {}
    out = ''
    for k, x, y, bw, t, sb, cols, s in boxes:
        bh = 52 + 31 * len(cols)
        geo[k] = (x + bw / 2, y + bh / 2, bw / 2, bh / 2)
        cs = ''.join(f'<div class="ec {m}"><span class="em">{ {"pk": "🔑", "fk": "🔗", "pkfk": "🔑🔗"}.get(m, "") }</span>{c}</div>' for c, m in cols)
        inner = f'<div class="eh"><bdi dir="ltr">{t}</bdi><small>{TX(sb)}</small></div>{cs}'
        out += f'<div class="ebw" style="left:{x}px;top:{y}px;width:{bw}px">' + (ST(s, inner, cls='ebox') if s else f'<div class="ebox">{inner}</div>') + '</div>'
    svg = ''
    for a, b, kd, lab, s, *off in links:
        ax, ay, ahw, ahh = geo[a]
        bx, by, bhw, bhh = geo[b]
        dx, dy = bx - ax, by - ay
        L = (dx * dx + dy * dy) ** .5
        ux, uy = dx / L, dy / L
        p1 = _edge(ax, ay, ahw, ahh, ux, uy)
        p2 = _edge(bx, by, bhw, bhh, -ux, -uy)
        px, py = -uy, ux

        def one(p, u):
            r = ''
            for d in (14, 22):
                cx, cy = p[0] + u[0] * d, p[1] + u[1] * d
                r += f'<line x1="{cx + px * 11:.1f}" y1="{cy + py * 11:.1f}" x2="{cx - px * 11:.1f}" y2="{cy - py * 11:.1f}"/>'
            return r

        def many(p, u):
            cx, cy = p[0] + u[0] * 24, p[1] + u[1] * 24
            return ''.join(f'<line x1="{cx:.1f}" y1="{cy:.1f}" x2="{p[0] + px * o:.1f}" y2="{p[1] + py * o:.1f}"/>' for o in (-13, 0, 13))
        ua, ub = (ux, uy), (-ux, -uy)
        marks = (one(p1, ua) if kd in ('1N', '11') else many(p1, ua)) + (many(p2, ub) if kd in ('1N', 'NM') else one(p2, ub))
        g = f'<path pathLength="1" d="M{p1[0]:.1f},{p1[1]:.1f} L{p2[0]:.1f},{p2[1]:.1f}"/><g class="mk">{marks}</g>'
        svg += f'<g class="st an-draw elink" data-n="{s * 10}">{g}</g>' if s else f'<g class="elink">{g}</g>'
        mx, my = (p1[0] + p2[0]) / 2 + (off[0][0] if off else 0), (p1[1] + p2[1]) / 2 + (off[0][1] if off else 0)
        out += f'<div class="elw" style="left:{mx:.0f}px;top:{my:.0f}px">' + (ST(s, TX(lab), cls='elab') if s else f'<div class="elab">{TX(lab)}</div>') + '</div>'
    return f'<div class="erd {cls}" style="width:{w}px;height:{h}px"><svg viewBox="0 0 {w} {h}" width="{w}" height="{h}" dir="ltr" aria-hidden="true">{svg}</svg>{out}</div>'


def CODEWALK(lines, right, n0=1, head='קוראים את הטקסט שעוזר ה-AI הפיק, שורה אחר שורה:', cls=''):
    """Code lines with an arrow and an explanation, one per click, beside any revealed html (right). Line i appears at step n0 + 1 + i."""
    if MODE == 'pdf':
        t = ''.join(f'<tr><td><bdi class="en" dir="ltr">{_html.escape(c)}</bdi></td><td>{TX(w)}</td></tr>' for c, w in lines)
        return f'<table class="tbl2"><tr><th>השורה</th><th>מה היא אומרת</th></tr>{t}</table>' + right
    ql = ''.join(f'<div class="st qstep" data-n="{(n0 + 1 + i) * 10}"><code dir="ltr">{_html.escape(c)}</code><span class="qar">→</span><span class="qex">{TX(w)}</span></div>' for i, (c, w) in enumerate(lines))
    return f'<div class="qgrid cw {cls}"><div class="qcode"><div class="st qhd" data-n="{n0 * 10}">{TX(head)}</div>{ql}</div><div class="cwr">{right}</div></div>'


def MK(n, html, cls=''):
    """Always visible; highlighted from step n."""
    return f'<span class="st mk {cls}" data-n="{n * 10}">{html}</span>'


# ---------------------------------------------------------------- lesson 2, second round: maps, strips, bridges, the database tool

def MOCK(name, head, rows, sub='הדמיה', cls='', n0=0):
    """A small window with a table in it."""
    return f'<div class="mock {cls}"><div class="mb"><span>{TX(name)}</span><small>{TX(sub)}</small></div><div class="mi">' + TABLE(head, rows, n0=n0) + '</div></div>'


def MINI(head, rows, marks=None, cls=''):
    """A tiny table for a picture. marks: {(r, c): 'g' | 'r' | 'y' | 'p1'..'p4' | 'x'} paints a cell (r = -1 is the header)."""
    m = marks or {}
    th = ''.join(f'<th class="{m.get((-1, i), "")}">{TX(x)}</th>' for i, x in enumerate(head))
    tr = ''.join('<tr>' + ''.join(f'<td class="{m.get((ri, ci), "")}">{TX(str(v))}</td>' for ci, v in enumerate(r)) + '</tr>' for ri, r in enumerate(rows))
    return f'<table class="mini {cls}"><tr>{th}</tr>{tr}</table>'


def COMIC(panels, n0=1, cls=''):
    """A strip of illustrated panels, one per click, joined by arrows. panels: (art html, caption)."""
    if MODE == 'pdf':
        return '<ol class="steps">' + ''.join(f'<li>{TX(c)}</li>' for a, c in panels) + '</ol>'
    out = ''
    for i, (a, c) in enumerate(panels):
        ar = '<div class="cmar">←</div>' if i else ''
        out += ST(n0 + i, f'{ar}<div class="cmp"><div class="cmno">{i + 1}</div><div class="cma">{a}</div><div class="cmc">{TX(c)}</div></div>', cls='cmw pop')
    return f'<div class="comic n{len(panels)} {cls}">{out}</div>'


def MAP(nodes, edges, w=1168, h=460, cls='', extra=''):
    """A process map with nodes anywhere and curved arrows, revealed click by click; arrows marked 'flow' carry moving dots.
    nodes: (key, x, y, w, h, html, step, cls). edges: (from, to, step, label, bend, cls); bend bows the arrow sideways (px)."""
    if MODE == 'pdf':
        return '<ul class="pl">' + ''.join(f'<li>{re.sub("<[^>]+>", " ", hh)}</li>' for k, x, y, bw, bh, hh, s, c in nodes) + '</ul>'
    geo, out, svg = {}, '', ''
    for k, x, y, bw, bh, hh, s, c in nodes:
        geo[k] = (x + bw / 2, y + bh / 2, bw / 2, bh / 2)
        stl = f'left:{x}px;top:{y}px;width:{bw}px;height:{bh}px'
        out += f'<div class="mnode st pop {c}" data-n="{s * 10}" style="{stl}">{hh}</div>' if s else f'<div class="mnode {c}" style="{stl}">{hh}</div>'
    for a, b, s, lab, bend, c, *nud in edges:
        ax, ay, ahw, ahh = geo[a] if isinstance(a, str) else (a[0], a[1], 0, 0)
        bx, by, bhw, bhh = geo[b] if isinstance(b, str) else (b[0], b[1], 0, 0)
        dx, dy = bx - ax, by - ay
        L = (dx * dx + dy * dy) ** .5 or 1
        ux, uy = dx / L, dy / L
        p1 = _edge(ax, ay, ahw + 6, ahh + 6, ux, uy) if isinstance(a, str) else (ax, ay)
        p2 = _edge(bx, by, bhw + 10, bhh + 10, -ux, -uy) if isinstance(b, str) else (bx, by)
        mx, my = (p1[0] + p2[0]) / 2 - uy * bend, (p1[1] + p2[1]) / 2 + ux * bend
        d = f'M{p1[0]:.1f},{p1[1]:.1f} Q{mx:.1f},{my:.1f} {p2[0]:.1f},{p2[1]:.1f}'
        dot = (f'<circle r="7" class="mdot"><animateMotion dur="2.6s" repeatCount="indefinite" path="{d}"/></circle>'
               f'<circle r="7" class="mdot"><animateMotion dur="2.6s" begin="1.3s" repeatCount="indefinite" path="{d}"/></circle>') if 'flow' in c else ''
        g = f'<path pathLength="1" d="{d}"' + ('' if 'noarrow' in c else ' marker-end="url(#mah)"') + f'/>{dot}'
        svg += f'<g class="st an-draw medge {c}" data-n="{s * 10}">{g}</g>' if s else f'<g class="medge {c}">{g}</g>'
        if lab:
            lx, ly = (p1[0] + p2[0]) / 4 + mx / 2 + (nud[0][0] if nud else 0), (p1[1] + p2[1]) / 4 + my / 2 + (nud[0][1] if nud else 0)
            out += f'<div class="elw" style="left:{lx:.0f}px;top:{ly:.0f}px">' + (ST(s, TX(lab), cls='mlab') if s else f'<div class="mlab">{TX(lab)}</div>') + '</div>'
    defs = '<defs><marker id="mah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#e0452b"/></marker></defs>'
    return f'<div class="map {cls}" style="width:{w}px;height:{h}px"><svg viewBox="0 0 {w} {h}" width="{w}" height="{h}" dir="ltr" aria-hidden="true">{defs}{svg}</svg>{out}{extra}</div>'


def KQ(text, n=0, who='ד״ר קונדילה, המובילה הטכנולוגית'):
    """A question of the tech lead, in her own voice."""
    inner = f'<span class="kqa">👩‍🔬</span><div><b>{TX(who)}</b><p>״{TX(text)}״</p></div>'
    return ST(n, inner, cls='kq') if n else f'<div class="kq">{inner}</div>'


def BRIDGE(sid, h, have, need, ask, link):
    """The first slide of a part: what we already have (mock ups), what is still missing, the question that opens the part."""
    if MODE == 'pdf':
        S(sid, h, h, f'<p><b>הקשר לחלק הקודם:</b> {TX(link)}</p><ul class="pl">' + ''.join(f'<li>{TX(x)}</li>' for x in need) + f'</ul><p><b>השאלה:</b> {TX(ask)}</p>'); return
    body = (f'<div class="bridge2"><div class="brl">{TX(link)}</div><div class="brt">{have}</div>'
            f'<div class="brn"><b class="ct">ומה עוד אי אפשר לעשות</b>{UL(need, 1, "blt bneed")}</div><div class="brk">{KQ(ask, len(need) + 1)}</div></div>')
    S(sid, h, h, body, kick=KICK('מחברים לחלק הקודם'))


SQLKW = set('CREATE TABLE INTEGER PRIMARY KEY VARCHAR TEXT NOT NULL UNIQUE DECIMAL CHECK BOOLEAN DEFAULT TRUE FALSE INSERT INTO VALUES UPDATE SET WHERE DELETE FROM SELECT ORDER BY DESC ASC FOREIGN REFERENCES JOIN ON ALTER ADD COLUMN TIMESTAMP DATE AND OR AS SUM COUNT GROUP DROP IN PRAGMA'.split())


def _sqlhl(line):
    """Colours one line of SQL: keywords, strings, numbers, comments. Hebrew inside a string is isolated."""
    out, pos = '', 0
    for m in re.finditer(r"(--.*$)|('(?:[^']|'')*')|\b([A-Za-z_]+)\b|\b(\d+(?:\.\d+)?)\b", line):
        out += _html.escape(line[pos:m.start()])
        t = m.group(0)
        if m.group(1): out += f'<span class="sc">{_html.escape(t)}</span>'
        elif m.group(2):
            inner = _html.escape(t[1:-1])
            if re.search('[֐-׿]', inner): inner = f'<bdi dir="rtl">{inner}</bdi>'
            out += f"<span class=\"ss\">'{inner}'</span>"
        elif m.group(3): out += f'<span class="sk">{t}</span>' if t.upper() in SQLKW and t.isupper() else _html.escape(t)
        else: out += f'<span class="sd">{t}</span>'
        pos = m.end()
    return out + _html.escape(line[pos:])


def _sqlcheck(sid, setup, blocks):
    """Runs the statements of a slide in SQLite, in order, and checks that each one does what the slide says."""
    import sqlite3
    con = sqlite3.connect(':memory:')
    con.execute('PRAGMA foreign_keys = ON')
    if setup: con.executescript(setup)
    for b in blocks:
        sql = '\n'.join(t for _, t in b['lines'])
        exp = b.get('expect', 'ok')
        if b.get('script'):
            con.executescript(b['script'])
            continue
        try:
            cur = con.execute(sql)
            rows = cur.fetchall() if sql.lstrip().upper().startswith('SELECT') else None
            got = f'n:{cur.rowcount}' if exp.startswith('n:') else 'ok'
            if b.get('rows') is not None:
                assert [list(map(str, r)) for r in rows] == [list(map(str, r)) for r in b['rows']], (sid, sql, rows)
        except sqlite3.Error as e:
            got = 'err:' + str(e)
        assert got == exp, f'{sid}: SQL check failed\n{sql}\nexpected {exp}\ngot {got}'
    return con


def DBTOOL(sid, title, h, question, steps, blocks, result, setup='', side=(), tables=(), note=None, kick='רואים את זה במסד, קליק אחר קליק', db='bistro.db', grid='minmax(0,1fr) minmax(0,1.3fr)'):
    """A database tool, click by click. steps: one explanation per click. blocks: statements, each
    dict(lines=[(step, text)], run=step, expect='ok' | 'n:N' | 'err:<message>', he=what the message says, rows=[...] for a SELECT).
    Every statement really runs in SQLite at build time, after setup, and must give what the slide shows.
    side: [(table, step)] in the side bar (step 0: there from the start). tables: grids, (name, head, rows, effects[, opts])."""
    _sqlcheck(sid, setup, blocks)
    if MODE == 'pdf':
        code = '<br>'.join(_html.escape(t) for b in blocks for _, t in b['lines'])
        S(sid, title, h, f'<p>{TX(question)}</p><div class="card"><bdi class="en" dir="ltr">{code}</bdi></div><ol class="steps">' + ''.join(f'<li>{TX(x)}</li>' for x in steps) + f'</ol><div class="band ans"><b>השורה התחתונה:</b> {TX(result)}</div>')
        return
    NACT[0] += 1
    MAN.append(dict(kind='query', id=sid))
    N = lambda s: (s + 1) * 10
    ql = ''.join(f'<div class="st qstep qprose" data-n="{N(i + 1)}"><span class="qno">{i + 1}</span><span class="qex">{TX(w)}</span></div>' for i, w in enumerate(steps))
    ln, k = '', 0
    for b in blocks:
        for s, t in b['lines']:
            k += 1
            ln += f'<div class="st dbl" data-n="{N(s)}"><i>{k}</i><code>{_sqlhl(t) or "&nbsp;"}</code></div>'
    lg = ''
    for b in blocks:
        e = b.get('expect', 'ok')
        if e.startswith('err:'):
            lg += f'<div class="st dbm err" data-n="{N(b["run"])}"><b dir="ltr">✘ Error: {_html.escape(e[4:])}</b><span>{TX(b.get("he", ""))}</span></div>'
        else:
            lg += f'<div class="st dbm ok" data-n="{N(b["run"])}"><b>✔</b><span>{TX(b.get("he", "בוצע"))}</span></div>'
    sd = ''.join((f'<div class="st dbti" data-n="{N(s)}">▦ {t}</div>' if s else f'<div class="dbti">▦ {t}</div>') for t, s in side)
    gr = ''.join(_qtable(t[0], t[1], t[2], t[3], t[4] if len(t) > 4 else None, own=True) for t in tables)
    win = (f'<div class="dbw"><div class="dbt"><span>🛢️ <bdi dir="ltr">{db}</bdi></span><small>הדמיה של כלי מסד נתונים</small></div><div class="dbb">'
           + (f'<div class="dbside"><b>טבלאות</b>{sd}</div>' if side else '') +
           f'<div class="dbmain"><div class="dbbar"><span class="dbtab">SQL</span><span class="dbrun">▶ הרצה</span></div><div class="dbed">{ln}</div>'
           f'<div class="dblog">{lg}</div>' + (f'<div class="dbgrid">{gr}</div>' if gr else '') + '</div></div></div>')
    n = len(steps)
    body = (f'<div class="qviz db multi" data-eff="{{}}"><div class="card qstem sm"><p>{TX(question)}</p></div>'
            f'<div class="qgrid dbg" style="grid-template-columns:{grid}"><div class="qcode prose"><div class="st qhd" data-n="10">מה קורה, צעד אחר צעד:</div>{ql}'
            + ST(n + 2, f'<b>השורה התחתונה:</b> {TX(result)}', cls='band ans') + (BAND('dg', note, n + 3) if note else '') + f'</div>{win}</div></div>')
    S(sid, title, h, body, kick=KICK(kick), cls='qsl dbsl')
