# Lesson summary PDF. Run: python3 build_summary.py 1  ->  ../lectures/lecture-N/summary.pdf (David font, printed by headless Chrome)
import os, re, sys
H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H)
R = lambda f: open(os.path.join(H, f), encoding='utf8').read()
MODE = 'pdf'
LESSON = int(sys.argv[1]) if len(sys.argv) > 1 else 1
exec(R('content_a.py')); exec(R('content_g.py')); exec(R(f'content_l{LESSON}.py'))
from pdfkit import *
SKIP = {'s-how'}
CSS = BASE + '''
.en{direction:ltr;unicode-bidi:isolate}.blt{padding-right:6mm;margin:0 0 1.4mm}.big3,.big4,.big2{display:grid;grid-template-columns:1fr 1fr;gap:2mm}.ic,.emo{display:none}.st{}
.ladder .rung span.rn{flex:none}.rung>span:last-child{flex:1}.onep .opr{display:flex;gap:3mm;border-bottom:.25mm solid var(--line);padding:.6mm 0}.opr b{min-width:34mm;color:var(--navy)}
.steps{padding-right:6mm}.more-c{display:block}

@page:first{margin:0;@bottom-center{content:none}}
.cover{height:297mm;width:210mm;padding:40mm 24mm 24mm;background:linear-gradient(160deg,#0f1b33 0%,#1b2d55 60%,#27447f 100%);color:#fff;position:relative;break-after:page}
.c-top{font-size:16pt;color:#7fe3d6;font-weight:700}.c-title{font-size:38pt;line-height:1.15;margin:14mm 0 4mm;font-weight:700}
.c-sub{font-size:17pt;color:#d6e0f7;line-height:1.35}.c-line{width:60mm;height:3mm;background:var(--coral);margin:10mm 0;border-radius:2mm}
.c-meta{font-size:13.5pt;color:#c8d4f2;line-height:1.5}.c-author{position:absolute;right:24mm;left:24mm;bottom:24mm;font-size:12.5pt;color:#ffd37a;line-height:1.5}
.c-mail{color:#c8d4f2;direction:ltr;text-align:right}
.toc ol{columns:2;line-height:1.45}
h1 .sn{display:inline-block;background:var(--navy);color:#fff;border-radius:50%;width:9mm;height:9mm;line-height:9mm;text-align:center;margin-left:3mm;font-size:12.5pt}
.pq{font-weight:700;color:#2a3858}.pl{padding-right:6mm}
.row{display:flex;gap:3mm}.row>*{flex:1 1 0;min-width:0}.col{display:block}
.card{border:.25mm solid var(--line);border-radius:1.6mm;padding:1.4mm 2.4mm;margin:0 0 1.6mm;break-inside:avoid;background:#fff}
.dn,.ct{display:block;font-weight:700;color:var(--navy)}.ct{color:#c4421f}
.den{direction:ltr;unicode-bidi:isolate;font-weight:400;font-size:10.4pt;color:var(--mut)}
.demo{background:#eef7f6;border-radius:1.2mm;padding:.8mm 2mm;margin-top:.8mm}.demo b{color:#087469}
.band{border-radius:1.2mm;padding:1.2mm 2.6mm;margin:1.2mm 0;background:#f1ece0;break-inside:avoid}
.band.dg{background:#fff7e0;border-right:1.2mm solid #f0b429}.band.note{background:#eef2ff;border-right:1.2mm solid var(--navy)}
.band.trap{background:#fde8e6;border-right:1.2mm solid #e0454f}.band.tip{background:#eaf6ff;border-right:1.2mm solid #2f8fd6}
.band.ans{background:var(--incbg);border-right:1.2mm solid var(--inc);font-weight:700}
.qstem{font-weight:700;margin-bottom:1mm}.qstem .eq{text-align:center;font-size:13.6pt}
ol.steps{margin:.6mm 0 1.4mm;padding-right:6mm}ol.steps li{margin-bottom:.7mm}
table.tbl2{width:100%;margin:1mm 0 2mm;font-size:11pt}.tbl2 th{background:var(--navy);color:#fff;text-align:right;padding:.9mm 2mm}.tbl2 th .m,.tbl2 th i{color:#fff}
.tbl2 td{padding:.8mm 2mm;border-bottom:.25mm solid var(--line);vertical-align:middle}
.gqp{width:auto;min-width:50%;direction:ltr}.gqp td,.gqp th{text-align:center}
.mc{border:.25mm solid var(--line);border-radius:1.6mm;padding:1.4mm 2.2mm;break-inside:avoid;margin-bottom:1.5mm}
.mc .q{font-weight:700}.mc button.o{display:block;width:100%;border:0;background:none;font:inherit;color:inherit;text-align:right;padding:0}
.mc button.o.correct{font-weight:700;color:#107c41}.mc .w{background:#eef2ff;border-radius:1.2mm;padding:.8mm 2mm;margin-top:.8mm}
.tryp{border-right:1mm solid var(--coral);padding:.4mm 2.4mm;margin:0 0 1.8mm;break-inside:avoid}.tryp p{margin:0 0 .5mm}.tsl{color:#2a3858}
.wk{display:block}.wkr{margin:0 0 1mm;break-inside:avoid}.wn b{display:inline-block;min-width:5mm;color:#c4421f}.wn{display:block}
.rule{background:#eef2ff;border:.3mm solid var(--navy);border-radius:1.6mm;padding:1.2mm 2.4mm;margin:1.2mm 0;break-inside:avoid;text-align:center}
.rule .eq{text-align:center;font-size:14pt}.rl{font-weight:700;color:#c4421f}
.vs,.flow4,.rules,.splitg{display:grid;grid-template-columns:1fr 1fr;gap:2mm}.flow4{grid-template-columns:repeat(4,1fr)}.rules{grid-template-columns:repeat(3,1fr)}
.fn{display:inline-block;background:var(--coral);color:#fff;border-radius:50%;width:6mm;height:6mm;line-height:6mm;text-align:center;font-weight:700;margin-left:1.5mm}
.flow4 b{display:inline}.flow4 p{font-size:10.8pt}
.ladder .rung{display:flex;gap:3mm;border-bottom:.25mm solid var(--line);padding:.6mm 0}.rn{display:inline-block;color:#fff;border-radius:50%;width:6mm;height:6mm;line-height:6mm;text-align:center;font-weight:700}
.rung b{min-width:38mm}
.diagw{text-align:center;break-inside:avoid;margin:1mm 0}svg.diag{width:96mm;max-width:100%;height:auto;direction:ltr;font-family:"David"}svg.diag .mi{font-family:"Times New Roman",Times,serif;font-style:italic}
.anat{direction:ltr;display:flex;justify-content:center;gap:2mm;font-size:22pt;font-weight:700;align-items:flex-end}.anat .pc{display:flex;flex-direction:column;align-items:center}
.anat .tag{font-size:9.6pt;direction:rtl;background:#eef2ff;border-radius:1mm;padding:0 1.5mm}
.mach{direction:ltr;text-align:center;font-size:14pt;font-weight:700}.mach span{margin:0 1.5mm}.mach .box{border:.3mm solid var(--navy);border-radius:1.5mm;padding:.5mm 3mm}
.fruit{direction:ltr;text-align:center}.fruit svg{width:6mm;height:6mm}
.twoway{display:flex;gap:4mm;justify-content:center;align-items:center;direction:rtl}.tw-a{display:flex;flex-direction:column;font-size:10pt;font-weight:700}
.gl{border-right:1mm solid var(--coral);padding:.6mm 2.2mm;margin:0 0 1.6mm;break-inside:avoid;font-size:10.8pt;line-height:1.25}
.gl .th{font-weight:700;color:var(--navy);font-size:11.6pt}.gl small{color:var(--mut);direction:ltr;unicode-bidi:isolate;margin-right:1.5mm;font-size:9.8pt}.gl p{margin:0 0 .3mm}
.glc{columns:2;column-gap:5mm}
.goal{color:#087469;font-size:10.8pt;margin:-.4mm 0 1mm}
'''
parts = {}
for s in SL:
    if s['id'] in SKIP: continue
    parts.setdefault(s['part'], []).append(s)
TOTAL = max(k for k in parts if k)
front = ''.join(f'<h3>{TX(s["h"])}</h3>{s["body"]}' for s in parts[None])
body = f'<section class="part"><h1>לפני שמתחילים</h1>{front}</section>'
for nn in range(1, TOTAL + 1):
    op = next(s for s in parts[nn] if s['kind'] == 'opener')
    inner = f'<p class="pq">{TX(op["q"])}</p><p>{TX(op.get("note") or "")}</p><ul class="pl">' + ''.join(f'<li>{TX(x)}</li>' for x in op['learn']) + '</ul>'
    for s in parts[nn]:
        if s['kind'] == 'opener': continue
        inner += f'<h3>{TX(s["h"])}</h3>' + s['body']
    body += f'<section class="part"><h1><span class="sn">{nn}</span>{op["h"]}</h1>{inner}</section>'
used = set(re.findall(r'data-t="(\w+)"', ''.join(s['body'] for s in SL)))
gl = ''.join(f'<div class="gl"><div class="th">{g["h"]}<small>{g["en"]}</small></div><p><b>בפשטות:</b> {TX(g["p"])}</p><p><b>בלשון מקצועית:</b> {TX(g["f"])}</p><p><b>דוגמה:</b> {TX(g["ex"])}</p><p><b>שימו לב:</b> {TX(g["tr"])}</p></div>' for k, g in G.items())
body += f'<section class="part"><h1>מילון מושגים</h1><div class="glc">{gl}</div></section>'
body += f'<section class="part"><h1>במפגש הבא: {LMETA["next_h"]}</h1><p>' + TX(LMETA['next_t']) + '</p></section>'
cover = (f'<div class="cover"><div class="c-top">{INST}</div><div class="c-title">{LMETA["h1"][0]} {LMETA["h1"][1]}</div>'
         f'<div class="c-sub">{COURSE}: סיכום מורחב של מפגש {LESSON}. {LMETA["cover"]}</div><div class="c-line"></div>'
         '<div class="c-meta">' + TX('כל ההגדרות, הדוגמאות, הפעילויות עם התשובות והנימוקים, שאלות לכיתה, התרגילים המסכמים, ומילון מושגים.') + '</div>'
         f'<div class="c-author">ד״ר שי צבאן<div class="c-mail">shay.tsaban@gmail.com</div></div></div>')
toc = '<div class="toc"><h1>תוכן העניינים</h1><ol>' + ''.join(f'<li>{next(s for s in parts[k] if s["kind"] == "opener")["h"]}</li>' for k in range(1, TOTAL + 1)) + '</ol></div>'
page = f'<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>{COURSE} | מפגש {LESSON} | סיכום</title><style>{CSS}</style></head><body>{cover}{toc}{body}</body></html>'
page = re.sub(r'<button class="rcard"[^>]*>.*?</button>', '', page, flags=re.S)
to_pdf(page, os.path.join(H, '..', 'lectures', f'lecture-{LESSON}', 'summary.pdf'), 12000)
