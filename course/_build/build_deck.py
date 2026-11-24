# Lesson deck. Run: python3 build_deck.py 1  ->  ../lectures/lecture-N/presentation.html
import os, re, json, sys
H = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, H)
R = lambda f: open(os.path.join(H, f), encoding='utf8').read()
MODE = 'deck'
LESSON = int(sys.argv[1]) if len(sys.argv) > 1 else 1
exec(R('content_a.py'))
exec(R('content_g.py'))
exec(R(f'content_l{LESSON}.py'))
TOTAL = max(s['part'] or 0 for s in SL)
HEAD = f'{COURSE} · מפגש {LESSON}' + (f' · {LMETA["date"]}' if LMETA['date'] else '')


def render(s, total):
    k = s['kind']
    if k == 'opener':
        n = s['part']
        note = f'<div class="pd-note">{TX(s["note"])}</div>' if s.get('note') else ''
        return (f'<section class="slide dark pd" id="{s["id"]}" data-title="{s["title"]}" style="--pc:#7fe3d6"><div class="pd-num">{n}</div><div class="pd-in">'
                f'<div class="kick" style="color:#ffb199"><span>חלק <span class="n">{n}</span> מתוך <span class="n">{total}</span> · {TX("כ-" + str(s["mins"]) + " דקות")}</span></div><div class="pd-h">{s["h"]}</div><div class="pd-q">{TX(s["q"])}</div>{note}'
                f'<div class="pd-cols"><div class="pd-box"><b>מה נעשה בחלק הזה</b><ul>{"".join("<li>" + TX(x) + "</li>" for x in s["learn"])}</ul></div></div></div></section>')
    kick = f'<div class="kick"><span>{TX(s["kick"])}</span></div>' if s.get('kick') else ''
    if s.get('part') and globals().get('THREAD_L'):
        kick = '<div class="crumb">' + ''.join(f'<span class="{"now" if j + 1 == s["part"] else ("was" if j + 1 < s["part"] else "")}">{x}</span>' for j, x in enumerate(THREAD_L)) + '</div>' + kick
    return f'<section class="slide {s["cls"]}" id="{s["id"]}" data-title="{re.sub("<[^>]+>", "", s["title"])}">{kick}<h2>{TX(s["h"])}</h2>{s["body"]}</section>'


body = '\n'.join(render(s, TOTAL) for s in SL)
NMC = body.count('class="mc"')
NHANDS = body.count('class="hands"')
chips = [f'{NACT[0]} פעילויות בתוך השקפים', 'מקרה אחד, מאפס', 'כל רעיון נבנה קליק אחר קליק'] + (['טיוטה לקראת המפגש'] if LMETA.get('draft') else [])
title_s = ('<section class="slide dark s1 on" id="s-title" data-title="פתיחה">'
           '<div class="orb" style="width:320px;height:320px;background:radial-gradient(circle at 30% 30%,#58e0cf,#0f9d90 60%,transparent 72%);left:-90px;top:-70px"></div>'
           '<div class="orb" style="width:180px;height:180px;background:radial-gradient(circle at 30% 30%,#ffd37a,#e8960c 60%,transparent 72%);left:230px;bottom:90px;animation-delay:-3s"></div>'
           '<div style="position:absolute;right:70px;top:70px;width:980px">'
           f'<div class="kick" style="color:#ffb199"><span>{TX(HEAD)}</span></div>'
           f'<h1><span>{LMETA["h1"][0]}</span> <span style="color:#7fe3d6">{LMETA["h1"][1]}</span></h1>'
           '<p class="sub" style="margin-top:18px;font-size:25px;color:#c8d4f2">' + TX(LMETA['sub']) + '</p>'
           '<div class="chipbar" style="margin-top:20px">' + ''.join(f'<span class="chip">{TX(c)}</span>' for c in chips) + '</div></div>'
           f'<div style="position:absolute;right:70px;bottom:52px;font-size:21px;color:#c8d4f2">ד״ר שי צבאן · {INST}</div></section>')
end_s = ('<section class="slide dark s1" id="s-end" data-title="סיום"><div style="position:relative;max-width:1000px;margin-top:90px">'
         f'<div class="kick" style="color:#ffb199">סוף מפגש {LESSON}</div>'
         f'<h1 style="font-size:58px">במפגש הבא: <span style="color:#7fe3d6">{LMETA["next_h"]}</span></h1>'
         '<p class="sub" style="font-size:25px;margin-top:20px;color:#c8d4f2;max-width:960px">' + TX(LMETA['next_t']) + '</p>'
         '<p class="sub" style="font-size:22px;margin-top:24px;color:#c8d4f2">פניות למרצה במייל: <span dir="ltr">shay.tsaban@gmail.com</span>. יש לציין את שם המוסד ואת שם הקורס.</p></div></section>')
slides_html = title_s + '\n' + body + '\n' + end_s
fonts, base, tail = R('shell/fonts.css'), R('shell/base.css'), R('shell/tail.html')
_used = set(re.findall(r'data-t="(\w+)"', slides_html))
assert _used <= set(G), _used - set(G)
gj = json.dumps({k: {f: (TX(v) if f != 'en' else v) for f, v in g.items()} for k, g in G.items()}, ensure_ascii=False)
js = f'const COURSE={json.dumps(COURSE, ensure_ascii=False)};const LESSON={LESSON};\nconst G={gj};\n' + R('deck.js') + '\n' + R('act.js')
title = f'{COURSE} | מפגש {LESSON} | {LMETA["title"]}'
html = (f'<!doctype html>\n<html lang="he" dir="rtl">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>{title}</title>\n<style>\n'
        + fonts + base + R('deck.css') + '</style>\n</head>\n<body>\n<div class="stage" id="stage">\n' + slides_html + '\n' + tail
        + '<script>\n(function(){\n' + js + '\n})();\n</script>\n</body>\n</html>\n')
for bad in ('—', '־', '–', '…'):
    assert bad not in html.replace(fonts, ''), 'forbidden character ' + bad + ' near: ' + html.replace(fonts, '')[max(0, html.replace(fonts, '').find(bad) - 60):html.replace(fonts, '').find(bad) + 20]
out = os.path.join(H, '..', 'lectures', f'lecture-{LESSON}')
os.makedirs(out, exist_ok=True)
open(os.path.join(out, 'presentation.html'), 'w', encoding='utf8').write(html)
print('slides', html.count('<section class="slide'), 'activities', NACT[0], 'hands', NHANDS, 'mc', NMC, 'bytes', len(html))
os.makedirs(os.path.join(H, 'tests'), exist_ok=True)
json.dump(MAN, open(os.path.join(H, 'tests', f'manifest-{LESSON}.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)
