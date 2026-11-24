# Screenshots of every slide, fully revealed, into contact sheets. Run: python3 shots.py [outdir]
import os, re, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(H, '..', 'lectures', 'lecture-' + os.environ.get('LESSON', '1'), 'presentation.html')
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp()
os.makedirs(OUT, exist_ok=True)
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
ids = re.findall(r'<section class="slide[^"]*" id="([^"]+)"', open(SRC, encoding='utf8').read())
def shot(a):
    i, sid = a
    p = os.path.join(OUT, f's{i:03d}.png')
    if os.path.exists(p): return p
    try: subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-sandbox', f'--user-data-dir={OUT}/p{i % 6}', '--window-size=1280,778', '--hide-scrollbars', '--virtual-time-budget=4000', f'--screenshot={p}', f'file://{os.path.abspath(SRC)}?all#{sid}'], capture_output=True, timeout=180)
    except subprocess.TimeoutExpired: pass
    return p
for k in range(6):
    with ThreadPoolExecutor(1) as ex: pass
chunks = [[(i, s) for i, s in enumerate(ids) if i % 6 == k] for k in range(6)]
with ThreadPoolExecutor(6) as ex:
    list(ex.map(lambda ch: [shot(a) for a in ch], chunks))
W, Hh = 640, 360
for k in range(0, len(ids), 6):
    c = Image.new('RGB', (W * 2, Hh * 3), 'white')
    for j in range(6):
        if k + j >= len(ids): break
        if not os.path.exists(os.path.join(OUT, f's{k + j:03d}.png')): continue
        im = Image.open(os.path.join(OUT, f's{k + j:03d}.png')).crop((0, 0, 1280, 720)).resize((W, Hh), Image.LANCZOS)
        c.paste(im, ((1 - j % 2) * W, (j // 2) * Hh))
    c.save(os.path.join(OUT, f'sheet{k // 6:02d}.png'))
print(len(ids), 'slides ->', OUT)
