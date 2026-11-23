# One-off engine patch after Shay's review of 23.11.2026 (kept for the record). Safe to run twice.
import os, re
H = os.path.dirname(os.path.abspath(__file__))
rd = lambda f: open(os.path.join(H, f), encoding='utf8').read()
def wr(f, s): open(os.path.join(H, f), 'w', encoding='utf8').write(s)

# ---------------------------------------------------------------- content_a.py
s = rd('content_a.py')
if 'def SCENE' not in s:
    # free-work tasks leave the class route: frontal lesson, the lecturer runs short, defined activations
    s = s.replace("def HANDS(sid, title, h, story, steps, mins, sample, out=None, where='בצ׳אט של המפגש'):\n", "def HANDS_OLD(sid, title, h, story, steps, mins, sample, out=None, where='בצ׳אט של המפגש'):\n")
    s += r'''


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
'''
    # the query visualiser can mark a wrong row
    wr('content_a.py', s)

# ---------------------------------------------------------------- act.js
s = rd('act.js')
if 'rwarn' not in s:
    s = s.replace("let cols=null,keep=null,order=null;for(let i=1;i<=k;i++){const e=eff[i];if(!e)continue;if(e.cols)cols=e.cols;if(e.rows)keep=e.rows;if(e.order)order=e.order;}",
                  "let cols=null,keep=null,order=null,warn=null;for(let i=1;i<=k;i++){const e=eff[i];if(!e)continue;if(e.cols)cols=e.cols;if(e.rows)keep=e.rows;if(e.order)order=e.order;warn=e.warn||null;}")
    s = s.replace("rows.forEach(r=>r.classList.toggle('rout',!!keep&&!keep.includes(+r.dataset.r)));",
                  "rows.forEach(r=>{r.classList.toggle('rout',!!keep&&!keep.includes(+r.dataset.r));r.classList.toggle('rwarn',!!warn&&warn.includes(+r.dataset.r));});steps.forEach((st,i)=>st.classList.toggle('qbad',!!(eff[i+1]&&eff[i+1].warn)&&i===k-1));")
i = s.index('/* static slides use the whole height')
s = s[:i] + '''/* static slides use the whole height: the body is enlarged until it fills the slide */
function fitSlides(){const k=()=>stage.getBoundingClientRect().width/1280||1;
 slides.forEach(s=>{if(s.classList.contains('pd')||s.classList.contains('s1')||s.querySelector('.order,.checker,.memew'))return;
  const grows=!!s.querySelector('.act,.mc');const LIM=grows?612:664;
  const kids=[...s.children].filter(c=>!c.matches('.kick,h2,.ft,.toon,.crumb'));if(!kids.length)return;kids.forEach(c=>c.style.zoom='');
  const bottom=()=>{const sr=s.getBoundingClientRect();return Math.max(...kids.map(c=>c.getBoundingClientRect().bottom-sr.top))/k();};
  const top=(kids[0].getBoundingClientRect().top-s.getBoundingClientRect().top)/k();const room=LIM-top,h=bottom()-top;if(h<=0||h>room*0.95)return;
  let z=Math.min(1.7,room/h);for(let i=0;i<20&&z>1.03;i++){kids.forEach(c=>c.style.zoom=z);if(bottom()<=LIM)break;z-=0.035;}
  if(z<=1.03||bottom()>LIM)kids.forEach(c=>c.style.zoom='');});}
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(fitSlides);window.__fitSlides=fitSlides;
'''
wr('act.js', s)

# ---------------------------------------------------------------- deck.css
s = rd('deck.css')
if '/* v2 review */' not in s:
    s += '''
/* v2 review */
/* process diagrams always fill the width, in one row */
.flow{display:grid!important;grid-auto-flow:column;grid-auto-columns:1fr;gap:0;margin:16px 0}
.fs{display:flex;align-items:stretch;min-width:0}.fs .fb{width:auto!important;flex:1 1 0;min-width:0}
.fa{padding:0 4px!important}
/* sorter: the answers sit right next to the statement */
.stbl{width:auto;max-width:100%}.stbl td:first-child{padding-left:26px}
/* the thread of the meeting, on every slide */
.crumb{position:absolute;left:56px;top:9px;display:flex;gap:4px;direction:rtl;align-items:center}
.crumb span{font-size:13.5px;font-weight:700;color:#8a93aa;background:#ebe6da;border-radius:99px;padding:1px 10px;white-space:nowrap}
.crumb span.was{background:#dcf5e6;color:#107c41}.crumb span.now{background:#ff6a4d;color:#fff}
/* looping scenes */
.scene{position:relative;background:#fff;border-radius:18px;box-shadow:0 2px 0 var(--line);padding:16px 14px 12px;margin:10px 0;overflow:hidden}
.sc-track{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;position:relative;z-index:1}
.sc-st{display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px}
.sc-e{font-size:54px;line-height:1.1}.sc-st b{font-size:20px;color:#1b2d55}.sc-st small{font-size:16.5px;color:#3b4a6b}
.sc-st.hot b{color:#c4421f}.sc-st.hot .sc-e{filter:drop-shadow(0 0 8px #ff6a4d)}
.sc-st.tag b{background:#1b2d55;color:#fff;border-radius:99px;padding:0 12px}
.sc-road{position:absolute;right:8%;left:8%;top:50px;border-top:4px dashed #cdd5ea}
.sc-tok{position:absolute;top:4px;font-size:40px;z-index:2;right:6%;animation:trip 9s ease-in-out infinite}
.scene.fast .sc-tok{animation:tripf 2.6s cubic-bezier(.7,0,.3,1) infinite}
.sc-cap{margin-top:8px;text-align:center;font-size:19px;font-weight:700;color:#1b2d55}
@keyframes trip{0%{right:6%;transform:none;opacity:0}6%{opacity:1}22%{right:26%;transform:rotate(-8deg)}34%{right:26%;transform:rotate(6deg)}50%{right:47%;transform:rotate(-6deg)}58%{right:50%;transform:translateY(64px) rotate(80deg)}70%{right:50%;transform:translateY(64px) rotate(80deg)}78%{right:52%;transform:rotate(0)}94%{right:88%;transform:rotate(4deg);opacity:1}100%{right:88%;opacity:0}}
@keyframes tripf{0%{right:6%;opacity:0}12%{right:6%;opacity:1}55%{right:88%;opacity:1}90%{right:88%;opacity:1}100%{right:88%;opacity:0}}
/* class question */
.ask{display:grid;grid-template-columns:1fr 1.2fr;gap:18px;align-items:start;margin-top:8px}
.askq{background:#fff;border-radius:18px;box-shadow:0 2px 0 var(--line);padding:16px 22px;border-top:8px solid #ff6a4d;text-align:center}
.askq p{font-size:27px;font-weight:800;line-height:1.35;color:#1b2d55}.askq .emo{font-size:70px}
.askps{display:flex;flex-direction:column;gap:8px}.askp{background:#fff;border-radius:12px;padding:9px 16px;font-size:21px;line-height:1.35;border-right:7px solid #25a65f;box-shadow:0 2px 0 var(--line)}
/* picture cards */
.pic{text-align:center;padding:14px 14px 16px}.pic-e{font-size:66px;line-height:1.1;display:block}.pic b{display:block;font-size:22px;color:#1b2d55;margin:2px 0 4px}.pic p{font-size:18.5px;line-height:1.35}
/* a wrong row and a wrong clause in the query visualiser */
.qtab tr.rwarn td{background:#fde8e6!important;color:#b8391f;font-weight:800;opacity:1}
.qtab tr.rwarn{animation:shk .35s 2}
.qstep.qbad code{border-color:#e5484d!important;background:#fde8e6!important;color:#b8391f!important}.qstep.qbad .qex{background:#fde8e6!important}
.qstep.fix code{border-color:#25a65f;background:#dcf5e6;color:#0d5c30}
/* free text mock (notes without structure) */
.notes{display:flex;flex-direction:column;gap:6px}.notes div{background:#fffbe6;border:1px solid #ecd98a;border-radius:6px;padding:6px 12px;font-size:19px;transform:rotate(-.6deg);box-shadow:1px 2px 0 #e4dccd}.notes div:nth-child(even){transform:rotate(.7deg)}
'''
    wr('deck.css', s)

# ---------------------------------------------------------------- build_deck.py: thread strip, no hands chip
s = rd('build_deck.py')
if 'crumb' not in s:
    s = s.replace("    kick = f'<div class=\"kick\"><span>{TX(s[\"kick\"])}</span></div>' if s.get('kick') else ''\n",
                  "    kick = f'<div class=\"kick\"><span>{TX(s[\"kick\"])}</span></div>' if s.get('kick') else ''\n"
                  "    if s.get('part') and globals().get('THREAD_L'):\n"
                  "        kick = '<div class=\"crumb\">' + ''.join(f'<span class=\"{\"now\" if j + 1 == s[\"part\"] else (\"was\" if j + 1 < s[\"part\"] else \"\")}\">{x}</span>' for j, x in enumerate(THREAD_L)) + '</div>' + kick\n")
    s = s.replace("chips = [f'{NACT[0]} פעילויות בתוך השקפים', f'{NHANDS} משימות עבודה עצמית', 'כל רעיון נבנה קליק אחר קליק']",
                  "chips = [f'{NACT[0]} פעילויות בתוך השקפים', 'מקרה אחד, מאפס', 'כל רעיון נבנה קליק אחר קליק']")
    wr('build_deck.py', s)

# ---------------------------------------------------------------- test: ignore the strip in the small-type check
s = rd('test_deck.py')
s = s.replace("if(p.closest('.ft,sup,sub,svg,[hidden],.rn,.fn'))continue;", "if(p.closest('.ft,sup,sub,svg,[hidden],.rn,.fn,.crumb'))continue;")
s = s.replace("if(e.closest('.ft')||e.closest('.pd-num')", "if(e.closest('.ft')||e.closest('.crumb')||e.closest('.sc-tok')||e.closest('.pd-num')")
wr('test_deck.py', s)
print('patched')
