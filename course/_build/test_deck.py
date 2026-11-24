# Headless test of the deck: script errors, overflow per slide (first view and fully revealed), small type,
# and every activity: a wrong answer is rejected and the right one is accepted. Run: python3 test_deck.py [N]
import json, os, re, subprocess, sys, tempfile
H = os.path.dirname(os.path.abspath(__file__))
N = sys.argv[1] if len(sys.argv) > 1 else '1'
SRC = os.path.join(H, '..', 'lectures', f'lecture-{N}', 'presentation.html')
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
TEST = r'''
window.onerror=(m,u,l,c)=>{document.documentElement.setAttribute('data-err',m+' @'+l+':'+c);};
addEventListener('load',()=>{try{
const D=window.__deck,R={overflow:[],small:[],act:[],n:D.slides.length};
const st=document.createElement('style');st.textContent='*{transition:none!important;animation:none!important}';document.head.appendChild(st);
const stage=document.getElementById('stage');
const rel=e=>{const s=stage.getBoundingClientRect(),r=e.getBoundingClientRect(),k=s.width/1280;return{t:(r.top-s.top)/k,b:(r.bottom-s.top)/k,l:(r.left-s.left)/k,r:(r.right-s.left)/k,w:r.width/k,h:r.height/k};};
function measure(s,i,tag){const limit=s.querySelector('.ft')?720-37:716;let worst=0,who='',wl=0,wr=1280;
 s.querySelectorAll('*').forEach(e=>{if(e.closest('.ft')||e.closest('.crumb')||e.closest('.sc-tok')||e.closest('.pd-num')||e.closest('.orb')||e.closest('[hidden]')||e.closest('.toon')||e.closest('svg')&&e.tagName!=='svg')return;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')return;const r=rel(e);if(!r.w&&!r.h)return;
  if(r.b>worst){worst=r.b;who=(e.className||e.tagName)+'';}if(r.l<wl)wl=r.l;if(r.r>wr)wr=r.r;});
 if(worst>limit+.5||wl<-.5||wr>1280.5)R.overflow.push({n:i+1,id:s.id,tag,bottom:Math.round(worst),limit,who:String(who).slice(0,40),l:Math.round(wl),r:Math.round(wr)});}
function small(s){const w=document.createTreeWalker(s,NodeFilter.SHOW_TEXT);let n;const seen={};while(n=w.nextNode()){if(!n.nodeValue.trim())continue;const p=n.parentElement;if(p.closest('.ft,sup,sub,svg,[hidden],.rn,.fn,.crumb'))continue;const f=parseFloat(getComputedStyle(p).fontSize);if(f<16.4)seen[Math.round(f*10)/10]=(n.nodeValue.trim().slice(0,18));}if(Object.keys(seen).length)R.small.push({id:s.id,seen});}
const A=(id,kind,ok,more)=>R.act.push(Object.assign({id,kind,ok:!!ok},more||{}));
function solve(s){
 s.querySelectorAll('.sorter').forEach(b=>{let ok=true;b.querySelectorAll('.srow').forEach(r=>{const os=[...r.querySelectorAll('.so')],a=+r.dataset.a;os.forEach((o,j)=>{if(j!==a){o.click();if(r.classList.contains('solved'))ok=false;}});os[a].click();if(!r.classList.contains('solved'))ok=false;});A(b.id,'sorter',ok&&b.classList.contains('solved'));});
 s.querySelectorAll('.order').forEach(b=>{let ok=true;const cs=[...b.querySelectorAll('.oc')];const n=cs.length;const by=i=>cs.find(c=>+c.dataset.i===i);by(n-1).click();if(b.querySelectorAll('.otrack li').length)ok=false;if(!b.querySelector('.fbbar').classList.contains('wrong'))ok=false;for(let i=0;i<n;i++)by(i).click();ok=ok&&b.classList.contains('solved')&&b.querySelectorAll('.otrack li').length===n;
  const first=cs.map(c=>+c.dataset.i);if(first.every((v,i)=>v===i))ok=false;A(b.id,'order',ok,{shown:first.join('')});});
 s.querySelectorAll('.pick').forEach(b=>{let ok=true;const it=[...b.querySelectorAll('.pk')];it.filter(x=>x.dataset.ok==='0').forEach(x=>{x.click();if(!x.classList.contains('bad')||b.classList.contains('solved'))ok=false;});it.filter(x=>x.dataset.ok==='1').forEach(x=>x.click());A(b.id,'pick',ok&&b.classList.contains('solved'),{right:it.filter(x=>x.dataset.ok==='1').length});});
 s.querySelectorAll('.compose').forEach(b=>{let ok=true;b.querySelectorAll('.crow').forEach(r=>{const os=[...r.querySelectorAll('.co')];if(os.filter(o=>o.dataset.s==='2').length!==1)ok=false;os.find(o=>o.dataset.s!=='2').click();});if(b.classList.contains('solved'))ok=false;b.querySelectorAll('.crow').forEach(r=>[...r.querySelectorAll('.co')].find(o=>o.dataset.s==='2').click());ok=ok&&b.classList.contains('solved')&&b.querySelector('.ctext').textContent.length>30;A(b.id,'compose',ok);});
 s.querySelectorAll('.checker').forEach(b=>{let ok=true;const ta=b.querySelector('.ckin');ta.value='המערכת תהיה מהירה ונוחה';b.querySelector('.chk').click();if(b.classList.contains('solved'))ok=false;b.querySelector('.exb').click();A(b.id,'checker',ok&&b.classList.contains('solved'),{found:b.querySelectorAll('.cklist li.g').length,of:b.querySelectorAll('.cklist li').length});});
 s.querySelectorAll('.mc').forEach(q=>{const a=+q.dataset.a,os=[...q.querySelectorAll('.o')];const w=(a+1)%os.length;os[w].click();const ok=os[w].classList.contains('bad')&&os[a].classList.contains('ok')&&getComputedStyle(q.querySelector('.w')).display!=='none';A(q.id,'mc',ok);});
 s.querySelectorAll('.hands').forEach(b=>{const m=b.querySelector('.morebtn');m.click();const pop=document.getElementById('moreov');const ok=pop.classList.contains('open')&&pop.textContent.includes('תשובה לדוגמה');const r=pop.querySelector('.more-box').getBoundingClientRect();pop.classList.remove('open');A(b.id,'hands',ok&&r.bottom<=innerHeight&&r.top>=0,{h:Math.round(r.height)});});
 s.querySelectorAll('.qviz').forEach(v=>{A(s.id,'query',v.querySelectorAll('.qstep').length>1);});
}
if(window.__fitSlides)window.__fitSlides();
D.slides.forEach((s,i)=>{D.show(i);measure(s,i,'first');D.setAll(s,true);s.querySelectorAll('.qviz').forEach(v=>v.__sync&&v.__sync());measure(s,i,'all');small(s);solve(s);measure(s,i,'solved');});
const pre=document.createElement('pre');pre.id='__res';pre.textContent=JSON.stringify(R);document.body.appendChild(pre);
}catch(e){document.documentElement.setAttribute('data-err',String(e&&e.stack||e));}});
'''
src = open(SRC, encoding='utf8').read()
d = tempfile.mkdtemp(dir=os.environ.get('TMPDIR'))
p = os.path.join(d, 't.html')
open(p, 'w', encoding='utf8').write(src.replace('</body>', '<script>' + TEST + '</script></body>'))
out = subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-sandbox', f'--user-data-dir={d}/p', '--window-size=1280,778', '--virtual-time-budget=15000', '--dump-dom', 'file://' + p], capture_output=True, timeout=240).stdout.decode('utf8', 'replace')
err = re.search(r'data-err="([^"]*)"', out)
if err: print('SCRIPT ERROR:', err.group(1)[:600])
m = re.search(r'<pre id="__res">(.*?)</pre>', out, re.S)
if not m: print('no result'); sys.exit(1)
import html as hh
R = json.loads(hh.unescape(m.group(1)))
print('slides', R['n'], 'activities', len(R['act']))
bad = [a for a in R['act'] if not a['ok']]
print('FAILED ACTIVITIES:', json.dumps(bad, ensure_ascii=False) if bad else 'none')
print('OVERFLOW:', len(R['overflow']))
seen = set()
for o in R['overflow']:
    if o['id'] in seen: continue
    seen.add(o['id']); print('  ', o)
print('SMALL TYPE:', R['small'] or 'none')
from collections import Counter
print(Counter(a['kind'] for a in R['act']))
