# Shared PDF printing: David font, A4, headless Chrome. The fonts are not committed (../../iit-build/fonts).
import os, shutil, subprocess, tempfile
H = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.expanduser('~/Downloads/iit-build/fonts')
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
SITE = 'https://shaytsaban.github.io/technion/course/'
CR1 = 'קרדיט לתכנים עצמם וליצירת תוכן הקורס: ד״ר אסף שריג'
CR2 = 'קרדיט לעיצוב הפדגוגי, ההמחשות, הדוגמאות, בניית המצגת ותהליך הלמידה: ד״ר שי צבאן'
BASE = '''
@font-face{font-family:"David";src:url("david.ttf");font-weight:400}
@font-face{font-family:"David";src:url("davidbd.ttf");font-weight:700}
@page{size:A4;margin:15mm;@bottom-center{content:counter(page);font-family:"David";font-size:10pt;color:#5d6a86}}
:root{--ink:#16213a;--navy:#1b2d55;--navy2:#1b2d55;--coral:#ff6a4d;--mut:#5d6a86;--line:#d9d2c3;--inc:#25a65f;--incbg:#dcf5e6}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
html{direction:rtl}
body{font-family:"David";font-size:11.8pt;line-height:1.32;color:var(--ink);margin:0}
.n,.m{direction:ltr;unicode-bidi:isolate}
.m{white-space:nowrap;font-weight:700}
.m i,.eq i{font-family:"Times New Roman",Times,serif;font-style:italic;font-size:1.06em}
.mh{unicode-bidi:isolate;direction:rtl}
sup,sub{font-size:.68em;line-height:0}
.eq{direction:ltr;unicode-bidi:isolate;text-align:left;font-size:12.6pt;margin:.8mm 0;white-space:nowrap;font-weight:700}
.k1{color:#c4421f}.k2{color:#087469}.k3{color:#4f33c9}.k4{color:#a86703}
h1{font-size:17pt;color:var(--navy);margin:5mm 0 2.5mm;padding-bottom:1.5mm;border-bottom:.8mm solid var(--coral);font-weight:700;break-after:avoid}
h3{font-size:12.8pt;color:var(--navy);margin:3.4mm 0 1mm;font-weight:700;break-after:avoid}
p{margin:0 0 1.2mm}
ul,ol{margin:0 0 1.6mm;padding-right:6mm}li{margin-bottom:.5mm}
table{border-collapse:collapse}tr{break-inside:avoid}
.hd{background:linear-gradient(160deg,#0f1b33 0%,#1b2d55 60%,#27447f 100%);color:#fff;border-radius:3mm;padding:6mm 8mm;margin-bottom:4mm}
.hd .k{color:#7fe3d6;font-weight:700;font-size:12pt}.hd h1.t{color:#fff;margin:1.5mm 0 1mm;font-size:24pt;border:0;padding:0}.hd .s{color:#d6e0f7;font-size:13.5pt}.hd .cr{color:#ffd37a;font-size:10.6pt;margin-top:2mm;line-height:1.4}
.note{background:#eef2ff;border-right:1.2mm solid var(--navy);border-radius:1mm;padding:1.2mm 2.6mm;font-size:11pt;margin:1.5mm 0;break-inside:avoid}
.url{direction:ltr;unicode-bidi:isolate;font-family:Arial,sans-serif;font-size:10pt;color:var(--navy)}
'''


def to_pdf(page, out, budget=8000):
    for bad in ('—', '־', '–', '…'):
        assert bad not in page, 'forbidden character ' + bad
    d = tempfile.mkdtemp(dir=os.environ.get('TMPDIR'))
    for f in ('david.ttf', 'davidbd.ttf'): shutil.copy(os.path.join(FONTS, f), d)
    p = os.path.join(d, 'p.html'); open(p, 'w', encoding='utf8').write(page)
    out = os.path.abspath(out); os.makedirs(os.path.dirname(out), exist_ok=True)
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-sandbox', f'--user-data-dir={d}/p', '--no-pdf-header-footer', f'--virtual-time-budget={budget}', f'--print-to-pdf={out}', 'file://' + p], capture_output=True, timeout=180)
    shutil.rmtree(d, True)
    import fitz
    doc = fitz.open(out); txt = ''.join(pg.get_text() for pg in doc)
    print(os.path.basename(out), 'pages', len(doc), 'bytes', os.path.getsize(out), 'fonts', sorted({f[3].split('+')[-1] for pg in doc for f in pg.get_fonts()}), 'bad chars', [c for c in '—־–…' if c in txt])
