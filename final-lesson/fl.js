/* Capstone lesson engine: shared by hub + 6 parts. No dependencies except sql.js (loaded by the shell). */
(function(){
'use strict';
const $ = (s,r)=> (r||document).querySelector(s);
const $$ = (s,r)=> Array.from((r||document).querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KEY = 'fl1';
let store = (function(){ try { const s = JSON.parse(localStorage.getItem(KEY)||'null'); if (s && s.acts) return s; } catch(e){} return {acts:{}, notes:{}}; })();
function save(){ try { localStorage.setItem(KEY, JSON.stringify(store)); } catch(e){} }
const TRACK = '.lab[data-id],.quiz[data-id],.anim[data-id],.box.try[data-id],.box.think[data-id],.sim[data-id]';
const PAGE = window.FL_PAGE || 0;
const MAN = window.FL_MANIFEST || {parts:[]};
if (new URLSearchParams(location.search).get('teacher')==='1') document.body.classList.add('teacher');

/* ---------- progress ---------- */
function done(id){
  if (!id) return;
  if (!store.acts[id]){ store.acts[id] = 1; save(); }
  $$('[data-id="'+id+'"]').forEach(e=>e.classList.add('is-done'));
  renderProgress();
}
function isDone(id){ return !!store.acts[id]; }
function pagePct(ids){ if (!ids.length) return 0; return Math.round(100*ids.filter(i=>store.acts[i]).length/ids.length); }
function renderProgress(){
  const ids = $$(TRACK).map(e=>e.dataset.id);
  const pct = pagePct(ids);
  const b = $('#pbar'); if (b) b.style.width = pct+'%';
  const t = $('#ppct'); if (t && PAGE) t.textContent = pct+'% בחלק';
  MAN.parts.forEach(p=>{ const a = $('#part'+p.n+' small'); if (a) a.textContent = ' · '+pagePct(p.ids)+'%'; });
  $$('.pcard[data-part]').forEach(c=>{ const p = MAN.parts.find(x=>x.n==c.dataset.part); if (!p) return; const v = pagePct(p.ids);
    const i = $('.pp i', c); if (i) i.style.width = v+'%'; const s = $('.pv', c); if (s) s.textContent = v+'% הושלם'; });
  const all = [].concat.apply([], MAN.parts.map(p=>p.ids)); const g = $('#gpct'); if (g) g.textContent = pagePct(all)+'%';
}

/* ---------- pills + scrollspy ---------- */
function initPills(){
  const secs = $$('.sec[id]'); const box = $('#pills'); if (!box) return;
  box.innerHTML = secs.map(s=>'<a href="#'+s.id+'" data-t="'+s.id+'">'+esc(s.dataset.t || ($('h2',s)||{}).textContent || s.id)+'</a>').join('');
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es=>{ es.forEach(e=>{ if (e.isIntersecting){ $$('a',box).forEach(a=>a.classList.toggle('on', a.dataset.t===e.target.id)); const on = $('a.on',box); if (on && on.scrollIntoView) { try { box.scrollTo({left: on.offsetLeft - box.clientWidth/2 + on.clientWidth/2, behavior:'instant'}); } catch(x){} } } }); }, {rootMargin:'-20% 0px -70% 0px'});
  secs.forEach(s=>io.observe(s));
}

/* ---------- dfn popovers ---------- */
function initDfn(){
  let pop = null;
  function hide(){ if (pop){ pop.remove(); pop = null; } }
  document.addEventListener('click', e=>{
    const d = e.target.closest && e.target.closest('dfn[data-d]');
    if (!d){ hide(); return; }
    e.preventDefault(); const same = pop && pop._for===d; hide(); if (same) return;
    pop = document.createElement('div'); pop.className = 'pop'; pop.textContent = d.dataset.d; pop._for = d; document.body.appendChild(pop);
    const r = d.getBoundingClientRect(); pop.style.top = (window.scrollY + r.bottom + 6)+'px';
    let left = window.scrollX + r.left; const w = pop.offsetWidth; left = Math.max(8, Math.min(left, window.scrollX + document.documentElement.clientWidth - w - 8)); pop.style.left = left+'px';
  });
}

/* ---------- code blocks: highlight + copy ---------- */
const SQLKW = /\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|ON|AS|AND|OR|NOT|IN|IS|NULL|LIKE|BETWEEN|CASE|WHEN|THEN|ELSE|END|DISTINCT|COUNT|SUM|AVG|MIN|MAX|COALESCE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|PRIMARY|KEY|FOREIGN|REFERENCES|DEFAULT|WITH|OVER|PARTITION|BY|UNION|ALL|BEGIN|COMMIT|ROLLBACK|TRIGGER|AFTER|BEFORE|FOR|EACH|ROW|DROP|ALTER|ADD|INDEX|VIEW|ASC|DESC|EXISTS|UNNEST|ROUND|STRFTIME|CAST|PROCEDURE|FUNCTION|RETURNS|LANGUAGE|DECLARE|IF|RETURN|USING)\b/gi;
function hl(txt){
  let h = esc(txt);
  h = h.replace(/(--[^\n]*)/g, '<span class="cm">$1</span>');
  h = h.replace(/('[^'\n]*')/g, '<span class="str">$1</span>');
  h = h.replace(/(^|[^\w>"])(\d+(\.\d+)?)(?![\w"])/g, '$1<span class="num">$2</span>');
  h = h.replace(SQLKW, (m,a,off,str)=>{ const before = str.slice(Math.max(0,off-30), off); if (/<span class="(cm|str)">[^<]*$/.test(before)) return m; return '<span class="kw">'+m+'</span>'; });
  return h;
}
function copyText(text, btn, ok){
  const fin = ()=>{ if (!btn) return; const o = btn.textContent; btn.textContent = ok||'הועתק ✓'; setTimeout(()=>btn.textContent=o, 1400); };
  if (navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(fin, ()=>{ legacy(); }); } else legacy();
  function legacy(){ const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch(e){} t.remove(); fin(); }
}
function initCode(){
  $$('pre.code, pre.prompt').forEach(p=>{
    if (p.dataset.ok) return; p.dataset.ok = '1';
    const raw = p.textContent.replace(/^\n/, '').replace(/\s+$/, '');
    if (p.classList.contains('code') && (p.dataset.lang||'').toLowerCase()==='sql') p.innerHTML = hl(raw); else p.textContent = raw;
    const b = document.createElement('button'); b.className = 'cpy'; b.type = 'button'; b.textContent = 'העתק'; b.addEventListener('click', ()=>copyText(raw, b)); p.appendChild(b);
    p._raw = raw;
  });
}

/* ---------- boxes: try / think ---------- */
function initBoxes(){
  $$('.box.try[data-id]').forEach(b=>{
    const btn = document.createElement('button'); btn.type='button'; btn.className='btn donebtn'; btn.textContent='ביצעתי את ההתנסות'; b.appendChild(btn);
    btn.addEventListener('click', ()=>{ done(b.dataset.id); btn.textContent='נרשם ✓'; btn.classList.add('ok'); });
    if (isDone(b.dataset.id)){ b.classList.add('is-done'); btn.textContent='נרשם ✓'; btn.classList.add('ok'); }
  });
  $$('.box.think').forEach(b=>{
    const id = b.dataset.id; const ans = $('.ans', b);
    const ta = document.createElement('textarea'); ta.className='mine'; ta.placeholder='כתבו כאן את המחשבה שלכם (נשמר רק בדפדפן שלכם)';
    const first = ans || null; if (first) b.insertBefore(ta, first); else b.appendChild(ta);
    if (id && store.notes[id]) ta.value = store.notes[id];
    ta.addEventListener('input', ()=>{ if (id){ store.notes[id] = ta.value; save(); if (ta.value.trim().length >= 12) done(id); } });
    if (ans){
      const btn = document.createElement('button'); btn.type='button'; btn.className='btn sec2'; btn.textContent='הצגת תשובה לדוגמה'; b.insertBefore(btn, ans);
      btn.addEventListener('click', ()=>{ ans.classList.toggle('show'); btn.textContent = ans.classList.contains('show') ? 'הסתרת התשובה' : 'הצגת תשובה לדוגמה'; if (id) done(id); });
    }
    if (id && isDone(id)) b.classList.add('is-done');
  });
}

/* ---------- quiz ---------- */
function initQuiz(){
  $$('.quiz').forEach(qz=>{
    const id = qz.dataset.id, correct = +qz.dataset.a, opts = $$('.opt', qz);
    opts.forEach((o,i)=>o.addEventListener('click', ()=>{
      if (qz.classList.contains('shown')) return;
      if (i+1 === correct){ o.classList.add('right'); qz.classList.add('shown'); if (id) done(id); }
      else { o.classList.add('wrong'); o.disabled = true; }
    }));
    if (id && isDone(id)){ qz.classList.add('is-done'); }
  });
}

/* ---------- animation stepper ---------- */
function initAnim(){
  $$('.anim').forEach(a=>{
    const caps = $$('.caps li', a); const N = caps.length || 1; let cur = 1, timer = null;
    const ctl = document.createElement('div'); ctl.className = 'ctl';
    ctl.innerHTML = '<button type="button" data-k="play">▶ הפעלה</button><button type="button" data-k="prev">הקודם</button><button type="button" data-k="next">הבא</button><button type="button" data-k="reset">מההתחלה</button><span class="dots">'+caps.map((c,i)=>'<i data-i="'+(i+1)+'"></i>').join('')+'</span>';
    const capsEl = $('.caps', a); a.insertBefore(ctl, capsEl);
    const stageEls = $$('[data-s],[data-only],[data-move]', a);
    function parseMove(el){ if (el._mv) return el._mv; el._mv = el.dataset.move.split('|').map(p=>{ const [s,xy] = p.split(':'); const [x,y] = xy.split(','); return {s:+s,x:+x,y:+y}; }); return el._mv; }
    function render(){
      stageEls.forEach(el=>{
        if (el.dataset.s !== undefined){ const on = cur >= +el.dataset.s; el.classList.toggle('on', on); el.classList.toggle('now', on && cur === +el.dataset.s && el.dataset.pulse !== undefined); }
        if (el.dataset.only !== undefined){ const on = el.dataset.only.split(',').map(Number).indexOf(cur) >= 0; el.classList.toggle('on', on); }
        if (el.dataset.move !== undefined){ const mv = parseMove(el); let pos = {x:0,y:0}; mv.forEach(m=>{ if (m.s <= cur) pos = m; }); el.style.transform = 'translate('+pos.x+'px,'+pos.y+'px)'; if (el.dataset.s === undefined && el.dataset.only === undefined) el.classList.add('on'); }
      });
      caps.forEach((c,i)=>c.classList.toggle('on', i+1===cur));
      $$('.dots i', a).forEach((d,i)=>d.classList.toggle('on', i+1===cur));
      if (cur === N && a.dataset.id) done(a.dataset.id);
    }
    function stop(){ if (timer){ clearInterval(timer); timer = null; $('[data-k=play]',a).textContent = '▶ הפעלה'; } }
    function play(){ if (timer) { stop(); return; } if (cur >= N) cur = 1; render(); $('[data-k=play]',a).textContent = '⏸ עצירה'; timer = setInterval(()=>{ if (cur >= N){ stop(); return; } cur++; render(); }, +(a.dataset.speed||2600)); }
    ctl.addEventListener('click', e=>{ const b = e.target.closest('button'), d = e.target.closest('i[data-i]'); if (d){ stop(); cur = +d.dataset.i; render(); return; } if (!b) return;
      const k = b.dataset.k; if (k==='play') play(); else { stop(); if (k==='next') cur = Math.min(N, cur+1); if (k==='prev') cur = Math.max(1, cur-1); if (k==='reset') cur = 1; render(); } });
    render();
    if ('IntersectionObserver' in window && a.dataset.auto){ const io = new IntersectionObserver(es=>{ es.forEach(e=>{ if (e.isIntersecting){ io.disconnect(); setTimeout(play, 700); } }); }, {threshold:.6}); io.observe(a); }
    if (a.dataset.id && isDone(a.dataset.id)) a.classList.add('is-done');
  });
}

/* ---------- SQL engine ---------- */
let SQLmod = null; const TPL = {}; let engineOK = false; const readyCbs = []; let readyFired = false;
function onReady(fn){ if (readyFired) fn(engineOK); else readyCbs.push(fn); }
function fireReady(){ readyFired = true; readyCbs.splice(0).forEach(f=>{ try { f(engineOK); } catch(e){ if (window.console) console.warn(e); } }); }
function setChip(){ const e = $('#eng'); if (!e) return; if (engineOK){ e.textContent = '🟢 SQL'; e.className = 'chipst ok'; } else { e.textContent = '🔴 SQL לא נטען'; e.className = 'chipst bad'; } }
function startEngine(){
  if (typeof initSqlJs !== 'function' || !window.FL_DB){ setChip(); fireReady(); return; }
  initSqlJs({locateFile: f => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/' + f})
    .then(S=>{ SQLmod = S; Object.keys(window.FL_DB).forEach(n=>{ const d = new S.Database(); window.FL_DB[n].forEach(s=>d.run(s)); TPL[n] = d.export(); d.close(); }); engineOK = true; setChip(); fireReady(); })
    .catch(()=>{ engineOK = false; setChip(); fireReady(); });
}
function newDb(name, opts){ const d = new SQLmod.Database(TPL[name||'rest']); if (opts && opts.fk) d.run('PRAGMA foreign_keys=ON'); return d; }
function lastRes(db, sql){ const r = db.exec(sql); for (let i=r.length-1;i>=0;i--) if (r[i].columns.length) return r[i]; return null; }
function exec(sql, name, opts){ const d = newDb(name, opts); try { return lastRes(d, sql); } finally { d.close(); } }
function fmtCell(v){ if (v === null || v === undefined) return '<i>NULL</i>'; if (typeof v === 'number') return esc(Number.isInteger(v) ? String(v) : String(Math.round(v*100)/100)); return esc(v); }
function tableHTML(res, maxRows){
  if (!res) return ''; const M = maxRows || 60; const rows = res.values.slice(0, M);
  let h = '<table><thead><tr>'+res.columns.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>';
  rows.forEach(r=>{ h += '<tr>'+r.map(v=>'<td>'+fmtCell(v)+'</td>').join('')+'</tr>'; });
  h += '</tbody></table>'; h += '<div class="cnt">'+res.values.length+' שורות'+(res.values.length>M?' (מוצגות '+M+' הראשונות)':'')+'</div>'; return h;
}
function norm(res, ordered){
  if (!res) return null;
  const rows = res.values.map(r=>JSON.stringify(r.map(v=> typeof v === 'number' ? Math.round(v*100)/100 : (v === null ? null : String(v).trim()))));
  return {n: res.columns.length, rows: ordered ? rows : rows.slice().sort()};
}
function sameRes(a, b, ordered){ const x = norm(a, ordered), y = norm(b, ordered); if (!x || !y) return false; return x.n === y.n && x.rows.length === y.rows.length && x.rows.every((r,i)=>r===y.rows[i]); }
function txt(el){ return el ? el.textContent.replace(/^\n/, '').replace(/\s+$/, '') : ''; }

function buildLab(box){
  const id = box.dataset.id, dbn = box.dataset.db || 'rest', fk = box.dataset.fk === '1', ordered = box.dataset.ordered === '1';
  const startSql = txt($('pre.start', box)), checkSql = txt($('pre.check', box)), solSql = txt($('pre.solution', box)), setup = txt($('pre.setup', box)), showSql = txt($('pre.show', box));
  const hints = $$('ol.hints li', box).map(li=>li.innerHTML), whyHTML = ($('.why-src', box)||{}).innerHTML || '', qHTML = ($('.q-src', box)||{}).innerHTML || '';
  const reqRe = box.dataset.require ? new RegExp(box.dataset.require, 'i') : null, reqMsg = box.dataset.requireMsg || 'חסר בפקודה רכיב שנדרש במשימה.';
  const title = box.dataset.title || 'מעבדת SQL';
  box.innerHTML = '<div class="lh"><b>🧪 '+esc(title)+'</b><span class="db">'+(dbn==='proj'?'מסד הפרויקט':'מסד המסעדה')+' · SQLite בדפדפן</span></div>'
    + (qHTML ? '<div class="lq">'+qHTML+'</div>' : '')
    + '<textarea class="ed" spellcheck="false" aria-label="עורך SQL"></textarea>'
    + '<div class="lbar"><button type="button" class="btn" data-k="run">▶ הרצה</button>'+(hints.length?'<button type="button" class="btn sec2" data-k="hint">רמז</button>':'')+((solSql||checkSql)?'<button type="button" class="btn sec2" data-k="sol" disabled>הצגת פתרון</button>':'')+'<button type="button" class="btn sec2" data-k="reset">איפוס</button><span class="chip b">Ctrl+Enter להרצה</span></div>'
    + '<div class="msg"></div><div class="res"></div><div class="why">'+whyHTML+'</div>';
  const ed = $('textarea.ed', box), msg = $('.msg', box), res = $('.res', box); let hintI = 0, tries = 0;
  box._solution = solSql || checkSql || startSql; box._hasCheck = !!checkSql;
  ed.value = startSql; ed.rows = Math.max(3, Math.min(14, startSql.split('\n').length + 1));
  const say = (k,t)=>{ msg.className = 'msg '+k; msg.innerHTML = t; };
  if (isDone(id)) box.classList.add('done');
  function apply(d){ if (setup) d.run(setup); }
  function run(){
    if (!engineOK){ say('bad', 'מנוע ה-SQL לא נטען. בדקו חיבור לאינטרנט ורעננו את הדף.'); return; }
    const sql = ed.value.trim(); if (!sql){ say('info', 'כתבו פקודת SQL ואז לחצו הרצה.'); return; }
    tries++; const sol = $('[data-k=sol]', box); if (sol && tries >= 2) sol.disabled = false;
    const d = newDb(dbn, {fk}); let r = null, before = null;
    try {
      apply(d); if (showSql) before = lastRes(d, showSql);
      const all = d.exec(sql); for (let i=all.length-1;i>=0;i--) if (all[i].columns.length){ r = all[i]; break; }
      let shown = r, after = null; if (showSql){ after = lastRes(d, showSql); }
      let html = '';
      if (showSql){ html += '<div class="ba"><div><b>לפני</b>'+tableHTML(before,12)+'</div><div><b>אחרי</b>'+tableHTML(after,12)+'</div></div>'; if (shown && !sameRes(shown, after, true)) html += '<b>תוצאת השאילתה האחרונה</b>'+tableHTML(shown); }
      else html += shown ? tableHTML(shown) : '<div class="cnt">הפקודה בוצעה. (לא הוחזרה טבלה.)</div>';
      res.innerHTML = html;
      if (reqRe && !reqRe.test(sql)){ d.close(); say('bad', esc(reqMsg)); return; }
      if (checkSql){
        const d2 = newDb(dbn, {fk}); let r2 = null, a2 = null;
        try { apply(d2); const all2 = d2.exec(checkSql); for (let i=all2.length-1;i>=0;i--) if (all2[i].columns.length){ r2 = all2[i]; break; } if (showSql) a2 = lastRes(d2, showSql); } finally { d2.close(); }
        const ok = showSql ? sameRes(after, a2, ordered) : sameRes(shown, r2, ordered);
        if (ok){ say('ok', '✓ נכון. התוצאה זהה לתוצאה המצופה.'); box.classList.add('done'); done(id); }
        else { say('bad', showSql ? 'התוצאה שונה מהמצופה. השוו את טבלת ״אחרי״ למה שהמשימה מבקשת.' : 'התוצאה שונה מהמצופה'+(shown && r2 ? ' (קיבלתם '+shown.values.length+' שורות ו-'+shown.columns.length+' עמודות; מצופה '+r2.values.length+' שורות ו-'+r2.columns.length+' עמודות)' : '')+'. נסו רמז או בדקו את התנאים.'); }
      } else { say('ok', '✓ הפקודה רצה בהצלחה.'); box.classList.add('done'); done(id); }
    } catch(err){ say('bad', 'שגיאת SQL: <span class="mono">'+esc(err.message||String(err))+'</span>'); res.innerHTML = ''; }
    finally { try { d.close(); } catch(e){} }
  }
  box.addEventListener('click', e=>{
    const b = e.target.closest('button[data-k]'); if (!b || !box.contains(b)) return; const k = b.dataset.k;
    if (k==='run') run();
    if (k==='reset'){ ed.value = startSql; res.innerHTML = ''; msg.className = 'msg'; }
    if (k==='hint'){ const i = Math.min(hintI, hints.length-1); hintI++; say('info', '💡 רמז '+(i+1)+': '+hints[i]); const s = $('[data-k=sol]', box); if (s && hintI >= hints.length) s.disabled = false; }
    if (k==='sol'){ ed.value = solSql || checkSql; say('info', 'הפתרון הוצג בעורך. הריצו אותו וודאו שהבנתם כל שורה.'); }
  });
  ed.addEventListener('keydown', e=>{
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter'){ e.preventDefault(); run(); }
    if (e.key === 'Tab'){ e.preventDefault(); const s = ed.selectionStart; ed.value = ed.value.slice(0,s) + '  ' + ed.value.slice(ed.selectionEnd); ed.selectionStart = ed.selectionEnd = s+2; }
  });
}
function initLabs(){ $$('.lab').forEach(buildLab); }
function initSchema(){
  $$('.schema[data-db]').forEach(box=>{
    if (!engineOK){ box.textContent = 'המנוע לא נטען.'; return; }
    const d = newDb(box.dataset.db); const only = box.dataset.tables ? box.dataset.tables.split(',') : null;
    const names = d.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY rowid")[0].values.map(r=>r[0]).filter(n=>!only || only.indexOf(n)>=0);
    box.innerHTML = names.map(n=>{ const cols = d.exec('PRAGMA table_info('+n+')')[0].values; const cnt = d.exec('SELECT COUNT(*) FROM '+n)[0].values[0][0];
      return '<div class="t"><b>'+esc(n)+' <small>('+cnt+')</small></b>'+cols.map(c=>'<span>'+esc(c[1])+'<em>'+esc(c[2]||'')+(c[5]?' · PK':'')+'</em></span>').join('')+'</div>'; }).join('');
    d.close();
  });
}

/* ---------- dashboard-wide: copy buttons for .copy ---------- */
function initMisc(){
  $$('[data-copy]').forEach(b=>b.addEventListener('click', ()=>copyText(b.dataset.copy, b)));
  $$('.sim[data-id],.box.think[data-id],.box.try[data-id],.quiz[data-id],.anim[data-id]').forEach(e=>{ if (isDone(e.dataset.id)) e.classList.add('is-done'); });
  const rs = $('#resetAll'); if (rs) rs.addEventListener('click', ()=>{ if (confirm('למחוק את סימוני ההתקדמות בדפדפן הזה?')){ store = {acts:{}, notes:{}}; save(); location.reload(); } });
}

function dom(fn){ if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
window.FL = {dom, $, $$, esc, done, isDone, onReady, newDb, exec, tableHTML, sameRes, hl, copyText, store: ()=>store, ok: ()=>engineOK};

function init(){
  initPills(); initDfn(); initCode(); initBoxes(); initQuiz(); initAnim(); initMisc(); renderProgress();
  startEngine();
  onReady(()=>{ initLabs(); initSchema(); renderProgress(); });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
