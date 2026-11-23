# One-off: appended the QUERY helper, its script and its styles to the kit files (kept for the record).
PY = r'''


def QUERY(sid, title, h, question, lines, table, result, kick='קוראים שאילתה, קליק אחר קליק', note=None):
    """A query explained click by click. lines: (code, what it does). table: (name, head, rows, effects) where
    effects = {step: {'cols': [i..] highlighted, 'rows': [i..] kept, 'order': [row order]}}. result: the sentence to the manager."""
    name, head, rows, eff = table
    if MODE == 'pdf':
        t = ''.join(f'<tr><td><bdi class="en" dir="ltr">{_html.escape(c)}</bdi></td><td>{TX(w)}</td></tr>' for c, w in lines)
        S(sid, title, h, f'<p><b>השאלה העסקית:</b> {TX(question)}</p><table class="tbl2"><tr><th>החלק בשאילתה</th><th>מה הוא עושה</th></tr>{t}</table><div class="band ans"><b>התשובה במילים:</b> {TX(result)}</div>' + (BAND('dg', note) if note else ''))
        return
    ql = ''.join(f'<div class="st qstep" data-n="{(i + 2) * 10}"><code dir="ltr">{_html.escape(c)}</code><span class="qar">→</span><span class="qex">{TX(w)}</span></div>' for i, (c, w) in enumerate(lines))
    th = ''.join(f'<th data-c="{i}">{TX(x)}</th>' for i, x in enumerate(head))
    tr = ''.join(f'<tr data-r="{ri}">' + ''.join(f'<td data-c="{ci}">{TX(str(v))}</td>' for ci, v in enumerate(r)) + '</tr>' for ri, r in enumerate(rows))
    n = len(lines)
    body = (f'<div class="qviz" data-eff="{_html.escape(json.dumps(eff), quote=True)}"><div class="card qstem sm"><p><b>השאלה העסקית:</b> {TX(question)}</p></div>'
            f'<div class="qgrid"><div class="qcode"><div class="st qhd" data-n="10">כך נראית השאילתה שעוזר ה-AI כתב. קוראים אותה חלק אחר חלק:</div>{ql}</div>'
            f'<div class="qtab"><div class="mock"><div class="mb"><span>הטבלה <bdi dir="ltr">{name}</bdi></span><small>הדמיה</small></div><div class="mi"><table><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div></div></div></div>'
            + ST(n + 2, f'<b>התשובה במילים, למנהל:</b> {TX(result)}', cls='band ans') + (BAND('dg', note, n + 3) if note else '') + '</div>')
    S(sid, title, h, body, kick=KICK(kick), cls='qsl')
'''
JS = r'''

/* query visualiser: the table reacts to the clause that was just revealed */
$$('.qviz').forEach(v=>{const eff=JSON.parse(v.dataset.eff),steps=$$('.qstep',v),tb=$('tbody',v),rows=$$('tbody tr',v);
 const sync=()=>{const k=steps.filter(s=>s.classList.contains('show')).length;let cols=null,keep=null,order=null;for(let i=1;i<=k;i++){const e=eff[i];if(!e)continue;if(e.cols)cols=e.cols;if(e.rows)keep=e.rows;if(e.order)order=e.order;}
  $$('[data-c]',v).forEach(c=>{c.classList.toggle('chl',!!cols&&cols.includes(+c.dataset.c));c.classList.toggle('cdim',!!cols&&!cols.includes(+c.dataset.c));});
  rows.forEach(r=>r.classList.toggle('rout',!!keep&&!keep.includes(+r.dataset.r)));(order||rows.map((_,i)=>i)).forEach(i=>tb.appendChild(rows[i]));
  steps.forEach((s,i)=>s.classList.toggle('qcur',i===k-1));};
 let busy=false;new MutationObserver(()=>{if(busy)return;busy=true;sync();setTimeout(()=>{busy=false;},0);}).observe($('.qcode',v),{attributes:true,subtree:true,attributeFilter:['class']});sync();});
'''
CSS = r'''
.qgrid{display:grid;grid-template-columns:1.25fr 1fr;gap:14px;align-items:start;margin-top:8px}
.qcode{background:#16213a;border-radius:16px;padding:12px 14px;min-height:250px;display:flex;flex-direction:column;gap:7px}
.qhd{color:#c8d4f2;font-size:17.5px;font-weight:700}
.qstep{display:grid;grid-template-columns:1fr 34px 1fr;align-items:center;direction:ltr;gap:4px}
.qstep code{font-family:Menlo,Consolas,monospace;font-size:18px;color:#7fe3d6;background:#0f1b33;border-radius:8px;padding:6px 10px;white-space:pre-wrap;text-align:left;border:2px solid transparent}
.qstep .qar{color:#ff6a4d;font-size:28px;font-weight:800;text-align:center}
.qstep .qex{direction:rtl;text-align:right;color:#fff;font-size:17.5px;line-height:1.3;background:rgba(255,255,255,.1);border-radius:8px;padding:5px 10px}
.qstep.qcur code{border-color:#ffd37a;color:#ffd37a}.qstep.qcur .qex{background:#ffd37a;color:#16213a;font-weight:700}
.st.qstep.show .qar{animation:qarr .6s both}@keyframes qarr{from{transform:translateX(-22px);opacity:0}to{transform:none;opacity:1}}
.qtab td,.qtab th{transition:all .5s}.qtab .chl{background:#fff3d6!important;font-weight:800}.qtab .cdim{opacity:.25}
.qtab tr{transition:opacity .5s}.qtab tr.rout{opacity:.16;text-decoration:line-through}
.qsl .band{margin-top:8px}
'''
import os
H = os.path.dirname(os.path.abspath(__file__))
for f, t, mark in (('content_a.py', PY, 'def QUERY'), ('act.js', JS, 'query visualiser'), ('deck.css', CSS, '.qgrid{')):
    p = os.path.join(H, f); s = open(p, encoding='utf8').read()
    if mark not in s: open(p, 'w', encoding='utf8').write(s + t); print('appended', f)
