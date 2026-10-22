/* Mini Tableau: an in-browser teaching simulation of Tableau's shelf logic on the Scoop dataset.
   Vanilla JS, no network, no eval. Needs window.TF_SCOOP (loaded lazily through TF.loadScoop from tf-scoop.js).
   Markup: <div class="tfp" data-id=".." data-task=".." data-goal='{..}' data-preset='{..}' data-hide-shelves=".." data-fields=".."></div>
   API: window.TFP = {get(el), ready(cb), all(), init(el)}; see PLAYGROUND.md. */
(function(){
'use strict';
if (window.TFP && window.TFP.__v) return;

/* ------------------------------------------------------------------ constants */
var PAL10 = ['#4e79a7','#f28e2b','#e15759','#76b7b2','#59a14f','#edc948','#b07aa1','#ff9da7','#9c755f','#bab0ac'];
var PAL20 = ['#4e79a7','#a0cbe8','#f28e2b','#ffbe7d','#59a14f','#8cd17d','#b6992d','#f1ce63','#499894','#86bcb6','#e15759','#ff9d9a','#79706e','#bab0ac','#d37295','#fabfd2','#b07aa1','#d4a6c8','#9d7660','#d7b5a6'];
var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var AGGN = {SUM:'Sum',AVG:'Average',CNT:'Count',CNTD:'Count (Distinct)',MIN:'Minimum',MAX:'Maximum',MEDIAN:'Median'};
var AGGO = ['SUM','AVG','CNT','CNTD','MIN','MAX','MEDIAN'];
var AGGALIAS = {SUM:'SUM',AVG:'AVG',AVERAGE:'AVG',COUNT:'CNT',CNT:'CNT',COUNTD:'CNTD',CNTD:'CNTD',COUNT_DISTINCT:'CNTD',MIN:'MIN',MAX:'MAX',MEDIAN:'MEDIAN'};
var PARTS = ['YEAR','QUARTER','MONTH','DAY'];
var PARTN = {YEAR:'Year',QUARTER:'Quarter',MONTH:'Month',DAY:'Day'};
var MARKS = ['auto','bar','line','area','circle','square','text'];
var MARKN = {auto:'Automatic',bar:'Bar',line:'Line',area:'Area',circle:'Circle',square:'Square',text:'Text',shape:'Shape'};
var SHELVES = ['columns','rows','filters','color','size','label','detail'];
var SHELFN = {columns:'Columns',rows:'Rows',filters:'Filters',color:'Color',size:'Size',label:'Label',detail:'Detail'};
var SINGLE = {color:1,size:1};

function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function E(s){ return '<span class="n">'+esc(s)+'</span>'; }
function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
function trunc(s,n){ s = String(s); return s.length > n ? s.slice(0,n-1)+'…' : s; }
function fmt(v){
  if (v === null || v === undefined || isNaN(v)) return '';
  var a = Math.abs(v), d = Number.isInteger(v) ? 0 : a >= 1000 ? 0 : a >= 100 ? 1 : a >= 1 ? 2 : 3;
  var r = Number(v.toFixed(d)); if (r === 0) r = 0;
  return r.toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:d});
}
function fmtTick(v, step){ var d = step >= 1 ? 0 : Math.min(6, Math.ceil(-Math.log10(step))); var r = Number(v.toFixed(d)); if (r === 0) r = 0; return r.toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:d}); }
function fieldLabel(n){ return String(n).replace(/_/g,' '); }

/* ------------------------------------------------------------------ dataset */
var DS = null;
function serial(y,m,d){ return Date.UTC(y,m-1,d)/864e5; }
function buildDS(raw){
  var fields = [], map = Object.create(null), n = raw.n;
  Object.keys(raw.cols).forEach(function(name){
    var c = raw.cols[name], f = {name:name, label:fieldLabel(name)};
    if (c.t === 'c'){ f.kind = 'cat'; f.role = 'dim'; f.codes = c.v; f.dict = c.dict; }
    else if (c.t === 's'){
      f.kind = 'cat'; f.role = 'dim'; var u = {}, i;
      for (i = 0; i < n; i++) u[c.v[i]] = 1;
      f.dict = Object.keys(u).sort(); var m2 = {}; f.dict.forEach(function(s,k){ m2[s] = k; });
      f.codes = new Int32Array(n); for (i = 0; i < n; i++) f.codes[i] = m2[c.v[i]];
    } else if (c.t === 'd'){
      f.kind = 'date'; f.role = 'dim'; f.y = new Int16Array(n); f.m = new Int8Array(n); f.d = new Int8Array(n); f.ser = new Float64Array(n);
      for (var j = 0; j < n; j++){ var s = c.v[j]; f.y[j] = +s.slice(0,4); f.m[j] = +s.slice(5,7); f.d[j] = +s.slice(8,10); f.ser[j] = serial(f.y[j], f.m[j], f.d[j]); }
      f._tr = {};
      f.trunc = function(part){
        if (f._tr[part]) return f._tr[part];
        var t = new Float64Array(n);
        for (var k = 0; k < n; k++){
          t[k] = part === 'YEAR' ? serial(f.y[k],1,1) : part === 'QUARTER' ? serial(f.y[k], Math.floor((f.m[k]-1)/3)*3+1, 1) : part === 'MONTH' ? serial(f.y[k], f.m[k], 1) : f.ser[k];
        }
        return (f._tr[part] = t);
      };
    } else {
      f.kind = 'num'; f.role = 'mea'; f.vals = Float64Array.from(c.v); var lo = Infinity, hi = -Infinity;
      for (var q = 0; q < n; q++){ if (f.vals[q] < lo) lo = f.vals[q]; if (f.vals[q] > hi) hi = f.vals[q]; }
      f.min = lo; f.max = hi;
    }
    fields.push(f); map[name] = f;
  });
  var rec = {name:'Number of Records', label:'Number of Records', kind:'rec', role:'mea', vals:new Float64Array(n).fill(1), min:1, max:1};
  fields.push(rec); map[rec.name] = rec;
  var lower = Object.create(null); fields.forEach(function(f){ lower[f.name.toLowerCase()] = f; lower[f.name.toLowerCase().replace(/ /g,'_')] = f; lower[f.label.toLowerCase()] = f; });
  return {n:n, fields:fields, map:map, lower:lower, rec:rec};
}
function findField(name){ if (!DS || name == null) return null; var k = String(name).trim(); return DS.map[k] || DS.lower[k.toLowerCase()] || DS.lower[k.toLowerCase().replace(/ /g,'_')] || null; }
function loadData(cb){
  if (DS) return cb(DS);
  var go = function(raw){ DS = buildDS(raw); cb(DS); };
  if (window.TF_SCOOP) return go(window.TF_SCOOP);
  if (window.TF && TF.loadScoop) return TF.loadScoop(go);
  var s = document.createElement('script'); s.src = 'tf-scoop.js'; s.onload = function(){ go(window.TF_SCOOP); }; document.head.appendChild(s);
}

/* ------------------------------------------------------------------ pills */
/* pill = {f:fieldName, agg:null|'SUM'|..., part:'YEAR'.. (dates), cont:bool} */
function F(p){ return DS.map[p.f]; }
function isMeasure(p){ return !!p.agg; }
function isDim(p){ return !p.agg; }
function isDate(p){ return !p.agg && F(p).kind === 'date'; }
function isCont(p){ return !!p.agg || !!p.cont; }
function specOf(p){
  var f = F(p);
  if (p.agg) return p.agg+'('+p.f+')';
  if (f.kind === 'date') return p.part+'('+p.f+')'+(p.cont ? ':c' : '');
  if (f.kind === 'num') return 'DIM('+p.f+')'+(p.cont ? ':c' : '');
  return p.f;
}
function labelOf(p){ return specOf(p).replace(/:c$/,'').replace(/_/g,' '); }
function defaultPill(f){
  if (f.kind === 'date') return {f:f.name, agg:null, part:'YEAR', cont:false};
  if (f.kind === 'cat') return {f:f.name, agg:null, cont:false};
  return {f:f.name, agg:'SUM', cont:true};
}
function parseSpec(str){
  var s = String(str).trim(), cont = null, m;
  if ((m = /^(.*):([cd])$/i.exec(s))){ cont = m[2].toLowerCase() === 'c'; s = m[1].trim(); }
  var fn = null, name = s;
  if ((m = /^([A-Za-z_]+)\((.+)\)$/.exec(s))){ fn = m[1].toUpperCase(); name = m[2].trim(); }
  var f = findField(name); if (!f) return null;
  if (fn && AGGALIAS[fn]){
    var a = AGGALIAS[fn];
    if ((f.kind === 'cat' || f.kind === 'date') && a !== 'CNT' && a !== 'CNTD') return null;
    return {f:f.name, agg:a, cont:true};
  }
  if (fn && PARTS.indexOf(fn) >= 0){ if (f.kind !== 'date') return null; return {f:f.name, agg:null, part:fn, cont:cont === true}; }
  if (fn === 'DIM'){ if (f.kind !== 'num') return null; return {f:f.name, agg:null, cont:cont === true}; }
  if (fn) return null;
  var p = defaultPill(f);
  if (cont !== null){
    if (f.kind === 'date') p.cont = cont;
    else if (f.kind === 'num' && cont === false){ p.agg = null; p.cont = false; }
  }
  return p;
}
function samePill(a,b){ return specOf(a) === specOf(b); }
function clonePill(p){ return JSON.parse(JSON.stringify(p)); }

/* date helpers */
function ymdOf(s){ var d = new Date(s*864e5); return {y:d.getUTCFullYear(), m:d.getUTCMonth(), d:d.getUTCDate()}; }
function dateLabel(s, part){
  var o = ymdOf(s);
  if (part === 'YEAR') return String(o.y);
  if (part === 'QUARTER') return 'Q'+(Math.floor(o.m/3)+1)+' '+o.y;
  if (part === 'MONTH') return MON[o.m]+' '+o.y;
  return MON[o.m]+' '+o.d+', '+o.y;
}
function unitDays(part){ return part === 'YEAR' ? 365 : part === 'QUARTER' ? 91 : part === 'MONTH' ? 30.4 : 1; }

/* dimension accessor: code(i) is numeric, label(code) is text */
function dimAcc(p){
  var f = F(p);
  if (f.kind === 'cat') return {code:function(i){ return f.codes[i]; }, label:function(c){ return f.dict[c]; }};
  if (f.kind === 'date'){
    if (p.cont){ var tr = f.trunc(p.part); return {code:function(i){ return tr[i]; }, label:function(c){ return dateLabel(c, p.part); }, date:true}; }
    if (p.part === 'YEAR') return {code:function(i){ return f.y[i]; }, label:String};
    if (p.part === 'QUARTER') return {code:function(i){ return Math.floor((f.m[i]-1)/3)+1; }, label:function(c){ return 'Q'+c; }};
    if (p.part === 'MONTH') return {code:function(i){ return f.m[i]; }, label:function(c){ return MON[c-1]; }};
    return {code:function(i){ return f.d[i]; }, label:String};
  }
  return {code:function(i){ return f.vals[i]; }, label:fmt};
}
function aggregate(p, rows){
  var f = F(p), a = p.agg, n = rows.length, i, v;
  if (a === 'CNT') return n;
  if (a === 'CNTD'){
    var s = new Set();
    for (i = 0; i < n; i++){ var r = rows[i]; s.add(f.kind === 'cat' ? f.codes[r] : f.kind === 'date' ? f.ser[r] : f.kind === 'num' ? f.vals[r] : r); }
    return s.size;
  }
  var vals = f.vals;
  if (a === 'SUM' || a === 'AVG'){ var t = 0; for (i = 0; i < n; i++) t += vals[rows[i]]; return a === 'SUM' ? t : t/n; }
  if (a === 'MIN'){ v = Infinity; for (i = 0; i < n; i++) if (vals[rows[i]] < v) v = vals[rows[i]]; return v; }
  if (a === 'MAX'){ v = -Infinity; for (i = 0; i < n; i++) if (vals[rows[i]] > v) v = vals[rows[i]]; return v; }
  var arr = new Array(n); for (i = 0; i < n; i++) arr[i] = vals[rows[i]];
  arr.sort(function(x,y){ return x-y; });
  var h = n >> 1; return n % 2 ? arr[h] : (arr[h-1]+arr[h])/2;
}

/* ------------------------------------------------------------------ state helpers */
function emptyState(){ return {columns:[], rows:[], filters:[], color:[], size:[], label:[], detail:[], mark:'auto', sort:null, labelsOn:false}; }
function snapshot(S){ return JSON.stringify(S); }
function newFilter(f){
  if (f.kind === 'cat') return {f:f.name, kind:'cat', excl:[]};
  if (f.kind === 'date') return {f:f.name, kind:'date', years:null, from:null, to:null};
  if (f.kind === 'num') return {f:f.name, kind:'num', min:f.min, max:f.max, mode:'all'};
  return null;
}
function filterSpec(fl){ return fl.f; }

/* ------------------------------------------------------------------ compute */
function maskRows(S){
  var n = DS.n, tests = [];
  S.filters.forEach(function(fl){
    var f = DS.map[fl.f];
    if (fl.kind === 'cat'){ if (fl.excl.length){ var ex = new Set(fl.excl); tests.push(function(i){ return !ex.has(f.codes[i]); }); } }
    else if (fl.kind === 'date'){
      if (fl.years){ var ys = new Set(fl.years.map(Number)); tests.push(function(i){ return ys.has(f.y[i]); }); }
      if (fl.from){ var a = Date.parse(fl.from)/864e5; if (!isNaN(a)) tests.push(function(i){ return f.ser[i] >= a; }); }
      if (fl.to){ var b = Date.parse(fl.to)/864e5; if (!isNaN(b)) tests.push(function(i){ return f.ser[i] <= b; }); }
    } else if (fl.kind === 'num' && fl.mode !== 'SUM'){
      var lo = fl.min, hi = fl.max; tests.push(function(i){ var v = f.vals[i]; return v >= lo && v <= hi; });
    }
  });
  var idx = [];
  for (var i = 0; i < n; i++){ var ok = true; for (var t = 0; t < tests.length; t++){ if (!tests[t](i)){ ok = false; break; } } if (ok) idx.push(i); }
  return idx;
}
function allMeasurePills(S){
  var out = [], seen = {};
  ['columns','rows','color','size','label','detail'].forEach(function(sh){ S[sh].forEach(function(p){ if (isMeasure(p) && !seen[specOf(p)]){ seen[specOf(p)] = 1; out.push(p); } }); });
  return out;
}
function firstMeasure(S){
  var order = ['rows','columns','label','size','color','detail'];
  for (var k = 0; k < order.length; k++){ var a = S[order[k]]; for (var j = 0; j < a.length; j++) if (isMeasure(a[j])) return a[j]; }
  return null;
}
function tcls(p){ if (!p) return '-'; if (isMeasure(p)) return 'M'; if (isDate(p) || p.cont) return 'T'; return 'D'; }
function innerOf(info){ if (info.C.length) return info.C[info.C.length-1]; if (info.D.length) return info.D[info.D.length-1]; return null; }
function autoMark(ci, ri){
  var a = tcls(innerOf(ci)), b = tcls(innerOf(ri));
  if (a === '-' && b === '-') return {type:'bar', rule:'empty'};
  if (a === 'M' && b === 'M') return {type:'shape', rule:'two-measures'};
  if (a === 'M' || b === 'M'){
    var o = a === 'M' ? b : a;
    if (o === '-') return {type:'bar', rule:'measure-alone'};
    if (o === 'T') return {type:'line', rule:'date-measure'};
    return {type:'bar', rule:'dim-measure'};
  }
  return {type:'text', rule:'dims-only'};
}
function niceStep(range, target){
  var raw = range/Math.max(1,target), p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw/p;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10)*p;
}
function niceTicks(lo, hi, target){
  var step = niceStep((hi-lo) || 1, target), a = Math.floor(lo/step+1e-9)*step, b = Math.ceil(hi/step-1e-9)*step, t = [];
  for (var v = a; v <= b+step/2; v += step) t.push(Number(v.toFixed(10)));
  return {ticks:t, step:step, lo:a, hi:b};
}
function dateTicks(lo, hi, px){
  var d0 = ymdOf(lo), d1 = ymdOf(hi), m0 = d0.y*12+d0.m, m1 = d1.y*12+d1.m;
  var maxT = Math.max(2, Math.floor(px/70)), steps = [1,2,3,6,12,24,60,120], s = 120, ticks;
  for (var i = 0; i < steps.length; i++){ if ((m1-m0)/steps[i]+1 <= maxT){ s = steps[i]; break; } }
  function mk(step){ var t = []; for (var m = Math.ceil(m0/step)*step; m <= m1; m += step) t.push(Date.UTC(Math.floor(m/12), m%12, 1)/864e5); return t; }
  ticks = mk(s); while (ticks.length < 2 && s > 1){ s = s > 12 ? 12 : s > 6 ? 6 : s > 3 ? 3 : s > 1 ? 1 : 1; ticks = mk(s); if (s === 1) break; }
  ticks = ticks.filter(function(t){ return t >= lo-1e-6 && t <= hi+1e-6; });
  return {ticks:ticks, label:function(v){ var d = ymdOf(v); return s >= 12 ? String(d.y) : MON[d.m]+' '+d.y; }};
}

function compute(S){
  var V = {empty:false, notes:{}};
  var idx = maskRows(S); V.nrows = idx.length;
  var lod = [], li = {};
  function addDim(p){ if (!isDim(p)) return; var sg = specOf(p); if (li[sg] === undefined){ li[sg] = lod.length; lod.push(p); } }
  ['columns','rows','color','size','label','detail'].forEach(function(sh){ S[sh].forEach(addDim); });
  var accs = lod.map(dimAcc), L = lod.length;
  V.lod = lod; V.li = li; V.accs = accs;
  var groups = [], gmap = Object.create(null), cs = new Array(L), k, j;
  for (k = 0; k < idx.length; k++){
    var r = idx[k], key = '';
    for (j = 0; j < L; j++){ var c = accs[j].code(r); cs[j] = c; key += c+'|'; }
    var g = gmap[key];
    if (!g){ g = {codes:cs.slice(), rows:[], m:{}}; gmap[key] = g; groups.push(g); }
    g.rows.push(r);
  }
  var mps = allMeasurePills(S); V.mps = mps;
  groups.forEach(function(g){ mps.forEach(function(p){ g.m[specOf(p)] = aggregate(p, g.rows); }); });
  /* aggregated filters (Sum of the field per mark) */
  S.filters.forEach(function(fl){
    if (fl.kind === 'num' && fl.mode === 'SUM'){
      var p = {f:fl.f, agg:'SUM', cont:true};
      groups = groups.filter(function(g){ var v = aggregate(p, g.rows); return v >= fl.min && v <= fl.max; });
    }
  });
  V.groups = groups;
  V.lab = function(p, code){ return accs[li[specOf(p)]].label(code); };

  /* sort set-up */
  var sort = null;
  if (S.sort){
    var mp = firstMeasure(S);
    var cD = S.columns.filter(function(p){ return !isCont(p); }), rD = S.rows.filter(function(p){ return !isCont(p); });
    var colM = S.columns.some(isMeasure), rowM = S.rows.some(isMeasure), shelf = null;
    if (rD.length && colM) shelf = 'rows'; else if (cD.length && rowM) shelf = 'columns'; else if (cD.length) shelf = 'columns'; else if (rD.length) shelf = 'rows';
    if (mp && shelf){
      var Dl = shelf === 'columns' ? cD : rD, pos = -1, q;
      for (q = Dl.length-1; q >= 0; q--) if (!isDate(Dl[q])){ pos = q; break; }
      if (pos < 0) pos = Dl.length-1;
      var acc = {};
      groups.forEach(function(g){
        var kk = Dl.slice(0,pos+1).map(function(p){ return g.codes[li[specOf(p)]]; }).join('|');
        (acc[kk] = acc[kk] || []).push(g.rows);
      });
      var vals = {};
      Object.keys(acc).forEach(function(kk){ var all = []; acc[kk].forEach(function(a){ for (var z = 0; z < a.length; z++) all.push(a[z]); }); vals[kk] = aggregate(mp, all); });
      sort = {shelf:shelf, pos:pos, dir:S.sort, vals:vals, mp:mp};
    }
  }
  V.sortApplied = sort ? {shelf:sort.shelf, dir:sort.dir, by:specOf(sort.mp), pill:specOf((sort.shelf === 'columns' ? S.columns : S.rows).filter(function(p){ return !isCont(p); })[sort.pos])} : null;

  function buildInfo(pills, shelfName){
    var D = [], C = [];
    pills.forEach(function(p){ (isCont(p) ? C : D).push(p); });
    var tuples = [], seen = Object.create(null);
    groups.forEach(function(g){ var t = D.map(function(p){ return g.codes[li[specOf(p)]]; }), kk = t.join('|'); if (!seen[kk]){ seen[kk] = 1; tuples.push(t); } });
    if (!D.length) tuples = [[]];
    tuples.sort(function(a,b){
      for (var i = 0; i < a.length; i++){
        if (a[i] !== b[i]){
          if (sort && sort.shelf === shelfName && i === sort.pos){
            var ka = sort.vals[a.slice(0,i+1).join('|')], kb = sort.vals[b.slice(0,i+1).join('|')];
            if (ka !== kb) return sort.dir === 'asc' ? ka-kb : kb-ka;
          }
          return a[i]-b[i];
        }
      }
      return 0;
    });
    var slots = [];
    tuples.forEach(function(t){
      var kk = t.join('|');
      if (C.length) C.forEach(function(c, ci){ slots.push({t:t, k:kk, axis:c, aid:shelfName+':'+ci}); });
      else slots.push({t:t, k:kk, axis:null, aid:null});
    });
    return {D:D, C:C, tuples:tuples, slots:slots};
  }
  var cols = V.cols = buildInfo(S.columns, 'columns'), rows = V.rows = buildInfo(S.rows, 'rows');
  var cmap = Object.create(null);
  groups.forEach(function(g){
    g.ck = cols.D.map(function(p){ return g.codes[li[specOf(p)]]; }).join('|');
    g.rk = rows.D.map(function(p){ return g.codes[li[specOf(p)]]; }).join('|');
    var kk = g.ck+'#'+g.rk; (cmap[kk] = cmap[kk] || []).push(g);
  });
  /* mark type */
  var am = autoMark(cols, rows);
  V.auto = am;
  V.mark = S.mark === 'auto' ? am.type : S.mark;
  V.markRule = S.mark === 'auto' ? am.rule : 'manual';
  /* color / size */
  V.color = null;
  if (S.color.length){
    var cp = S.color[0], cid = specOf(cp);
    if (isDim(cp) && !cp.cont){
      var mem = {}, arr = [], cix = li[cid];
      groups.forEach(function(g){ var c = g.codes[cix]; if (mem[c] === undefined){ mem[c] = 0; arr.push(c); } });
      arr.sort(function(a,b){ return a-b; }); arr.forEach(function(c,i){ mem[c] = i; });
      V.color = {kind:'cat', p:cp, idx:cix, map:mem, members:arr, pal:arr.length > 10 ? PAL20 : PAL10};
    } else {
      var getv = isMeasure(cp) ? function(g){ return g.m[cid]; } : function(g){ return g.codes[li[cid]]; }, lo = Infinity, hi = -Infinity;
      groups.forEach(function(g){ var v = getv(g); if (v < lo) lo = v; if (v > hi) hi = v; });
      V.color = {kind:'num', p:cp, get:getv, lo:lo, hi:hi};
    }
  }
  V.size = null;
  if (S.size.length){
    var sp = S.size[0], sid = specOf(sp);
    if (isMeasure(sp)){
      var slo = Infinity, shi = -Infinity; groups.forEach(function(g){ var v = g.m[sid]; if (v < slo) slo = v; if (v > shi) shi = v; });
      V.size = {kind:'num', get:function(g){ return shi === slo ? .5 : (g.m[sid]-slo)/(shi-slo); }, lo:slo, hi:shi, p:sp};
    } else {
      var smem = {}, sarr = [], six = li[sid]; groups.forEach(function(g){ var c = g.codes[six]; if (smem[c] === undefined){ smem[c] = 0; sarr.push(c); } });
      sarr.sort(function(a,b){ return a-b; }); sarr.forEach(function(c,i){ smem[c] = i; });
      V.size = {kind:'cat', get:function(g){ return sarr.length < 2 ? .5 : smem[g.codes[six]]/(sarr.length-1); }, p:sp};
    }
  }
  /* cells */
  var cells = [], nC = cols.slots.length, nR = rows.slots.length, total = 0;
  for (var ri = 0; ri < nR; ri++){
    for (var ci = 0; ci < nC; ci++){
      var cs2 = cols.slots[ci], rs2 = rows.slots[ri], list = cmap[cs2.k+'#'+rs2.k] || [];
      var cell = {ci:ci, ri:ri, cs:cs2, rs:rs2, marks:[]};
      cell.xs = cs2.axis ? (isMeasure(cs2.axis) ? 'M' : 'T') : 'C';
      cell.ys = rs2.axis ? (isMeasure(rs2.axis) ? 'M' : 'T') : 'C';
      list.forEach(function(g){
        var m = {g:g, cell:cell};
        if (cell.xs === 'M') m.xv = g.m[specOf(cs2.axis)]; else if (cell.xs === 'T') m.xv = g.codes[li[specOf(cs2.axis)]];
        if (cell.ys === 'M') m.yv = g.m[specOf(rs2.axis)]; else if (cell.ys === 'T') m.yv = g.codes[li[specOf(rs2.axis)]];
        cell.marks.push(m);
      });
      total += cell.marks.length;
      cells.push(cell);
    }
  }
  V.cells = cells; V.nMarks = total;
  /* stacking for bar and area */
  var ccix = V.color && V.color.kind === 'cat' ? V.color.idx : -1;
  cells.forEach(function(cell){
    var vert = cell.ys === 'M' && cell.xs !== 'M', horiz = cell.xs === 'M' && cell.ys !== 'M';
    cell.orient = vert ? 'v' : horiz ? 'h' : (cell.xs === 'M' && cell.ys === 'M') ? 's' : 'n';
    if ((V.mark === 'bar' || V.mark === 'area') && (vert || horiz)){
      var groupsBy = {};
      cell.marks.forEach(function(m){ var pk = vert ? (cell.xs === 'T' ? m.xv : 0) : (cell.ys === 'T' ? m.yv : 0); (groupsBy[pk] = groupsBy[pk] || []).push(m); });
      Object.keys(groupsBy).forEach(function(pk){
        var arr = groupsBy[pk];
        arr.sort(function(a,b){ if (ccix >= 0 && a.g.codes[ccix] !== b.g.codes[ccix]) return a.g.codes[ccix]-b.g.codes[ccix]; for (var z = 0; z < a.g.codes.length; z++) if (a.g.codes[z] !== b.g.codes[z]) return a.g.codes[z]-b.g.codes[z]; return 0; });
        var pos = 0, neg = 0;
        arr.forEach(function(m){
          var v = vert ? m.yv : m.xv;
          if (v >= 0){ m.s0 = pos; pos += v; m.s1 = pos; } else { m.s0 = neg; neg += v; m.s1 = neg; }
        });
        if (arr.length > 1) V.notes.stacked = true;
      });
    } else if (V.mark === 'bar' || V.mark === 'area'){
      cell.marks.forEach(function(m){ var v = cell.ys === 'M' ? m.yv : m.xv; if (v === undefined) return; m.s0 = 0; m.s1 = v; });
    }
  });
  V.empty = !(S.columns.length || S.rows.length || S.color.length || S.size.length || S.label.length || S.detail.length);
  return V;
}

/* ------------------------------------------------------------------ marks/tooltips text */
function markTip(V, g){
  if (g._tip) return g._tip;
  var parts = [];
  V.lod.forEach(function(p, i){ parts.push(labelOf(p)+': '+V.accs[i].label(g.codes[i])); });
  V.mps.forEach(function(p){ parts.push(labelOf(p)+': '+fmt(g.m[specOf(p)])); });
  return (g._tip = parts.join('\n'));
}
function labelText(V, S, m, cell){
  var g = m.g, out = [];
  S.label.forEach(function(p){
    if (isMeasure(p)) out.push(fmt(g.m[specOf(p)]));
    else out.push(V.accs[V.li[specOf(p)]].label(g.codes[V.li[specOf(p)]]));
  });
  if (out.length) return out.join(' ');
  if (!S.labelsOn) return '';
  if (cell.xs === 'M' && cell.ys === 'M') return fmt(m.xv)+', '+fmt(m.yv);
  if (cell.ys === 'M') return fmt(m.yv);
  if (cell.xs === 'M') return fmt(m.xv);
  return '';
}
function colorOf(V, g, text){
  var c = V.color;
  if (!c) return PAL10[0];
  if (c.kind === 'cat') return c.pal[c.map[g.codes[c.idx]] % c.pal.length];
  return gradient(c, c.get(g), text);
}
function mix(a, b, t){ return [Math.round(a[0]+(b[0]-a[0])*t), Math.round(a[1]+(b[1]-a[1])*t), Math.round(a[2]+(b[2]-a[2])*t)]; }
function gradient(c, v, text){
  var t = c.hi === c.lo ? .5 : (v-c.lo)/(c.hi-c.lo), rgb;
  if (text){
    rgb = c.lo < 0 && c.hi > 0 ? (t < .5 ? mix([196,86,0],[90,90,90], t*2) : mix([90,90,90],[20,80,150], (t-.5)*2)) : mix([95,145,205],[8,51,110], t);
  } else if (c.lo < 0 && c.hi > 0){
    rgb = t < .5 ? mix([242,142,43],[247,247,247], t*2) : mix([247,247,247],[78,121,167], (t-.5)*2);
  } else rgb = mix([222,235,247],[8,81,156], t);
  return 'rgb('+rgb.join(',')+')';
}
function gradientCss(c){
  return c.lo < 0 && c.hi > 0 ? 'linear-gradient(90deg,#f28e2b,#f7f7f7,#4e79a7)' : 'linear-gradient(90deg,#deebf7,#08519c)';
}

/* ------------------------------------------------------------------ SVG chart */
function drawChart(V, S, W){
  if (V.empty || !V.cols.slots.length || !V.rows.slots.length || !V.nrows){
    return {svg:'', legend:'', svgW:0, svgH:0, scales:{}};
  }
  var cols = V.cols, rows = V.rows, cs = cols.slots, rs = rows.slots, nC = cs.length, nR = rs.length;
  var colAx = cs.some(function(s){ return s.axis; }), rowAx = rs.some(function(s){ return s.axis; });
  var mark = V.mark, textTable = !colAx && !rowAx && mark === 'text';
  var many = nC > 120 || nR > 120;
  /* header geometry */
  var rowLevW = rows.D.map(function(p, li){ var mx = 0; rows.tuples.forEach(function(t){ mx = Math.max(mx, trunc(V.lab(p, t[li]), 18).length); }); return clamp(mx*6.3+14, 34, 124); });
  var rowHeadW = rowLevW.reduce(function(a,b){ return a+b; }, 0);
  var colLev = cols.D.length, hdrBottom = !colAx && rowAx, hdrH = 22;
  /* axis estimates: value ranges before pixel size is known */
  var axMax = {};
  V.cells.forEach(function(cell){
    cell.marks.forEach(function(m){
      [['x',cell.cs.axis,cell.xs],['y',cell.rs.axis,cell.ys]].forEach(function(a){
        var ax = a[1]; if (!ax) return; var id = (a[0] === 'x' ? cell.cs.aid : cell.rs.aid);
        var vv = a[0] === 'x' ? m.xv : m.yv, lo = vv, hi = vv;
        if (m.s0 !== undefined && ((a[0] === 'y' && cell.orient === 'v') || (a[0] === 'x' && cell.orient === 'h'))){ lo = Math.min(m.s0, m.s1); hi = Math.max(m.s0, m.s1); }
        var o = axMax[id] || (axMax[id] = {lo:Infinity, hi:-Infinity, kind:a[2], p:ax});
        if (lo < o.lo) o.lo = lo; if (hi > o.hi) o.hi = hi;
      });
    });
  });
  var rowAxisW = 0;
  rs.forEach(function(s){ if (s.axis){ var o = axMax[s.aid]; var w = o ? (o.kind === 'T' && F(s.axis).kind === 'date' ? 58 : Math.max(fmt(o.hi).length, fmt(o.lo).length)*6.4+14) : 40; rowAxisW = Math.max(rowAxisW, w); } });
  if (rowAx) rowAxisW += 22;
  var rotate = false, rotExtra = 0;
  var innerCol = cols.D[cols.D.length-1], cellWmin = textTable ? 70 : colAx ? 110 : many ? 0.5 : 34;
  var left = rowHeadW+rowAxisW+8, right = colAx ? 24 : 12;
  var availW = Math.max(260, W-left-right);
  var cellW = Math.max(cellWmin, availW/nC);
  if (nC > 120) cellW = Math.max(0.5, availW/nC);
  var plotW = cellW*nC, svgW = left+plotW+right;
  if (innerCol && nC <= 120){
    var mxl = 0; cols.tuples.forEach(function(t){ mxl = Math.max(mxl, trunc(V.lab(innerCol, t[t.length-1]), 16).length); });
    if (cellW < mxl*6.3+8){ rotate = true; rotExtra = Math.min(70, mxl*4.6+8); }
  }
  var showColLabels = nC <= 120 || cellW >= 14;
  var topM = 6+(hdrBottom ? 0 : colLev*hdrH+(rotate ? rotExtra : 0));
  var botAx = colAx ? 40 : 0;
  var botM = 6+botAx+(hdrBottom ? colLev*hdrH+(rotate ? rotExtra : 0) : 0);
  /* row heights */
  var nAxisRows = rs.filter(function(s){ return s.axis; }).length, rowH;
  if (nAxisRows) rowH = clamp(420/nAxisRows, 110, 300);
  else if (textTable) rowH = 28;
  else rowH = nR > 60 ? Math.max(0.8, 2400/nR) : clamp(300/nR, 22, 46);
  var plotH = rowH*nR, svgH = topM+plotH+botM;
  var pad = 7;
  /* scales */
  var scales = {};
  function mkScale(id, size){
    var o = axMax[id]; if (!o) return null;
    var lo = o.lo, hi = o.hi, isDateAx = o.kind === 'T' && F(o.p).kind === 'date', isBarish = mark === 'bar' || mark === 'area';
    var isValueAxis = o.kind === 'M';
    if (isValueAxis){
      if (isBarish){ lo = Math.min(lo, 0); hi = Math.max(hi, 0); }
      else if (lo >= 0 && lo < hi*0.6) lo = 0;
      if (lo === hi){ if (lo === 0) hi = 1; else { var d = Math.abs(lo)*.1; lo -= d; hi += d; } }
      var nt = niceTicks(lo, hi, clamp(Math.round(size/55), 3, 9));
      return (scales[id] = {lo:nt.lo, hi:nt.hi, ticks:nt.ticks, fmt:function(v){ return fmtTick(v, nt.step); }, kind:'M'});
    }
    if (isDateAx){
      var span = hi-lo, padd = span ? span*.04 : 30;
      if (mark === 'bar') padd = Math.max(padd, unitDays(o.p.part)*.6);
      lo -= padd; hi += padd;
      var dt = dateTicks(lo, hi, size);
      return (scales[id] = {lo:lo, hi:hi, ticks:dt.ticks, fmt:dt.label, kind:'D', part:o.p.part});
    }
    var sp = hi-lo || 1; lo -= sp*.05; hi += sp*.05;
    var nn = niceTicks(lo, hi, clamp(Math.round(size/60), 2, 8));
    return (scales[id] = {lo:Math.min(lo, nn.lo), hi:Math.max(hi, nn.hi), ticks:nn.ticks.filter(function(t){ return t >= lo && t <= hi; }), fmt:function(v){ return fmtTick(v, nn.step); }, kind:'N'});
  }
  cs.forEach(function(s){ if (s.axis && !scales[s.aid]) mkScale(s.aid, cellW-2*pad); });
  rs.forEach(function(s){ if (s.axis && !scales[s.aid]) mkScale(s.aid, rowH-2*pad); });
  /* helpers: pixel mapping */
  function X(cell, v){ var x0 = left+cell.ci*cellW; if (cell.xs === 'C') return x0+cellW/2; var sc = scales[cell.cs.aid]; return x0+pad+(v-sc.lo)/(sc.hi-sc.lo)*(cellW-2*pad); }
  function Y(cell, v){ var y0 = topM+cell.ri*rowH; if (cell.ys === 'C') return y0+rowH/2; var sc = scales[cell.rs.aid]; return y0+rowH-pad-(v-sc.lo)/(sc.hi-sc.lo)*(rowH-2*pad); }
  var out = [];
  var bg = '#fff';
  /* pane backgrounds + grid */
  var drawBorders = nC*nR <= 4000;
  if (drawBorders){
    for (var ri = 0; ri < nR; ri++) for (var ci = 0; ci < nC; ci++){
      out.push('<rect x="'+(left+ci*cellW).toFixed(1)+'" y="'+(topM+ri*rowH).toFixed(1)+'" width="'+cellW.toFixed(1)+'" height="'+rowH.toFixed(1)+'" fill="'+bg+'" stroke="#e2e8f0" stroke-width="1"/>');
    }
  } else out.push('<rect x="'+left+'" y="'+topM+'" width="'+plotW+'" height="'+plotH+'" fill="#fff" stroke="#e2e8f0"/>');
  /* grid lines */
  for (var gi = 0; gi < nR; gi++){
    var rsl = rs[gi]; if (!rsl.axis || !scales[rsl.aid]) continue; var sc = scales[rsl.aid];
    sc.ticks.forEach(function(t){
      var yy = topM+gi*rowH+rowH-pad-(t-sc.lo)/(sc.hi-sc.lo)*(rowH-2*pad);
      out.push('<line x1="'+left+'" x2="'+(left+plotW)+'" y1="'+yy.toFixed(1)+'" y2="'+yy.toFixed(1)+'" stroke="'+(t === 0 ? '#94a3b8' : '#eef2f7')+'"/>');
    });
  }
  for (var gj = 0; gj < nC; gj++){
    var csl = cs[gj]; if (!csl.axis || !scales[csl.aid]) continue; var scx = scales[csl.aid];
    scx.ticks.forEach(function(t){
      var xx = left+gj*cellW+pad+(t-scx.lo)/(scx.hi-scx.lo)*(cellW-2*pad);
      out.push('<line y1="'+topM+'" y2="'+(topM+plotH)+'" x1="'+xx.toFixed(1)+'" x2="'+xx.toFixed(1)+'" stroke="'+(t === 0 && scx.kind === 'M' ? '#94a3b8' : '#eef2f7')+'"/>');
    });
  }
  /* marks */
  var many2 = V.nMarks > 700, lines = {}, lineOrder = [];
  var labelsOut = [];
  function sizeFactor(g){ return V.size ? V.size.get(g) : null; }
  V.cells.forEach(function(cell){
    cell.marks.forEach(function(m){
      var g = m.g, col = colorOf(V, g), tip = '<title>'+esc(markTip(V, g))+'</title>', st = sizeFactor(g);
      var cx = cell.xs === 'M' || cell.xs === 'T' ? X(cell, m.xv) : X(cell), cy = cell.ys === 'M' || cell.ys === 'T' ? Y(cell, m.yv) : Y(cell);
      m.px = cx; m.py = cy;
      if (mark === 'bar'){
        var bw;
        if (cell.orient === 'v' || cell.orient === 'h'){
          var catPos = cell.orient === 'v' ? cell.xs === 'C' : cell.ys === 'C';
          var unit = cell.orient === 'v' ? cellW : rowH;
          if (catPos) bw = Math.min(unit*.72, 130)*(st === null ? 1 : .35+.65*st);
          else {
            var psc = scales[cell.orient === 'v' ? cell.cs.aid : cell.rs.aid], pp = cell.orient === 'v' ? cell.cs.axis : cell.rs.axis;
            var pxPer = (unit-2*pad)/(psc.hi-psc.lo);
            bw = psc.kind === 'D' ? Math.max(1, unitDays(pp.part)*pxPer*.85) : 8;
            if (st !== null) bw *= .4+.6*st;
          }
          bw = Math.max(bw, 1.2);
          if (cell.orient === 'v'){
            var ya = Y(cell, m.s0), yb = Y(cell, m.s1), yt = Math.min(ya, yb), hh = Math.max(0.8, Math.abs(ya-yb));
            out.push('<rect class="mk" x="'+(cx-bw/2).toFixed(1)+'" y="'+yt.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+hh.toFixed(1)+'" fill="'+col+'">'+tip+'</rect>');
            m.lx = cx; m.ly = m.s1 >= m.s0 ? yt-3 : yt+hh+11;
            if (V.notes.stacked){ m.ly = yt+hh/2+4; if (hh < 14) m.skipLabel = true; }
          } else {
            var xa = X(cell, m.s0), xb = X(cell, m.s1), xl = Math.min(xa, xb), ww = Math.max(0.8, Math.abs(xa-xb));
            out.push('<rect class="mk" x="'+xl.toFixed(1)+'" y="'+(cy-bw/2).toFixed(1)+'" width="'+ww.toFixed(1)+'" height="'+bw.toFixed(1)+'" fill="'+col+'">'+tip+'</rect>');
            m.lx = xl+ww+4; m.ly = cy+4; m.left = true;
            if (V.notes.stacked){ m.lx = xl+ww/2; m.left = false; if (ww < 34) m.skipLabel = true; }
          }
        } else if (cell.orient === 's'){
          var y0b = Y(cell, Math.max(scales[cell.rs.aid].lo, Math.min(0, scales[cell.rs.aid].hi)));
          out.push('<rect class="mk" x="'+(cx-4).toFixed(1)+'" y="'+Math.min(cy, y0b).toFixed(1)+'" width="8" height="'+Math.max(1, Math.abs(y0b-cy)).toFixed(1)+'" fill="'+col+'">'+tip+'</rect>');
          m.lx = cx; m.ly = cy-5;
        } else {
          var sq = Math.min(cellW, rowH)*.7*(st === null ? 1 : .35+.65*st); sq = clamp(sq, 3, 60);
          out.push('<rect class="mk" x="'+(cx-sq/2).toFixed(1)+'" y="'+(cy-sq/2).toFixed(1)+'" width="'+sq.toFixed(1)+'" height="'+sq.toFixed(1)+'" fill="'+col+'">'+tip+'</rect>');
          m.lx = cx; m.ly = cy+4;
        }
      } else if (mark === 'circle' || mark === 'shape' || mark === 'square'){
        var r = st === null ? 5 : 3+9*Math.sqrt(st); if (many2 && st === null) r = 3;
        if (mark === 'square') out.push('<rect class="mk" x="'+(cx-r).toFixed(1)+'" y="'+(cy-r).toFixed(1)+'" width="'+(2*r).toFixed(1)+'" height="'+(2*r).toFixed(1)+'" fill="'+col+'" fill-opacity=".9">'+tip+'</rect>');
        else if (mark === 'shape') out.push('<circle class="mk" cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="'+r.toFixed(1)+'" fill="#fff" fill-opacity=".01" stroke="'+col+'" stroke-width="1.8">'+tip+'</circle>');
        else out.push('<circle class="mk" cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" r="'+r.toFixed(1)+'" fill="'+col+'" fill-opacity=".85">'+tip+'</circle>');
        m.lx = cx+r+3; m.ly = cy+4; m.left = true;
      } else if (mark === 'text'){
        var txt = labelText(V, S, m, cell) || 'Abc';
        if (txt === 'Abc' && !S.label.length && !S.labelsOn) txt = 'Abc';
        var fs = st === null ? 12 : 10+7*st;
        out.push('<text class="mk tx" x="'+cx.toFixed(1)+'" y="'+cy.toFixed(1)+'" font-size="'+fs.toFixed(1)+'" text-anchor="middle" dominant-baseline="central" fill="'+(V.color ? colorOf(V, g, true) : '#1f2937')+'">'+esc(txt)+tip+'</text>');
        m.noLabel = true;
      } else if (mark === 'line' || mark === 'area'){
        var vert = cell.orient === 'v', horiz = cell.orient === 'h', pos, skey;
        var seriesCodes = g.codes.slice();
        if (vert || horiz){
          var posShelf = vert ? cols : rows, slot = vert ? cell.cs : cell.rs;
          if (slot.axis){ seriesCodes[V.li[specOf(slot.axis)]] = '*'; skey = slot.k+'@'+slot.aid; pos = vert ? m.xv : m.yv; }
          else {
            var leaf = posShelf.D[posShelf.D.length-1];
            if (leaf) seriesCodes[V.li[specOf(leaf)]] = '*';
            skey = slot.t.slice(0,-1).join('|'); pos = vert ? cell.ci : cell.ri;
          }
          skey = (vert ? 'r'+cell.ri+'/'+cell.cs.aid : 'c'+cell.ci+'/'+cell.rs.aid)+'/'+skey;
        } else if (cell.orient === 's'){ pos = m.xv; seriesCodes = [V.color && V.color.kind === 'cat' ? g.codes[V.color.idx] : 0]; skey = 'c'+cell.ci+'r'+cell.ri; }
        else { pos = cell.ci; skey = 'c'+cell.ri; }
        skey += '/'+seriesCodes.join(',');
        var ln = lines[skey];
        if (!ln){ ln = lines[skey] = {pts:[], col:col, vert:vert, horiz:horiz}; lineOrder.push(skey); }
        var ptx = cx, pty = cy;
        if (mark === 'area' && m.s1 !== undefined){ if (vert) pty = Y(cell, m.s1); else if (horiz) ptx = X(cell, m.s1); }
        ln.pts.push({pos:pos, x:ptx, y:pty, m:m, tip:tip, y0:(m.s0 !== undefined ? (vert ? Y(cell, m.s0) : null) : null), x0:(m.s0 !== undefined && horiz ? X(cell, m.s0) : null), cell:cell});
        m.lx = cx; m.ly = cy-6;
      }
      if (!m.noLabel && !m.skipLabel && !many2){
        var lt = labelText(V, S, m, cell);
        if (lt) labelsOut.push('<text class="lbl" x="'+(m.lx).toFixed(1)+'" y="'+(m.ly).toFixed(1)+'" text-anchor="'+(m.left ? 'start' : 'middle')+'" fill="#1e293b">'+esc(lt)+'</text>');
      }
    });
  });
  lineOrder.forEach(function(k){
    var ln = lines[k], pts = ln.pts.sort(function(a,b){ return a.pos-b.pos; });
    if (mark === 'line'){
      if (pts.length > 1) out.push('<path class="ln" d="'+pts.map(function(p,i){ return (i ? 'L' : 'M')+p.x.toFixed(1)+' '+p.y.toFixed(1); }).join('')+'" fill="none" stroke="'+ln.col+'" stroke-width="2" stroke-linejoin="round"/>');
      if (pts.length <= 50) pts.forEach(function(p){ out.push('<circle class="mk" cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="'+(pts.length === 1 ? 4 : 2.6)+'" fill="'+ln.col+'">'+p.tip+'</circle>'); });
      else out.push('<g>'+pts.filter(function(p,i){ return i % 4 === 0; }).map(function(p){ return '<circle class="mk" cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="2" fill="'+ln.col+'">'+p.tip+'</circle>'; }).join('')+'</g>');
    } else {
      /* area: polygon between stacked start and end */
      if (pts.length === 1){ out.push('<circle class="mk" cx="'+pts[0].x.toFixed(1)+'" cy="'+pts[0].y.toFixed(1)+'" r="4" fill="'+ln.col+'">'+pts[0].tip+'</circle>'); return; }
      var top = pts.map(function(p){ return p.x.toFixed(1)+','+p.y.toFixed(1); });
      var bot = pts.slice().reverse().map(function(p){ var c = p.cell; var by = ln.vert ? (p.y0 !== null ? p.y0 : Y(c, 0)) : p.y, bx = ln.horiz ? (p.x0 !== null ? p.x0 : X(c, 0)) : p.x; return bx.toFixed(1)+','+by.toFixed(1); });
      out.push('<polygon class="mk" points="'+top.concat(bot).join(' ')+'" fill="'+ln.col+'" fill-opacity=".8" stroke="'+ln.col+'" stroke-width="1.2">'+pts[0].tip+'</polygon>');
    }
  });
  out.push(labelsOut.join(''));
  /* axes: row axes (left) */
  var ax = [];
  for (var ai = 0; ai < nR; ai++){
    var rsl2 = rs[ai]; if (!rsl2.axis || !scales[rsl2.aid]) continue; var sy = scales[rsl2.aid], y0 = topM+ai*rowH;
    sy.ticks.forEach(function(t){
      var yy = y0+rowH-pad-(t-sy.lo)/(sy.hi-sy.lo)*(rowH-2*pad);
      ax.push('<text class="tk" x="'+(left-5)+'" y="'+(yy+3.5).toFixed(1)+'" text-anchor="end">'+esc(sy.fmt(t))+'</text>');
      ax.push('<line x1="'+(left-3)+'" x2="'+left+'" y1="'+yy.toFixed(1)+'" y2="'+yy.toFixed(1)+'" stroke="#94a3b8"/>');
    });
    var tcx = rowHeadW+16;
    ax.push('<text class="at" transform="translate('+tcx+' '+(y0+rowH/2)+') rotate(-90)" text-anchor="middle">'+esc(trunc(labelOf(rsl2.axis), Math.max(8, Math.floor(rowH/6.5))))+'</text>');
  }
  for (var aj = 0; aj < nC; aj++){
    var csl2 = cs[aj]; if (!csl2.axis || !scales[csl2.aid]) continue; var sx = scales[csl2.aid], x0 = left+aj*cellW, yb = topM+plotH;
    sx.ticks.forEach(function(t){
      var xx = x0+pad+(t-sx.lo)/(sx.hi-sx.lo)*(cellW-2*pad);
      ax.push('<line x1="'+xx.toFixed(1)+'" x2="'+xx.toFixed(1)+'" y1="'+yb+'" y2="'+(yb+3)+'" stroke="#94a3b8"/>');
      ax.push('<text class="tk" x="'+xx.toFixed(1)+'" y="'+(yb+15)+'" text-anchor="middle">'+esc(sx.fmt(t))+'</text>');
    });
    ax.push('<text class="at" x="'+(x0+cellW/2).toFixed(1)+'" y="'+(yb+33)+'" text-anchor="middle">'+esc(trunc(labelOf(csl2.axis), Math.max(8, Math.floor(cellW/6.5))))+'</text>');
  }
  out.push(ax.join(''));
  /* headers */
  var hd = [];
  function spans(info, nSlots, level){
    var res = [], i = 0;
    while (i < nSlots){
      var key = info.slots[i].t.slice(0, level+1).join('|'), j = i;
      while (j+1 < nSlots && info.slots[j+1].t.slice(0, level+1).join('|') === key) j++;
      res.push({a:i, b:j, code:info.slots[i].t[level]});
      i = j+1;
    }
    return res;
  }
  cols.D.forEach(function(p, lv){
    var sp = spans(cols, nC, lv), last = lv === cols.D.length-1;
    var yh = hdrBottom ? topM+plotH+botAx+lv*hdrH : 6+lv*hdrH;
    if (hdrBottom === false && rotate && last) { /* rotated top labels sit above */ }
    sp.forEach(function(s){
      var x = left+s.a*cellW, w = (s.b-s.a+1)*cellW, txt = V.lab(p, s.code);
      var cy2 = hdrBottom ? yh+hdrH/2 : yh+hdrH/2;
      if (last && rotate){
        var yy2 = hdrBottom ? topM+plotH+botAx+lv*hdrH+8 : topM-6;
        if (showColLabels) hd.push('<text class="hd" transform="translate('+(x+w/2+3).toFixed(1)+' '+yy2+') rotate('+(hdrBottom ? 40 : -40)+')" text-anchor="'+(hdrBottom ? 'start' : 'start')+'">'+esc(trunc(txt,16))+'<title>'+esc(txt)+'</title></text>');
      } else {
        hd.push('<rect x="'+x.toFixed(1)+'" y="'+yh+'" width="'+w.toFixed(1)+'" height="'+hdrH+'" fill="#f1f5f9" stroke="#e2e8f0"/>');
        if (showColLabels || !last) hd.push('<text class="hd" x="'+(x+w/2).toFixed(1)+'" y="'+(cy2+4)+'" text-anchor="middle">'+esc(trunc(txt, Math.max(3, Math.floor(w/6.4))))+'<title>'+esc(txt)+'</title></text>');
      }
    });
  });
  rows.D.forEach(function(p, lv){
    var sp = spans(rows, nR, lv), x = 4;
    for (var q = 0; q < lv; q++) x += rowLevW[q];
    sp.forEach(function(s){
      var y = topM+s.a*rowH, h = (s.b-s.a+1)*rowH, txt = V.lab(p, s.code);
      if (nR <= 400) hd.push('<rect x="'+x+'" y="'+y.toFixed(1)+'" width="'+rowLevW[lv]+'" height="'+h.toFixed(1)+'" fill="#f1f5f9" stroke="#e2e8f0"/>');
      if (h >= 11) hd.push('<text class="hd" x="'+(x+6)+'" y="'+(y+h/2+4).toFixed(1)+'" text-anchor="start">'+esc(trunc(txt, Math.floor((rowLevW[lv]-10)/6.2)))+'<title>'+esc(txt)+'</title></text>');
    });
  });
  out.push(hd.join(''));
  var svg = '<svg class="tfp-svg" xmlns="http://www.w3.org/2000/svg" width="'+Math.ceil(svgW)+'" height="'+Math.ceil(svgH)+'" viewBox="0 0 '+Math.ceil(svgW)+' '+Math.ceil(svgH)+'" role="img" aria-label="'+esc('הגרף שנבנה: '+MARKN[mark]+', '+V.nMarks+' סימנים')+'">'+out.join('')+'</svg>';
  /* legend */
  var lg = '';
  if (V.color){
    var c = V.color;
    if (c.kind === 'cat'){
      lg += '<div class="tfp-lg"><b>'+esc(labelOf(c.p))+'</b>'+c.members.slice(0, 40).map(function(code){ return '<span><i style="background:'+c.pal[c.map[code]%c.pal.length]+'"></i>'+esc(V.lab(c.p, code))+'</span>'; }).join('')+(c.members.length > 40 ? '<span>+'+(c.members.length-40)+'</span>' : '')+'</div>';
    } else lg += '<div class="tfp-lg"><b>'+esc(labelOf(c.p))+'</b><span class="gr"><em>'+esc(fmt(c.lo))+'</em><i class="gb" style="background:'+gradientCss(c)+'"></i><em>'+esc(fmt(c.hi))+'</em></span></div>';
  }
  if (V.size && V.size.kind === 'num') lg += '<div class="tfp-lg"><b>Size: '+esc(labelOf(V.size.p))+'</b><span>'+esc(fmt(V.size.lo))+' → '+esc(fmt(V.size.hi))+'</span></div>';
  return {svg:svg, legend:lg, svgW:svgW, svgH:svgH, scales:scales};
}

/* ------------------------------------------------------------------ explanation (Hebrew) */
function aggHe(p){
  var n = labelOf(p), f = fieldLabel(p.f);
  switch (p.agg){
    case 'SUM': return E(n)+' מחבר את הערכים של '+E(f)+' בכל השורות ששייכות לאותו סימן, ולכן מקבלים מספר אחד לכל סימן.';
    case 'AVG': return E(n)+' מחשב ממוצע של '+E(f)+' בכל שורות הסימן.';
    case 'CNT': return E(n)+' סופר שורות, לא מחבר ערכים.';
    case 'CNTD': return E(n)+' סופר כמה ערכים שונים יש ב-'+E(f)+' בתוך הסימן.';
    case 'MIN': return E(n)+' מציג את הערך הקטן ביותר של '+E(f)+' בסימן.';
    case 'MAX': return E(n)+' מציג את הערך הגדול ביותר של '+E(f)+' בסימן.';
    default: return E(n)+' מציג את החציון של '+E(f)+' בסימן.';
  }
}
function explain(S, V){
  var items = [];
  function add(cls, html){ items.push({cls:cls, html:html}); }
  if (V.empty){
    add('', 'הגיליון ריק. גררו שדה מהרשימה אל <b>Columns</b> או אל <b>Rows</b> (או לחצו עליו פעמיים, או בחרו אותו ואז לחצו על המדף).');
    add('', 'ממד (כחול) מפצל את הנתונים לקבוצות ויוצר כותרות. מדד (ירוק) מחושב לכל קבוצה ויוצר ציר.');
    return items;
  }
  var all = [];
  ['columns','rows','color','size','label','detail'].forEach(function(sh){ S[sh].forEach(function(p){ all.push(p); }); });
  var blue = [], green = [], seen = {};
  all.forEach(function(p){ var s = specOf(p); if (seen[s]) return; seen[s] = 1; (isCont(p) ? green : blue).push(p); });
  var t = '';
  if (blue.length) t += 'פילים כחולים (בדידים): '+blue.map(function(p){ return E(labelOf(p)); }).join(', ')+'. כל ערך הוא קבוצה נפרדת, ועל Columns ו-Rows הם יוצרים כותרות. ';
  if (green.length) t += 'פילים ירוקים (רציפים): '+green.map(function(p){ return E(labelOf(p)); }).join(', ')+'. על Columns ו-Rows הם יוצרים ציר מספרי.';
  if (t) add('', t);
  /* marks and level of detail */
  if (!V.nrows){ add('warn', 'אחרי הסינון לא נשארה אף שורה, ולכן אין סימנים.'); return items; }
  var nm = V.nMarks, lodNames = V.lod.map(function(p){ return E(labelOf(p)); });
  if (!V.lod.length) add('', 'יש <b>'+fmt(nm)+'</b> '+(nm === 1 ? 'סימן' : 'סימנים')+' (Marks). בתצוגה אין אף ממד, רק מדדים, ולכן Tableau מחבר את כל '+fmt(V.nrows)+' השורות לסימן אחד.');
  else add('', 'יש <b>'+fmt(nm)+'</b> '+(nm === 1 ? 'סימן' : 'סימנים')+' (Marks). Tableau יוצר סימן אחד לכל שילוב של הממדים שבתצוגה (רמת הפירוט): '+lodNames.join(', ')+'. המדדים מחושבים לכל סימן בנפרד.');
  /* mark rule */
  var mk = V.mark, why = '';
  if (V.markRule === 'manual') why = 'סוג הסימן נבחר ידנית בכרטיס Marks: <b>'+MARKN[mk]+'</b>. ב-Automatic Tableau היה בוחר '+MARKN[V.auto.type]+'.';
  else if (V.markRule === 'dim-measure') why = 'Automatic בחר <b>Bar</b> כי בקצה הפנימי של Columns ו-Rows יש ממד אחד ומדד אחד.';
  else if (V.markRule === 'date-measure') why = 'Automatic בחר <b>Line</b> כי בצד אחד יש תאריך (או ממד רציף) ובצד השני מדד. התאריך מסדר את הנקודות והקו מחבר אותן.';
  else if (V.markRule === 'two-measures') why = 'Automatic בחר <b>Shape</b> (עיגולים ריקים, תצוגת פיזור) כי בשני הצירים יש מדדים. כל סימן הוא נקודה אחת.';
  else if (V.markRule === 'measure-alone') why = 'Automatic בחר <b>Bar</b>: יש מדד אחד בלבד, ולכן מתקבלת עמודה אחת.';
  else if (V.markRule === 'dims-only') why = 'Automatic בחר <b>Text</b> (טבלת טקסט) כי אין מדד על הצירים, רק ממדים. כדי לראות מספרים גררו מדד אל Label.';
  if (why) add('', why);
  /* aggregation */
  var shown = 0;
  V.mps.forEach(function(p){ if (shown < 2){ add('', aggHe(p)); shown++; } });
  /* dates */
  var dseen = {};
  all.forEach(function(p){
    if (!isDate(p)) return; var s = specOf(p); if (dseen[s]) return; dseen[s] = 1;
    if (p.cont) add('', E(labelOf(p))+' הוא תאריך רציף (ירוק): ציר זמן אחד שבו כל נקודה במקומה האמיתית בזמן. '+(p.part === 'YEAR' ? '' : 'ב-Tableau אפשר גם לעבור ל-Discrete, ואז כל ערך הופך לכותרת נפרדת.'));
    else if (p.part === 'MONTH') add('', E(labelOf(p))+' הוא חלק תאריך בדיד (כחול): חודש מאחד את אותו חודש מכל השנים לכותרת אחת (Jan של 2024 ושל 2025 יחד). כדי לראות כל חודש בנפרד בציר הזמן עברו ל-Continuous, או הוסיפו גם '+E('YEAR(Order Date)')+'.');
    else add('', E(labelOf(p))+' הוא חלק תאריך בדיד (כחול): כל ערך הוא כותרת נפרדת, בדיוק כמו קטגוריה. כדי לקבל ציר זמן רציף בחרו Continuous בתפריט הפיל.');
  });
  /* warnings */
  var scatter = V.cells.length && V.cells.every(function(c){ return c.orient === 's'; });
  if (scatter && V.nMarks === 1 && !V.lod.length) add('warn', 'מדד על שני הצירים ואין אף ממד בתצוגה, ולכן יש <b>סימן אחד בלבד</b>: הסכום של כל השורות. כדי לקבל נקודה לכל פריט, גררו ממד (למשל '+E('Item')+') אל <b>Detail</b>.');
  else if (scatter && V.nMarks > 1) add('', 'נוספו ממדים (ב-Detail, Color או בכותרות), ולכן הסימן האחד התפצל ל-'+fmt(V.nMarks)+' סימנים.');
  if (V.color && V.color.kind === 'cat' && V.color.members.length > 10) add('warn', 'ב-Color יש ממד עם '+V.color.members.length+' ערכים. יותר מ-10 צבעים כבר קשה להבחין ביניהם. עדיף ממד קטן יותר, או להעביר אותו ל-Detail.');
  [V.cols, V.rows].forEach(function(info){ info.D.forEach(function(p, i){ if (info.tuples.length > 40 && i === info.D.length-1) add('warn', 'ל-'+(info === V.cols ? 'Columns' : 'Rows')+' נכנס ממד עם הרבה ערכים ('+fmt(info.tuples.length)+' כותרות), ולכן הגרף צפוף וקשה לקריאה.'); }); });
  if ((mk === 'bar' || mk === 'area') && V.notes.stacked){
    var stackAggs = V.mps.filter(function(p){ return p.agg !== 'SUM' && p.agg !== 'CNT'; });
    add('', 'יש כמה סימנים באותה עמודה (בגלל Color או Detail), ולכן Tableau מערים אותם זה על זה.'+(stackAggs.length ? ' שימו לב: הערמה של '+E(labelOf(stackAggs[0]))+' אינה חישוב כולל של הקבוצה כולה.' : ''));
  }
  if ((mk === 'bar' || mk === 'area') && V.cells.some(function(c){ return c.orient === 's'; })) add('warn', 'עמודות על שני מדדים מתחילות מאפס על הציר האנכי, ולכן הגרף נראה לא רגיל. זה בדרך כלל לא הסוג המתאים לשני מדדים.');
  if (mk === 'text' && !S.label.length) add('', 'סוג Text בלי שדה ב-Label מציג רק Abc. גררו מדד אל <b>Label</b> כדי לראות מספרים.');
  S.detail.forEach(function(p){ if (isMeasure(p)) add('', E(labelOf(p))+' ב-Detail לא משנה את מספר הסימנים. רק ממד ב-Detail מפצל סימנים.'); });
  var colsM = S.columns.filter(isMeasure), rowsM = S.rows.filter(isMeasure);
  if (colsM.length > 1 || rowsM.length > 1) add('', 'כמה מדדים על אותו מדף: כל מדד מקבל ציר ופאנל משלו ('+(rowsM.length > 1 ? 'מוערמים אנכית' : 'זה לצד זה')+').');
  if (all.some(function(p){ return p.agg === 'CNTD' && p.f === 'Order_ID'; })) add('', 'ב-'+E('Order_ID')+' כל ערך מופיע פעם אחת בלבד, לכן Count (Distinct) שווה כאן ל-Count.');
  if (S.filters.length) add('', 'הסינון מפעיל את התצוגה על '+fmt(V.nrows)+' מתוך '+fmt(DS.n)+' שורות.');
  if (V.sortApplied) add('', 'המיון מסדר את '+E(V.sortApplied.pill.replace(/_/g,' '))+' לפי '+E(V.sortApplied.by.replace(/_/g,' '))+' ('+(V.sortApplied.dir === 'asc' ? 'עולה' : 'יורד')+').');
  else if (S.sort) add('warn', 'המיון דורש ממד בדיד על Columns או Rows ומדד בתצוגה.');
  if (S.size.length && mk === 'line') add('warn', 'ב-Tableau Size משנה את עובי הקו. בהדמיה הזו הוא לא משפיע על קווים.');
  return items;
}
var LIMITS = [
  'זו הדמיה לימודית של לוגיקת המדפים של Tableau, על מערך נתונים אחד. היא לא כוללת Show Me, חישובים, פרמטרים, מפות או דשבורדים.',
  'עד שני ממדים בדידים בכל מדף מוצגים ככותרות מקוננות. בשלושה ומעלה הגרף עדיין נבנה, אך הכותרות צפופות.',
  'פילים רציפים מצוירים תמיד בצד הפנימי של המדף, גם אם הוצבו לפני פיל בדיד. ב-Tableau הסדר בתוך המדף קובע את הקינון.',
  'לא קיימים ציר כפול (Dual Axis), Measure Names ו-Measure Values, ציר הפוך, עריכת צירים וקווי מגמה.',
  'חלקי תאריך: Year, Quarter, Month, Day בלבד (ללא Week ו-Weekday). חודשים בדידים מוצגים בקיצור (Jan) וב-Tableau בדרך כלל במלואם (January).',
  'ב-Color ו-Size ניתן להניח שדה אחד בלבד. ב-Tableau אפשר לשלב כמה שדות (Shift). Tooltip, Shape ו-Path אינם נתמכים.',
  'ממד מומר למדד נתמך כ-Count ו-Count (Distinct) בלבד (בלי Minimum, Maximum ו-Attribute).',
  'סינון מדד: ברירת המחדל כאן היא "All values" (כל שורה בנפרד). ב-Tableau ברירת המחדל היא Sum. אפשר לבחור Sum בחלון הסינון.',
  'ציר ה-Include zero מחושב בקירוב: עמודות ושטחים מתחילים תמיד מאפס, ובשאר הסוגים הציר מתחיל מאפס כשהערך המינימלי קטן מ-60% מהמקסימלי.',
  'סוג Automatic לדו-מדד מצויר כעיגולים ריקים (Shape). הצבעים: פלטת Tableau 10, ומעל 10 ערכים Tableau 20.',
  'המיון פועל על הממד הבדיד הפנימי (לא תאריך) לפי המדד הראשון בתצוגה, בתוך כל קבוצה חיצונית. ב-Tableau אפשר למיין כל פיל בנפרד.'
];

/* ------------------------------------------------------------------ instance */
var INST = [], readyCbs = [], pending = 0, readyFired = false;
function fireReadyIfDone(){ if (pending === 0 && !readyFired){ readyFired = true; readyCbs.splice(0).forEach(function(f){ try { f(); } catch(e){ if (window.console) console.warn(e); } }); } }

function Inst(el){
  var self = this;
  this.el = el; el._tfp = this;
  this.S = emptyState(); this.undoStack = []; this.touched = false; this.sel = null; this.drag = null;
  this.charts = {}; this.okShown = false; this.V = null; this.view = null; this.dropped = false;
  this.id = el.dataset.id || ''; this.task = el.dataset.task || '';
  this.goal = null; try { if (el.dataset.goal) this.goal = JSON.parse(el.dataset.goal); } catch(e){ this.goal = null; }
  this.preset = null; try { if (el.dataset.preset) this.preset = JSON.parse(el.dataset.preset); } catch(e){ this.preset = null; }
  this.hidden = (el.dataset.hideShelves || '').split(',').map(function(s){ return s.trim().toLowerCase(); }).filter(Boolean);
  this.fieldsLimit = el.dataset.fields ? el.dataset.fields.split(',').map(function(s){ return s.trim(); }).filter(Boolean) : null;
  this.sigs = {};
  this.build();
  pending++;
  loadData(function(){ self.start(); pending--; fireReadyIfDone(); });
}
var P = Inst.prototype;

P.build = function(){
  var el = this.el, hide = this.hidden;
  el.classList.add('tfp-ready0');
  el.setAttribute('role', 'group'); el.setAttribute('aria-label', 'Mini Tableau, הדמיה לימודית');
  var sh = function(n){ return hide.indexOf(n) < 0; };
  var html = '';
  html += '<div class="tfp-h"><b>Mini Tableau</b><small dir="rtl">הדמיה של Tableau, לא התוכנה עצמה</small></div>';
  if (this.task) html += '<div class="tfp-task" dir="rtl"><b>משימה:</b> <span class="tt">'+esc(this.task)+'</span><span class="tfp-st" aria-live="polite"></span></div>';
  else html += '<div class="tfp-task tfp-free" dir="rtl" hidden><span class="tfp-st" aria-live="polite"></span></div>';
  html += '<div class="tfp-bar" role="toolbar" aria-label="כלי הגיליון">'+
    '<button type="button" data-act="undo" aria-label="ביטול הפעולה האחרונה">↶ ביטול</button>'+
    '<button type="button" data-act="clear" aria-label="ניקוי הגיליון">ניקוי</button>'+
    (this.preset && (this.preset.columns && this.preset.columns.length || this.preset.rows && this.preset.rows.length || this.preset.color && this.preset.color.length) ? '<button type="button" data-act="reset" aria-label="חזרה למצב ההתחלתי של המשימה">איפוס</button>' : '')+
    '<button type="button" data-act="swap" aria-label="החלפת שורות ועמודות">⇄ החלפה</button>'+
    '<button type="button" data-act="asc" aria-pressed="false" aria-label="מיון עולה של הממד לפי המדד">▲ מיון</button>'+
    '<button type="button" data-act="desc" aria-pressed="false" aria-label="מיון יורד של הממד לפי המדד">▼ מיון</button>'+
    (sh('label') ? '<button type="button" data-act="labels" aria-pressed="false" aria-label="הצגה או הסתרה של תוויות על הסימנים">תוויות</button>' : '')+
    '<span class="tfp-sp"></span><span class="tfp-sel" aria-live="polite"></span></div>';
  html += '<div class="tfp-body">';
  html += '<aside class="tfp-side" aria-label="חלונית הנתונים"><div class="tfp-ds">Scoop · 6,575 שורות</div><h6>Dimensions</h6><div class="tfp-dl"></div><h6>Measures</h6><div class="tfp-ml"></div></aside>';
  html += '<div class="tfp-mid">';
  html += this.shelfHTML('columns', 'Columns');
  html += this.shelfHTML('rows', 'Rows');
  if (sh('filters')) html += this.shelfHTML('filters', 'Filters');
  html += '<div class="tfp-canvas" tabindex="0" aria-label="אזור הגרף"><div class="tfp-load" dir="rtl">טוען נתונים...</div></div><div class="tfp-legend"></div>';
  html += '</div>';
  html += '<aside class="tfp-marks" aria-label="כרטיס Marks"><h6>Marks <span class="tfp-cnt" aria-live="polite">Marks: <b>0</b></span></h6>'+
    '<select class="tfp-mt" aria-label="סוג הסימן">'+MARKS.map(function(m){ return '<option value="'+m+'">'+MARKN[m]+'</option>'; }).join('')+'</select><div class="tfp-mtnow" dir="rtl"></div><div class="tfp-mk4">'+
    ['color','size','label','detail'].filter(sh).map(function(s){ return '<div class="tfp-mkz"><span class="tfp-mkt">'+SHELFN[s]+'</span><div class="tfp-drop" tabindex="0" role="group" data-shelf="'+s+'" aria-label="מדף '+SHELFN[s]+', אזור הנחה"></div></div>'; }).join('')+'</div></aside>';
  html += '</div>';
  html += '<div class="tfp-why" dir="rtl" aria-live="polite"><h5>למה Tableau בנה את זה ככה</h5><ul class="tfp-wl"></ul></div>';
  html += '<details class="tfp-lim" dir="rtl"><summary>מגבלות ההדמיה</summary><ul>'+LIMITS.map(function(l){ return '<li>'+esc(l)+'</li>'; }).join('')+'</ul></details>';
  el.innerHTML = html;
  this.q = {
    dl: el.querySelector('.tfp-dl'), ml: el.querySelector('.tfp-ml'), canvas: el.querySelector('.tfp-canvas'), legend: el.querySelector('.tfp-legend'),
    cnt: el.querySelector('.tfp-cnt b'), mt: el.querySelector('.tfp-mt'), mtnow: el.querySelector('.tfp-mtnow'), why: el.querySelector('.tfp-wl'),
    st: el.querySelector('.tfp-st'), task: el.querySelector('.tfp-task'), sel: el.querySelector('.tfp-sel')
  };
  this.bind();
};
P.shelfHTML = function(name, title){
  return '<div class="tfp-shelf" data-shelf-row="'+name+'"><b>'+title+'</b><div class="tfp-drop" tabindex="0" role="group" data-shelf="'+name+'" aria-label="מדף '+title+', אזור הנחה"></div></div>';
};

P.start = function(){
  var self = this;
  this.renderFields();
  if (this.preset){
    ['columns','rows','color','size','label','detail'].forEach(function(sh){
      (self.preset[sh] || []).forEach(function(sp){ var p = parseSpec(sp); if (p) self.place(sh, p, true); });
    });
    (this.preset.filters || []).forEach(function(n){ var f = findField(n); if (f) self.addFilter(f); });
    if (this.preset.mark && MARKS.indexOf(this.preset.mark) >= 0) this.S.mark = this.preset.mark;
  }
  this.presetSnap = snapshot(this.S);
  if (this.id && window.FL && FL.isDone && FL.isDone(this.id)) this.q.task && this.q.task.classList.add('was');
  this.refresh();
  this.el.classList.remove('tfp-ready0');
  this.el.dataset.ready = '1';
  var self2 = this, tid = null;
  if (window.ResizeObserver){
    this._lastW = this.q.canvas.clientWidth;
    new ResizeObserver(function(){
      var w = self2.q.canvas.clientWidth; if (Math.abs(w-self2._lastW) < 4) return; self2._lastW = w;
      clearTimeout(tid); tid = setTimeout(function(){ self2.draw(); }, 80);
    }).observe(this.q.canvas);
  }
};

/* ---- data pane */
P.renderFields = function(){
  var self = this, lim = this.fieldsLimit && this.fieldsLimit.map(function(n){ var f = findField(n); return f ? f.name : null; });
  function item(f){
    var dim = f.role === 'dim', ic = f.kind === 'date' ? '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="1" y="2" width="10" height="9" rx="1.5" fill="none" stroke="currentColor"/><path d="M1 5h10M4 1v2M8 1v2" stroke="currentColor" fill="none"/></svg>' : f.kind === 'cat' ? 'Abc' : '#';
    return '<div class="tfp-f '+(dim ? 'dim' : 'mea')+(f.kind === 'rec' ? ' rec' : '')+'" draggable="true" tabindex="0" role="button" data-f="'+esc(f.name)+'" aria-label="'+esc(f.label)+', '+(dim ? 'ממד' : 'מדד')+'. Enter לבחירה, ואז לחיצה על מדף. לחיצה כפולה להוספה אוטומטית"><i>'+ic+'</i><span>'+esc(f.label)+'</span></div>';
  }
  var dims = [], meas = [];
  DS.fields.forEach(function(f){
    if (lim && lim.indexOf(f.name) < 0) return;
    (f.role === 'dim' ? dims : meas).push(item(f));
  });
  this.q.dl.innerHTML = dims.join(''); this.q.ml.innerHTML = meas.join('');
};

/* ---- state mutations */
P.pushUndo = function(){ this.undoStack.push(snapshot(this.S)); if (this.undoStack.length > 60) this.undoStack.shift(); };
P.commit = function(fn){
  this.pushUndo(); var r = fn.call(this); this.touched = true; this.refresh(); return r;
};
P.place = function(shelf, pill, silent){
  var S = this.S;
  if (shelf === 'filters'){ var f = DS.map[pill.f]; if (!f) return -1; return this.addFilter(f); }
  var arr = S[shelf]; if (!arr) return -1;
  var dup = arr.some(function(p){ return samePill(p, pill); }); if (dup) return -1;
  if (SINGLE[shelf]) arr.length = 0;
  arr.push(pill); return arr.length-1;
};
P.addFilter = function(f){
  var S = this.S;
  if (S.filters.some(function(x){ return x.f === f.name; })) return -1;
  var nf = newFilter(f); if (!nf) return -1;
  S.filters.push(nf); return S.filters.length-1;
};
P.removeAt = function(shelf, i){ var arr = this.S[shelf]; if (arr && arr[i] !== undefined) arr.splice(i, 1); };
P.autoPlace = function(f){
  var S = this.S, p = defaultPill(f), isM = isMeasure(p);
  var hasM = function(a){ return a.some(isMeasure); };
  var cNone = !S.columns.length, rNone = !S.rows.length;
  var cM = hasM(S.columns), rM = hasM(S.rows), anyDim = S.columns.concat(S.rows).some(isDim);
  var shelf;
  if (isM){
    if (cNone && rNone) shelf = 'rows';
    else if (!cM && !rM && anyDim) shelf = 'label';
    else if (rM && !cM) shelf = 'columns';
    else shelf = 'rows';
  } else if (isDate(p)){
    shelf = S.columns.some(isDate) ? 'rows' : 'columns';
  } else {
    if (cNone && rNone) shelf = 'rows';
    else if (rM && cM) shelf = 'detail';
    else if (rM) shelf = 'columns';
    else if (cM) shelf = 'rows';
    else shelf = S.rows.length && !S.columns.length ? 'columns' : 'rows';
  }
  if (shelf === 'label' && !S.mark) S.mark = 'auto';
  this.place(shelf, p);
  return shelf;
};
P.clearAll = function(){ var m = this.S.labelsOn; this.S = emptyState(); this.S.labelsOn = false; };
P.swap = function(){ var t = this.S.columns; this.S.columns = this.S.rows; this.S.rows = t; };

/* ---- events */
P.bind = function(){
  var self = this, el = this.el;
  el.addEventListener('click', function(e){
    var t = e.target;
    var x = t.closest && t.closest('.tfp-pill .x');
    if (x){ var pe = x.closest('.tfp-pill'); self.commit(function(){ self.removeAt(pe.dataset.shelf, +pe.dataset.i); }); return; }
    var pill = t.closest && t.closest('.tfp-pill');
    if (pill){ self.openMenu(pill); return; }
    var fld = t.closest && t.closest('.tfp-f');
    if (fld){ self.select(fld.dataset.f); return; }
    var btn = t.closest && t.closest('button[data-act]');
    if (btn){ self.act(btn.dataset.act); return; }
    var zone = t.closest && t.closest('.tfp-drop');
    if (zone && self.sel){ self.placeSelected(zone.dataset.shelf); return; }
    if (t.closest && t.closest('.tfp-selhint .auto')){ self.autoSelected(); return; }
  });
  el.addEventListener('dblclick', function(e){
    var fld = e.target.closest && e.target.closest('.tfp-f'); if (!fld) return;
    self.sel = fld.dataset.f; self.autoSelected();
  });
  el.addEventListener('keydown', function(e){
    var t = e.target, k = e.key;
    if ((k === 'Enter' || k === ' ') && t.classList.contains('tfp-f')){ e.preventDefault(); self.select(t.dataset.f); }
    else if ((k === 'Enter' || k === ' ') && t.classList.contains('tfp-drop')){ e.preventDefault(); if (self.sel) self.placeSelected(t.dataset.shelf); }
    else if (t.classList.contains('tfp-pill')){
      if (k === 'Enter' || k === ' '){ e.preventDefault(); self.openMenu(t); }
      else if (k === 'Delete' || k === 'Backspace'){ e.preventDefault(); self.commit(function(){ self.removeAt(t.dataset.shelf, +t.dataset.i); }); }
    } else if (k === 'Escape' && self.sel){ self.select(null); }
  });
  this.q.mt.addEventListener('change', function(){ var v = self.q.mt.value; self.commit(function(){ self.S.mark = v; }); });
  /* drag and drop */
  el.addEventListener('dragstart', function(e){
    var f = e.target.closest && e.target.closest('.tfp-f'), p = e.target.closest && e.target.closest('.tfp-pill');
    self.dropped = false;
    if (f){ self.drag = {type:'field', f:f.dataset.f}; }
    else if (p){ self.drag = {type:'pill', shelf:p.dataset.shelf, i:+p.dataset.i}; }
    else return;
    try { e.dataTransfer.setData('text/plain', f ? f.dataset.f : 'pill'); e.dataTransfer.effectAllowed = 'copyMove'; } catch(x){}
    el.classList.add('tfp-dragging');
  });
  el.addEventListener('dragover', function(e){
    var z = e.target.closest && e.target.closest('.tfp-drop'); if (!z || !self.drag) return;
    e.preventDefault(); try { e.dataTransfer.dropEffect = self.drag.type === 'field' ? 'copy' : 'move'; } catch(x){}
    z.classList.add('over');
  });
  el.addEventListener('dragleave', function(e){ var z = e.target.closest && e.target.closest('.tfp-drop'); if (z) z.classList.remove('over'); });
  el.addEventListener('drop', function(e){
    var z = e.target.closest && e.target.closest('.tfp-drop'); if (!z || !self.drag) return;
    e.preventDefault(); z.classList.remove('over'); self.dropped = true;
    var d = self.drag, shelf = z.dataset.shelf, tp = e.target.closest('.tfp-pill'), at = tp && tp.dataset.shelf === shelf ? +tp.dataset.i : -1;
    self.drag = null;
    self.commit(function(){
      if (d.type === 'field'){ var f = DS.map[d.f]; if (f) self.insert(shelf, defaultPill(f), at); }
      else self.movePill(d.shelf, d.i, shelf, at);
    });
  });
  el.addEventListener('dragend', function(){
    el.classList.remove('tfp-dragging');
    Array.prototype.forEach.call(el.querySelectorAll('.tfp-drop.over'), function(z){ z.classList.remove('over'); });
    var d = self.drag; self.drag = null;
    if (d && d.type === 'pill' && !self.dropped) self.commit(function(){ self.removeAt(d.shelf, d.i); });
  });
};
P.insert = function(shelf, pill, at){
  var i = this.place(shelf, pill);
  if (i >= 0 && at >= 0 && at < i && !SINGLE[shelf] && shelf !== 'filters'){ var a = this.S[shelf], p = a.pop(); a.splice(at, 0, p); }
};
P.movePill = function(from, i, to, at){
  var S = this.S, src = S[from]; if (!src || src[i] === undefined) return;
  if (from === to){ if (at < 0 || SINGLE[to] || to === 'filters') return; var p0 = src.splice(i, 1)[0]; src.splice(at > i ? at : at, 0, p0); return; }
  if (from === 'filters'){
    var fl = src.splice(i, 1)[0]; var f = DS.map[fl.f]; if (to === 'filters') return; this.insert(to, defaultPill(f), at); return;
  }
  var pill = src.splice(i, 1)[0];
  if (to === 'filters'){ this.place('filters', pill); return; }
  var idx = this.place(to, pill);
  if (idx < 0){ src.splice(i, 0, pill); return; }
  if (at >= 0 && !SINGLE[to]){ var a = S[to], q = a.pop(); a.splice(at, 0, q); }
};
P.select = function(name){
  this.sel = this.sel === name ? null : name;
  var self = this;
  Array.prototype.forEach.call(this.el.querySelectorAll('.tfp-f'), function(f){ f.classList.toggle('sel', f.dataset.f === self.sel); });
  var box = this.q.sel;
  if (this.sel){
    var f = DS.map[this.sel];
    box.innerHTML = '<span class="tfp-selhint" dir="rtl">נבחר: <b class="n">'+esc(f.label)+'</b>. לחצו על מדף כדי להניח אותו, או <button type="button" class="auto">הוספה אוטומטית</button></span>';
  } else box.innerHTML = '';
};
P.placeSelected = function(shelf){
  var name = this.sel; if (!name) return; var f = DS.map[name]; if (!f) return;
  var self = this; this.sel = null; this.q.sel.innerHTML = '';
  this.commit(function(){ self.place(shelf, defaultPill(f)); });
  this.select(null);
};
P.autoSelected = function(){
  var name = this.sel; if (!name) return; var f = DS.map[name]; var self = this;
  this.commit(function(){ self.autoPlace(f); });
  this.sel = name; this.select(name);
};
P.act = function(a){
  var self = this;
  if (a === 'undo') this.undo();
  else if (a === 'clear') this.commit(function(){ self.clearAll(); });
  else if (a === 'reset') this.commit(function(){ self.S = JSON.parse(self.presetSnap); });
  else if (a === 'swap') this.commit(function(){ self.swap(); });
  else if (a === 'asc' || a === 'desc') this.commit(function(){ self.S.sort = self.S.sort === a ? null : a; });
  else if (a === 'labels') this.commit(function(){ self.S.labelsOn = !self.S.labelsOn; });
};
P.undo = function(){ if (!this.undoStack.length) return false; this.S = JSON.parse(this.undoStack.pop()); this.refresh(); return true; };

/* ---- popovers and menus */
var POP = null;
function closePop(){ if (POP){ var o = POP._owner; POP.remove(); POP = null; document.removeEventListener('mousedown', outside, true); document.removeEventListener('keydown', popKey, true); if (o && o.focus) { try { o.focus(); } catch(e){} } } }
function outside(e){ if (POP && !POP.contains(e.target) && !(POP._owner && POP._owner.contains(e.target))) closePop(); }
function popKey(e){ if (e.key === 'Escape'){ e.stopPropagation(); closePop(); } }
function openPop(anchor, html, label){
  closePop();
  var d = document.createElement('div'); d.className = 'tfp-pop'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', label || 'תפריט'); d.innerHTML = html; d._owner = anchor;
  document.body.appendChild(d); POP = d;
  var r = anchor.getBoundingClientRect(), w = d.offsetWidth, h = d.offsetHeight;
  var x = clamp(r.left, 6, Math.max(6, window.innerWidth-w-6)), y = r.bottom+4;
  if (y+h > window.innerHeight-6) y = Math.max(6, r.top-h-4);
  d.style.left = x+'px'; d.style.top = y+'px';
  document.addEventListener('mousedown', outside, true); document.addEventListener('keydown', popKey, true);
  var first = d.querySelector('button, input, select'); if (first) try { first.focus(); } catch(e){}
  return d;
}
P.pillAt = function(shelf, i){ return this.S[shelf][i]; };
P.openMenu = function(el){
  var self = this, shelf = el.dataset.shelf, i = +el.dataset.i;
  if (shelf === 'filters') return this.openFilter(el, i);
  var p = this.S[shelf][i]; if (!p) return;
  var f = F(p), h = '<div class="tfp-menu" dir="ltr">';
  function item(act, text, on, extra){ return '<button type="button" role="menuitem" data-m="'+act+'"'+(extra || '')+(on ? ' class="on"' : '')+'>'+(on ? '✓ ' : '')+esc(text)+'</button>'; }
  var cur = null;
  if (f.kind === 'date' && !p.agg){
    h += '<h6>Discrete (blue)</h6>';
    var sample = {YEAR:'2024', QUARTER:'Q1', MONTH:'Jan', DAY:'5'};
    PARTS.forEach(function(pt){ h += item('part:'+pt+':d', PARTN[pt]+'  ('+sample[pt]+')', p.part === pt && !p.cont); });
    h += '<h6>Continuous (green)</h6>';
    var sample2 = {YEAR:'2024', QUARTER:'Q1 2024', MONTH:'Jan 2024', DAY:'Jan 5, 2024'};
    PARTS.forEach(function(pt){ h += item('part:'+pt+':c', PARTN[pt]+'  ('+sample2[pt]+')', p.part === pt && p.cont); });
    h += '<h6>Measure</h6>'+item('agg:CNT', 'Count')+item('agg:CNTD', 'Count (Distinct)');
  } else if (f.kind === 'cat'){
    if (p.agg){
      h += '<h6>Measure</h6>'+item('agg:CNT', 'Count', p.agg === 'CNT')+item('agg:CNTD', 'Count (Distinct)', p.agg === 'CNTD')+'<h6>Convert</h6>'+item('dim', 'Dimension');
    } else h += '<h6>Measure</h6>'+item('agg:CNT', 'Count')+item('agg:CNTD', 'Count (Distinct)');
  } else if (f.kind === 'date' && p.agg){
    h += '<h6>Measure</h6>'+item('agg:CNT', 'Count', p.agg === 'CNT')+item('agg:CNTD', 'Count (Distinct)', p.agg === 'CNTD')+'<h6>Convert</h6>'+item('dim', 'Dimension');
  } else {
    h += '<h6>Measure</h6>'+AGGO.map(function(a){ return item('agg:'+a, AGGN[a], p.agg === a); }).join('');
    if (f.kind === 'num'){
      h += '<h6>Convert</h6>'+item('dim', 'Dimension', !p.agg);
      if (!p.agg) h += '<h6>Type</h6>'+item('cont:0', 'Discrete', !p.cont)+item('cont:1', 'Continuous', p.cont);
    }
  }
  h += '<hr>'+item('remove', 'Remove')+'</div>';
  var pop = openPop(el, h, 'תפריט הפיל '+labelOf(p));
  pop.addEventListener('click', function(e){
    var b = e.target.closest('button[data-m]'); if (!b) return;
    var m = b.dataset.m.split(':'), cmd = m[0];
    closePop();
    self.commit(function(){
      var q = self.S[shelf][i]; if (!q) return;
      if (cmd === 'remove') self.removeAt(shelf, i);
      else if (cmd === 'agg'){ q.agg = m[1]; q.cont = true; delete q.part; }
      else if (cmd === 'dim'){ q.agg = null; var ff = F(q); if (ff.kind === 'date'){ q.part = 'YEAR'; } q.cont = false; }
      else if (cmd === 'part'){ q.agg = null; q.part = m[1]; q.cont = m[2] === 'c'; }
      else if (cmd === 'cont'){ q.cont = m[1] === '1'; }
      self.dedupe(shelf);
    });
  });
  pop.addEventListener('keydown', function(e){
    var bs = Array.prototype.slice.call(pop.querySelectorAll('button')), k = bs.indexOf(document.activeElement);
    if (e.key === 'ArrowDown'){ e.preventDefault(); bs[(k+1)%bs.length].focus(); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); bs[(k-1+bs.length)%bs.length].focus(); }
  });
};
P.dedupe = function(shelf){
  var arr = this.S[shelf], seen = {};
  this.S[shelf] = arr.filter(function(p){ var s = specOf(p); if (seen[s]) return false; seen[s] = 1; return true; });
};
P.openFilter = function(el, i){
  var self = this, fl = this.S.filters[i]; if (!fl) return; var f = DS.map[fl.f];
  var h = '<div class="tfp-filter" dir="rtl"><h6 dir="ltr">Filter: '+esc(f.label)+'</h6>';
  if (fl.kind === 'cat'){
    var ex = new Set(fl.excl), tot = f.dict.length;
    h += '<div class="fb"><button type="button" data-fa="all">בחירת הכל</button><button type="button" data-fa="none">ניקוי הכל</button></div>';
    if (tot > 12) h += '<input type="search" class="fs" dir="ltr" placeholder="חיפוש..." aria-label="חיפוש ערך">';
    h += '<div class="fl" dir="ltr"></div><div class="fn"></div>';
  } else if (fl.kind === 'date'){
    var years = []; for (var y = 0; y < DS.n; y++){ var yy = f.y[y]; if (years.indexOf(yy) < 0) years.push(yy); }
    years.sort(); var ys = fl.years ? fl.years.map(Number) : years;
    h += '<div class="fb">שנים:</div><div class="fy" dir="ltr">'+years.map(function(yv){ return '<label><input type="checkbox" data-y="'+yv+'"'+(ys.indexOf(yv) >= 0 ? ' checked' : '')+'> '+yv+'</label>'; }).join('')+'</div>'+
      '<div class="fb">טווח תאריכים:</div><div class="fr" dir="ltr"><input type="date" data-d="from" value="'+(fl.from || '')+'" aria-label="מתאריך"> <input type="date" data-d="to" value="'+(fl.to || '')+'" aria-label="עד תאריך"></div>';
  } else {
    h += '<div class="fb">מצב:</div><select data-n="mode" dir="rtl" aria-label="מצב הסינון"><option value="all"'+(fl.mode === 'all' ? ' selected' : '')+'>כל הערכים (All values)</option><option value="SUM"'+(fl.mode === 'SUM' ? ' selected' : '')+'>סכום לכל סימן (Sum)</option></select>'+
      '<div class="fr" dir="ltr"><label>Min <input type="number" data-n="min" value="'+fl.min+'"></label> <label>Max <input type="number" data-n="max" value="'+fl.max+'"></label></div>';
  }
  h += '<div class="fb"><button type="button" data-fa="remove">הסרת הסינון</button><button type="button" data-fa="close">סגירה</button></div></div>';
  var pop = openPop(el, h, 'סינון '+f.label);
  function members(){
    var q = (pop.querySelector('.fs') || {}).value || '', list = pop.querySelector('.fl'), cnt = pop.querySelector('.fn');
    if (!list) return;
    var ex = new Set(self.S.filters[i].excl), out = [], shown = 0, match = 0;
    f.dict.forEach(function(name, code){
      if (q && name.toLowerCase().indexOf(q.toLowerCase()) < 0) return; match++;
      if (shown < 200){ shown++; out.push('<label><input type="checkbox" data-c="'+code+'"'+(ex.has(code) ? '' : ' checked')+'> '+esc(name)+'</label>'); }
    });
    list.innerHTML = out.join('');
    cnt.textContent = match > 200 ? 'מוצגים 200 מתוך '+match+' ערכים. השתמשו בחיפוש.' : '';
  }
  if (fl.kind === 'cat') members();
  var timer = null;
  pop.addEventListener('input', function(e){ if (e.target.classList.contains('fs')) members(); });
  pop.addEventListener('change', function(e){
    var t = e.target;
    self.commit(function(){
      var cf = self.S.filters[i]; if (!cf) return;
      if (cf.kind === 'cat' && t.dataset.c !== undefined){
        var code = +t.dataset.c, ex = new Set(cf.excl); if (t.checked) ex.delete(code); else ex.add(code); cf.excl = Array.from(ex).sort(function(a,b){ return a-b; });
      } else if (cf.kind === 'date'){
        if (t.dataset.y !== undefined){
          var all = Array.prototype.map.call(pop.querySelectorAll('input[data-y]'), function(x){ return x; }), sel = all.filter(function(x){ return x.checked; }).map(function(x){ return +x.dataset.y; });
          cf.years = sel.length === all.length ? null : sel;
        } else if (t.dataset.d === 'from') cf.from = t.value || null; else if (t.dataset.d === 'to') cf.to = t.value || null;
      } else if (cf.kind === 'num'){
        if (t.dataset.n === 'mode'){
          cf.mode = t.value;
          if (cf.mode === 'SUM'){ var s = 0, fld = DS.map[cf.f]; for (var z = 0; z < DS.n; z++) s += fld.vals[z]; cf.min = Math.min(0, fld.min); cf.max = s; }
          else { cf.min = fld_min(cf.f); cf.max = fld_max(cf.f); }
          pop.querySelector('input[data-n=min]').value = cf.min; pop.querySelector('input[data-n=max]').value = cf.max;
        } else if (t.dataset.n === 'min') cf.min = +t.value; else if (t.dataset.n === 'max') cf.max = +t.value;
      }
    });
  });
  pop.addEventListener('click', function(e){
    var b = e.target.closest('button[data-fa]'); if (!b) return; var a = b.dataset.fa;
    if (a === 'close'){ closePop(); return; }
    if (a === 'remove'){ closePop(); self.commit(function(){ self.S.filters.splice(i, 1); }); return; }
    self.commit(function(){ var cf = self.S.filters[i]; if (a === 'all') cf.excl = []; else cf.excl = f.dict.map(function(_, c){ return c; }); });
    members();
  });
};
function fld_min(n){ return DS.map[n].min; }
function fld_max(n){ return DS.map[n].max; }

/* ---- rendering */
P.refresh = function(){
  var S = this.S, V;
  try { V = compute(S); } catch(e){ if (window.console) console.error(e); V = null; }
  this.V = V;
  this.renderShelves();
  this.draw();
  this.renderSide();
  if (V) this.checkGoal();
};
P.renderShelves = function(){
  var S = this.S, el = this.el;
  SHELVES.forEach(function(sh){
    var z = el.querySelector('.tfp-drop[data-shelf="'+sh+'"]'); if (!z) return;
    z.innerHTML = S[sh].map(function(p, i){
      if (sh === 'filters'){
        var f = DS.map[p.f], cls = p.kind === 'num' ? 'c' : 'd';
        return '<span class="tfp-pill '+cls+'" draggable="true" tabindex="0" role="button" aria-haspopup="dialog" data-shelf="filters" data-i="'+i+'" aria-label="'+esc(f.label)+', פילטר. Enter לפתיחה, Delete להסרה"><span class="t">'+esc(f.label)+'</span><u aria-hidden="true">▾</u><b class="x" role="button" aria-label="הסרת הפילטר">×</b></span>';
      }
      var c = isCont(p), lab = labelOf(p);
      return '<span class="tfp-pill '+(c ? 'c' : 'd')+'" draggable="true" tabindex="0" role="button" aria-haspopup="menu" data-shelf="'+sh+'" data-i="'+i+'" aria-label="'+esc(lab)+', פיל '+(c ? 'ירוק רציף' : 'כחול בדיד')+'. Enter לתפריט, Delete להסרה"><span class="t">'+esc(lab)+'</span><u aria-hidden="true">▾</u><b class="x" role="button" aria-label="הסרת '+esc(lab)+'">×</b></span>';
    }).join('');
    z.classList.toggle('empty', !S[sh].length);
  });
  this.q.mt.value = S.mark;
  var asc = el.querySelector('[data-act=asc]'), desc = el.querySelector('[data-act=desc]'), lb = el.querySelector('[data-act=labels]');
  if (asc) asc.setAttribute('aria-pressed', S.sort === 'asc'); if (desc) desc.setAttribute('aria-pressed', S.sort === 'desc'); if (lb) lb.setAttribute('aria-pressed', !!S.labelsOn);
  var un = el.querySelector('[data-act=undo]'); if (un) un.disabled = !this.undoStack.length;
};
P.draw = function(){
  var V = this.V, S = this.S, q = this.q;
  if (!V){ q.canvas.innerHTML = '<div class="tfp-load" dir="rtl">אירעה שגיאה בבניית הגרף.</div>'; return; }
  var W = (q.canvas.clientWidth || 700)-18, ch = null;
  try { ch = drawChart(V, S, W); } catch(e){ if (window.console) console.error(e); ch = null; }
  this.chart = ch;
  if (!ch || !ch.svg){
    var msg = V.empty ? 'הגיליון ריק. גררו שדות מהרשימה אל המדפים כדי לבנות גרף.' : !V.nrows ? 'אין נתונים אחרי הסינון.' : 'כדי לראות גרף, הניחו שדה על Columns או על Rows.';
    q.canvas.innerHTML = '<div class="tfp-load" dir="rtl">'+msg+'</div>'; q.legend.innerHTML = '';
  } else { q.canvas.innerHTML = ch.svg; q.legend.innerHTML = ch.legend; }
  q.cnt.textContent = fmt(V.nMarks);
  q.mtnow.textContent = S.mark === 'auto' ? (V.empty ? '' : 'כרגע ב-Automatic: '+MARKN[V.mark]) : '';
  q.why.innerHTML = explain(S, V).map(function(it){ return '<li'+(it.cls ? ' class="'+it.cls+'"' : '')+'>'+it.html+'</li>'; }).join('');
};
P.renderSide = function(){ };

/* ---- goals */
function normList(a){ return (a || []).map(function(s){ var p = parseSpec(s); return p ? specOf(p) : String(s); }); }
function shelfSpecs(S, sh){ return sh === 'filters' ? S.filters.map(function(fl){ return fl.f; }) : S[sh].map(specOf); }
P.goalMatch = function(goal){
  var self = this, S = this.S, V = this.V;
  function test(swap){
    var ok = true;
    SHELVES.forEach(function(sh){
      if (!goal[sh]) return;
      var key = swap ? (sh === 'columns' ? 'rows' : sh === 'rows' ? 'columns' : sh) : sh;
      var have = shelfSpecs(S, key);
      var want = goal[sh];
      want.forEach(function(w){
        var alts = String(w).split('|').map(function(a){ var p = sh === 'filters' ? null : parseSpec(a); return sh === 'filters' ? (findField(a) || {name:a}).name : (p ? specOf(p) : a.trim()); });
        if (!alts.some(function(a){ return have.indexOf(a) >= 0; })) ok = false;
      });
      if (goal.exact && have.length !== want.length) ok = false;
    });
    return ok;
  }
  var shelvesOK = test(false) || (!goal.strict && test(true));
  if (!shelvesOK) return false;
  if (goal.mark){ var alts = String(goal.mark).toLowerCase().split('|'); if (alts.indexOf(V.mark) < 0) return false; }
  if (goal.marks !== undefined && V.nMarks !== +goal.marks) return false;
  if (goal.minMarks !== undefined && V.nMarks < +goal.minMarks) return false;
  if (goal.maxMarks !== undefined && V.nMarks > +goal.maxMarks) return false;
  if (goal.sort && S.sort !== goal.sort) return false;
  if (goal.labels && !S.labelsOn && !S.label.length) return false;
  return true;
};
P.chartSig = function(){
  /* a "chart" for free mode: at least one measure on Columns/Rows and something to draw; identity = Columns + Rows + mark type */
  var S = this.S, V = this.V;
  if (!V || V.empty || !V.nMarks) return null;
  if (!S.columns.concat(S.rows).some(isMeasure)) return null;
  return JSON.stringify([S.columns.map(specOf), S.rows.map(specOf), V.mark]);
};
P.checkGoal = function(){
  var st = this.q.st, task = this.q.task;
  if (!task) return;
  var ok = false, msg = '';
  if (this.goal){
    ok = this.touched && this.goalMatch(this.goal);
    msg = ok ? '✓ מצוין! הגרף שבניתם תואם את המשימה.' : '';
  } else {
    var sig = this.chartSig(); if (sig && this.touched) this.sigs[sig] = 1;
    var n = Object.keys(this.sigs).length; ok = n >= 2;
    task.hidden = false;
    msg = ok ? '✓ מצוין! בניתם '+n+' גרפים שונים.' : 'גרפים שונים שנבנו: '+n+' מתוך 2';
  }
  if (!ok && this.id && window.FL && FL.isDone && FL.isDone(this.id)) msg = '\u2713 סומן כהושלם בביקור קודם';
  st.textContent = msg; st.className = 'tfp-st'+(ok ? ' ok' : '');
  task.classList.toggle('ok', ok);
  this.ok = ok;
  if (ok && !this.okShown){
    this.okShown = true;
    if (this.id && window.FL && FL.done) { try { FL.done(this.id); } catch(e){} }
  }
};

/* ---- public instance API */
P.drop = function(shelf, spec){
  if (SHELVES.indexOf(shelf) < 0) return -1;
  var self = this, r = -1;
  if (shelf === 'filters'){ var f = findField(String(spec).replace(/^[A-Z]+\((.*)\)$/, '$1')); if (!f) return -1; this.commit(function(){ r = self.addFilter(f); }); return r; }
  var p = parseSpec(spec); if (!p) return -1;
  this.commit(function(){ r = self.place(shelf, p); });
  return r;
};
P.remove = function(shelf, i){ var self = this; this.commit(function(){ if (shelf === 'filters') self.S.filters.splice(i, 1); else self.removeAt(shelf, i); }); };
P.setMark = function(t){ var self = this; if (MARKS.indexOf(t) < 0) return false; this.commit(function(){ self.S.mark = t; }); return true; };
P.setAgg = function(shelf, i, agg){ var self = this, a = AGGALIAS[String(agg).toUpperCase()]; if (!a) return false; this.commit(function(){ var p = self.S[shelf][i]; if (!p) return; p.agg = a; p.cont = true; delete p.part; }); return true; };
P.setPart = function(shelf, i, part, cont){ var self = this; this.commit(function(){ var p = self.S[shelf][i]; if (!p || F(p).kind !== 'date') return; p.agg = null; p.part = String(part).toUpperCase(); p.cont = !!cont; }); };
P.setCont = function(shelf, i, cont){ var self = this; this.commit(function(){ var p = self.S[shelf][i]; if (!p || p.agg) return; p.cont = !!cont; }); };
P.toDimension = function(shelf, i){ var self = this; this.commit(function(){ var q = self.S[shelf][i]; if (!q) return; q.agg = null; if (F(q).kind === 'date') q.part = 'YEAR'; q.cont = false; }); };
P.setSort = function(dir){ var self = this; this.commit(function(){ self.S.sort = dir === 'asc' || dir === 'desc' ? dir : null; }); };
P.setLabels = function(on){ var self = this; this.commit(function(){ self.S.labelsOn = !!on; }); };
P.swapAxes = function(){ var self = this; this.commit(function(){ self.swap(); }); };
P.setFilter = function(field, cfg){
  var f = findField(field); if (!f) return false; var self = this; cfg = cfg || {};
  this.commit(function(){
    var fl = self.S.filters.filter(function(x){ return x.f === f.name; })[0];
    if (!fl){ self.addFilter(f); fl = self.S.filters[self.S.filters.length-1]; }
    if (!fl) return;
    if (fl.kind === 'cat'){
      if (cfg.values){ var keep = {}; cfg.values.forEach(function(v){ keep[v] = 1; }); fl.excl = []; f.dict.forEach(function(n, c){ if (!keep[n]) fl.excl.push(c); }); }
      if (cfg.exclude){ var ex = {}; cfg.exclude.forEach(function(v){ ex[v] = 1; }); fl.excl = []; f.dict.forEach(function(n, c){ if (ex[n]) fl.excl.push(c); }); }
    } else if (fl.kind === 'date'){
      if (cfg.years) fl.years = cfg.years.map(Number); if (cfg.from !== undefined) fl.from = cfg.from; if (cfg.to !== undefined) fl.to = cfg.to;
    } else {
      if (cfg.min !== undefined) fl.min = +cfg.min; if (cfg.max !== undefined) fl.max = +cfg.max; if (cfg.mode) fl.mode = cfg.mode;
    }
  });
  return true;
};
P.clear = function(){ var self = this; this.commit(function(){ self.clearAll(); }); };
P.spec = function(){
  var S = this.S, V = this.V, o = {};
  ['columns','rows','color','size','label','detail'].forEach(function(sh){ o[sh] = S[sh].map(specOf); });
  o.filters = S.filters.map(function(fl){ return fl.f; });
  o.mark = V ? V.mark : S.mark; o.autoMark = V ? V.auto.type : null; o.markSetting = S.mark; o.markRule = V ? V.markRule : null;
  o.sort = S.sort; o.labels = !!S.labelsOn; o.marks = V ? V.nMarks : 0; o.rows_n = V ? V.nrows : 0;
  o.ok = !!this.ok;
  return o;
};
P.marks = function(){ return this.V ? this.V.nMarks : 0; };
P.svgText = function(){
  var svg = this.q.canvas.querySelector('svg'); if (!svg) return '';
  return Array.prototype.map.call(svg.querySelectorAll('text'), function(t){ var c = t.cloneNode(true); Array.prototype.forEach.call(c.querySelectorAll('title'), function(x){ x.remove(); }); return c.textContent; }).join(' | ');
};
P.values = function(){
  var V = this.V; if (!V) return null;
  var dimSpecs = V.lod.map(specOf), meaSpecs = V.mps.map(specOf);
  var gs = V.groups.slice().sort(function(a,b){ for (var i = 0; i < a.codes.length; i++) if (a.codes[i] !== b.codes[i]) return a.codes[i]-b.codes[i]; return 0; });
  return {dims:dimSpecs, measures:meaSpecs, nMarks:V.nMarks, rows:V.nrows, marks:gs.map(function(g){
    return {key:V.lod.map(function(p, i){ return V.accs[i].label(g.codes[i]); }), codes:g.codes.slice(), vals:V.mps.map(function(p){ return g.m[specOf(p)]; })};
  }), order:{
    columns: V.cols.tuples.map(function(t){ return t.map(function(c, i){ return V.lab(V.cols.D[i], c); }); }),
    rows: V.rows.tuples.map(function(t){ return t.map(function(c, i){ return V.lab(V.rows.D[i], c); }); })
  }};
};
P.explanation = function(){ return this.V ? explain(this.S, this.V).map(function(it){ return it.html.replace(/<[^>]+>/g, ''); }) : []; };
P.openFilterUI = function(i){ var pill = this.el.querySelector('.tfp-pill[data-shelf="filters"][data-i="'+i+'"]'); if (pill) this.openFilter(pill, i); };

/* ------------------------------------------------------------------ styles */
function injectStyle(){
  if (document.getElementById('tfp-style')) return;
  var s = document.createElement('style'); s.id = 'tfp-style';
  s.textContent = [
    '.tfp{position:relative;font-family:Heebo,Arial,sans-serif;font-size:14px;line-height:1.45}',
    '.tfp *{box-sizing:border-box}',
    '.tfp-h b{font-size:1rem}.tfp-h small{unicode-bidi:plaintext}',
    '.tfp-task{padding:7px 14px;background:#eff6ff;border-bottom:1px solid #bfdbfe;font-size:.9rem;color:#1e3a8a;display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
    '.tfp-task[hidden]{display:none}',
    '.tfp-task .tt{flex:1;min-width:200px}',
    '.tfp-st{font-weight:800;color:#64748b;font-size:.85rem}.tfp-st.ok{color:#166534;background:#dcfce7;border:1px solid #86efac;border-radius:999px;padding:1px 12px}',
    '.tfp-task.ok{background:#f0fdf4;border-bottom-color:#86efac}',
    '.tfp-bar{align-items:center}',
    '.tfp-bar button:disabled{opacity:.45;cursor:default}',
    '.tfp-bar button[aria-pressed=true]{background:#1b4a8a;color:#fff;border-color:#1b4a8a}',
    '.tfp button:focus-visible,.tfp-f:focus-visible,.tfp-pill:focus-visible,.tfp-drop:focus-visible,.tfp-canvas:focus-visible,.tfp select:focus-visible{outline:2px solid var(--tb-orange,#e8741f);outline-offset:1px}',
    '.tfp-sp{flex:1}',
    '.tfp-selhint{font-size:.8rem;color:#92400e}.tfp-selhint .auto{font:inherit;font-size:.78rem;border:1px solid #e8741f;background:#fff7ed;color:#9a3412;border-radius:6px;padding:0 8px;cursor:pointer}',
    '.tfp-ds{font-size:.72rem;color:#64748b;margin-bottom:4px;unicode-bidi:plaintext}',
    '.tfp-f{touch-action:manipulation}',
    '.tfp-f i{min-width:22px;text-align:center;display:inline-flex;align-items:center;justify-content:center}',
    '.tfp-f.rec span{font-style:italic}',
    '.tfp-f span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.tfp-dragging .tfp-drop{background:#f8fafc}',
    '.tfp-drop{min-height:28px}',
    '.tfp-drop.empty::before{content:"גררו לכאן";font-size:.68rem;color:#94a3b8;direction:rtl;padding:0 4px;unicode-bidi:isolate}',
    '.tfp-pill{user-select:none;touch-action:manipulation;padding:1px 4px 1px 8px;min-height:24px}',
    '.tfp-pill .t{white-space:nowrap;max-width:210px;overflow:hidden;text-overflow:ellipsis}',
    '.tfp-pill u{font-size:.65rem;cursor:pointer}',
    '.tfp-pill .x{font-weight:700;opacity:.55;cursor:pointer;padding:0 3px;border-radius:4px}.tfp-pill .x:hover{opacity:1;background:rgba(0,0,0,.08)}',
    '.tfp-canvas{position:relative;max-height:640px;overflow:auto}',
    '.tfp .tfp-canvas svg.tfp-svg{width:auto;max-width:none;height:auto;display:block}',
    '.tfp-load{padding:44px 12px;text-align:center;color:#64748b}',
    '.tfp-svg text{font-family:Heebo,Arial,sans-serif;font-size:11px;fill:#334155}',
    '.tfp-svg text.at{font-weight:700;fill:#475569}.tfp-svg text.hd{fill:#1e293b;font-size:11.5px}.tfp-svg text.lbl{font-size:10.5px;font-weight:600;paint-order:stroke;stroke:#fff;stroke-width:3px;stroke-linejoin:round}.tfp-svg text.tx{font-weight:600}',
    '.tfp-svg .mk{transition:opacity .1s}.tfp-svg .mk:hover{opacity:.78;stroke:#0f172a;stroke-width:1.2}',
    '.tfp-legend{background:#fff;padding:0 10px 8px;border-top:0;display:flex;gap:16px;flex-wrap:wrap;font-size:.76rem;color:#334155}',
    '.tfp-lg{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.tfp-lg b{color:#475569}.tfp-lg span{display:inline-flex;align-items:center;gap:4px}',
    '.tfp-lg i{width:12px;height:12px;border-radius:3px;display:inline-block}',
    '.tfp-lg .gr em{font-style:normal}.tfp-lg .gb{width:110px;height:10px;border-radius:3px}',
    '.tfp-marks{display:flex;flex-direction:column;gap:6px}',
    '.tfp-marks h6{display:flex;justify-content:space-between;gap:6px;align-items:baseline}',
    '.tfp-cnt{text-transform:none;letter-spacing:0;color:#1e3a8a;font-weight:700}',
    '.tfp-mt{width:100%;font:inherit;font-size:.8rem;border:1px solid #c7cfd9;border-radius:6px;padding:3px 6px;background:#fff}',
    '.tfp-mtnow{font-size:.72rem;color:#64748b;min-height:1em}',
    '.tfp-mk4{display:grid;grid-template-columns:1fr;gap:6px}',
    '.tfp-mkz .tfp-pill .t{max-width:96px}',
    '.tfp-mkz{border:1px solid #e2e8f0;border-radius:8px;padding:3px 4px;background:#fafbfc;min-width:0}',
    '.tfp-mkz .tfp-drop{border:1px dashed #cbd5e1;margin-top:2px;padding:1px 2px}',
    '.tfp-mkt{font-size:.66rem;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:.4px}',
    '.tfp-why{border-top:1px solid #fde68a}.tfp-why h5{margin:0 0 4px;font-size:.95rem;color:#92400e}',
    '.tfp-why ul{margin:0;padding-inline-start:1.2em}.tfp-why li{margin:3px 0}.tfp-why li.warn{color:#9a3412;font-weight:600;background:#ffedd5;border-radius:6px;padding:1px 6px;list-style-position:inside}',
    '.tfp .n{direction:ltr;unicode-bidi:isolate;display:inline-block;font-weight:600;background:#fff;border:1px solid #fde68a;border-radius:5px;padding:0 5px;font-size:.85em}',
    '.tfp-selhint .n,.tfp-lim .n{background:none;border:0;padding:0}',
    '.tfp-lim{background:#f8fafc;border-top:1px solid #e2e8f0;padding:6px 14px;font-size:.82rem;color:#475569}.tfp-lim summary{cursor:pointer;font-weight:700}.tfp-lim ul{margin:6px 0 2px;padding-inline-start:1.2em}',
    '.tfp-pop{position:fixed;z-index:9999;background:#fff;border:1px solid #94a3b8;border-radius:10px;box-shadow:0 12px 32px rgba(15,23,42,.25);padding:6px;min-width:190px;max-width:min(340px,92vw);max-height:70vh;overflow:auto;font-family:Heebo,Arial,sans-serif;font-size:.85rem;color:#0f172a;text-align:left}',
    '.tfp-menu{direction:ltr}.tfp-menu h6{margin:6px 6px 2px;font-size:.66rem;color:#64748b;text-transform:uppercase;letter-spacing:.5px}',
    '.tfp-menu button{display:block;width:100%;text-align:left;font:inherit;border:0;background:none;padding:4px 10px;border-radius:6px;cursor:pointer;color:inherit;white-space:pre}',
    '.tfp-menu button:hover,.tfp-menu button:focus-visible{background:#eef2f7}.tfp-menu button.on{font-weight:800;color:#1b4a8a}',
    '.tfp-menu hr{border:0;border-top:1px solid #e2e8f0;margin:4px 0}',
    '.tfp-filter{min-width:230px}.tfp-filter h6{margin:2px 4px 6px;font-size:.78rem;color:#334155}',
    '.tfp-filter .fb{display:flex;gap:6px;flex-wrap:wrap;margin:5px 2px;align-items:center}',
    '.tfp-filter button{font:inherit;font-size:.78rem;border:1px solid #c7cfd9;background:#fff;border-radius:6px;padding:2px 9px;cursor:pointer}',
    '.tfp-filter .fl{max-height:220px;overflow:auto;border:1px solid #e2e8f0;border-radius:6px;padding:4px}.tfp-filter .fl label,.tfp-filter .fy label{display:block;white-space:nowrap;padding:1px 2px;cursor:pointer}',
    '.tfp-filter input[type=search],.tfp-filter input[type=number],.tfp-filter input[type=date],.tfp-filter select{font:inherit;font-size:.8rem;border:1px solid #c7cfd9;border-radius:6px;padding:2px 6px;max-width:100%}',
    '.tfp-filter input[type=number]{width:90px}.tfp-filter .fn{font-size:.72rem;color:#92400e}.tfp-filter .fr{display:flex;gap:8px;flex-wrap:wrap;margin:4px 2px}.tfp-filter .fy{display:flex;gap:10px;margin:2px}',
    '@media(max-width:820px){',
    ' .tfp-side{border-right:0;border-bottom:1px solid #d5dbe3;max-height:none}',
    ' .tfp-dl,.tfp-ml{display:flex;flex-wrap:wrap;gap:3px}.tfp-f{border:1px solid #e2e8f0;padding:3px 7px}',
    ' .tfp-marks{border-left:0;border-top:1px solid #d5dbe3}',
    ' .tfp-mk4{grid-template-columns:repeat(4,1fr)}',
    ' .tfp-mkz .tfp-pill .t{max-width:150px}',
    ' .tfp-shelf>b{width:56px}',
    '}',
    '@media(max-width:560px){.tfp-mk4{grid-template-columns:1fr 1fr}.tfp-pill .t{max-width:150px}.tfp-canvas{padding:4px}}',
    '@media(prefers-reduced-motion:reduce){.tfp-svg .mk{transition:none}}'
  ].join('\n');
  document.head.appendChild(s);
}

/* ------------------------------------------------------------------ bootstrap */
function init(el){ if (el._tfp) return el._tfp; var i = new Inst(el); INST.push(i); return i; }
function initAll(){
  injectStyle();
  var els = Array.prototype.slice.call(document.querySelectorAll('.tfp'));
  pending++;
  els.forEach(init);
  pending--; fireReadyIfDone();
}
window.TFP = {
  __v: 1,
  get: function(el){ if (typeof el === 'string') el = document.querySelector(el); return el ? (el._tfp || null) : null; },
  all: function(){ return INST.slice(); },
  init: function(el){ injectStyle(); return init(el); },
  ready: function(cb){ if (readyFired) { cb(); return; } readyCbs.push(cb); }
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll); else initAll();
})();
