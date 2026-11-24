/* ===== activities: sorter, order, pick, compose, hands-on timer, text checker ===== */
const say=(fb,ok,html)=>{fb.classList.remove('good','wrong','half');if(ok===true)fb.classList.add('good');else if(ok===false)fb.classList.add('wrong');else if(ok==='half')fb.classList.add('half');fb.innerHTML=html;};
const plainT=h=>{const d=document.createElement('div');d.innerHTML=h;return d.textContent;};

/* sorter: each row has one right answer */
$$('.sorter').forEach(b=>{const rows=$$('.srow',b),fb=$('.fbbar',b),sc=$('.score',b);
 const upd=()=>{const d=rows.filter(r=>r.classList.contains('solved')).length;sc.textContent=d+' / '+rows.length;if(d===rows.length){b.classList.add('solved');say(fb,true,'כל השורות נכונות. '+fb.innerHTML);}};
 rows.forEach(r=>{const a=+r.dataset.a;$$('.so',r).forEach(o=>o.addEventListener('click',()=>{if(r.classList.contains('solved'))return;const i=+o.dataset.i;
  if(i===a){o.classList.add('ok');r.classList.add('solved');$$('.so',r).forEach(x=>x.classList.remove('bad'));say(fb,true,'<b>נכון.</b> '+r.dataset.w);upd();}
  else{o.classList.add('bad');say(fb,false,'<b>לא.</b> קראו שוב את השורה, ונסו אפשרות אחרת.');}}));});
 $('.rst',b).addEventListener('click',()=>{rows.forEach(r=>{r.classList.remove('solved');$$('.so',r).forEach(x=>x.classList.remove('ok','bad'));});b.classList.remove('solved');say(fb,null,'בחרו תשובה בכל שורה.');sc.textContent='0 / '+rows.length;});});

/* order: click the steps in the right order */
$$('.order').forEach(b=>{const pool=$('.opool',b),track=$('.otrack',b),fb=$('.fbbar',b),sc=$('.score',b);const chips=$$('.oc',pool);const n=chips.length;let k=0;const home=chips.slice();
 chips.forEach(c=>c.addEventListener('click',()=>{if(c.classList.contains('placed'))return;if(+c.dataset.i===k){c.classList.add('placed');c.classList.remove('bad');const li=document.createElement('li');li.innerHTML='<b>'+c.innerHTML+'</b><span>'+c.dataset.w+'</span>';track.appendChild(li);k++;sc.textContent=k+' / '+n;
   if(k===n){b.classList.add('solved');say(fb,true,'<b>הסדר נכון.</b> קראו את הנימוק שליד כל שלב.');}else say(fb,true,'<b>נכון.</b> '+c.dataset.w+' מה השלב הבא?');}
  else{c.classList.add('bad');setTimeout(()=>c.classList.remove('bad'),700);say(fb,false,'<b>עדיין לא.</b> '+b.dataset.hint);}}));
 $('.rst',b).addEventListener('click',()=>{k=0;track.innerHTML='';home.forEach(c=>c.classList.remove('placed','bad'));b.classList.remove('solved');sc.textContent='0 / '+n;say(fb,null,'לחצו על השלב שבא ראשון.');});});

/* pick: find every right item */
$$('.pick').forEach(b=>{const items=$$('.pk',b),fb=$('.fbbar',b),sc=$('.score',b);const nr=items.filter(x=>x.dataset.ok==='1').length;
 const upd=()=>{const d=items.filter(x=>x.classList.contains('ok')).length;sc.textContent=d+' / '+nr;if(d===nr){b.classList.add('solved');say(fb,true,'<b>מצאתם את כולם.</b> '+fb.innerHTML.replace(/^<b>נכון\.<\/b> /,''));}};
 items.forEach(x=>x.addEventListener('click',()=>{if(x.classList.contains('ok')||x.classList.contains('bad'))return;if(x.dataset.ok==='1'){x.classList.add('ok');say(fb,true,'<b>נכון.</b> '+x.dataset.w);upd();}else{x.classList.add('bad');say(fb,false,'<b>לא מתאים.</b> '+x.dataset.w);}}));
 $('.rst',b).addEventListener('click',()=>{items.forEach(x=>x.classList.remove('ok','bad'));b.classList.remove('solved');sc.textContent='0 / '+nr;say(fb,null,'לחצו על כל פריט שלדעתכם מתאים.');});});

/* compose: one option per row, the text is assembled, with a quality meter */
$$('.compose').forEach(b=>{const rows=$$('.crow',b),fb=$('.fbbar',b),sc=$('.score',b),out=$('.ctext',b),bar=$('.meter i',b),ml=$('.mlab',b);
 const upd=()=>{const ch=rows.map(r=>$('.co.on',r));const txt=ch.filter(Boolean).map(c=>c.textContent.trim()).join(' ');out.textContent=txt||'בחרו ניסוח בכל שורה, והטקסט ייבנה כאן.';
  const tot=ch.reduce((s,c)=>s+(c?+c.dataset.s:0),0),best=ch.filter(c=>c&&c.dataset.s==='2').length;const p=Math.round(tot/(rows.length*2)*100);bar.style.width=p+'%';bar.style.background=p<50?'#e5484d':p<100?'#e8960c':'#25a65f';
  ml.textContent=ch.some(Boolean)?('איכות: '+p+'%'+(p===100?' · ניסוח מלא':'')):'איכות: טרם נבחר';sc.textContent=best+' / '+rows.length;b.classList.toggle('solved',best===rows.length);return best===rows.length;};
 rows.forEach(r=>$$('.co',r).forEach(c=>c.addEventListener('click',()=>{$$('.co',r).forEach(x=>x.classList.remove('on','s0','s1','s2'));c.classList.add('on','s'+c.dataset.s);const all=upd();
  const s=+c.dataset.s;say(fb,s===2?true:s===1?'half':false,(s===2?'<b>ניסוח טוב.</b> ':s===1?'<b>חלקי.</b> ':'<b>חלש.</b> ')+c.dataset.w+(all?' <b>כל החלקים במיטבם.</b>':''));})));
 $('.rst',b).addEventListener('click',()=>{$$('.co',b).forEach(x=>x.classList.remove('on','s0','s1','s2'));upd();say(fb,null,'בחרו ניסוח אחד בכל שורה. אפשר להחליף בחירה.');});});

/* hands-on countdown */
$$('.tmr').forEach(t=>{const clock=t.parentElement.querySelector('.tclock');let left=0,h=null;const m=+t.dataset.m;const draw=()=>{const a=Math.floor(left/60),s=left%60;clock.textContent=String(a).padStart(2,'0')+':'+String(s).padStart(2,'0');clock.classList.toggle('end',left===0&&h===null&&t.dataset.ran==='1');};
 t.addEventListener('click',()=>{if(h){clearInterval(h);h=null;t.textContent='⏱ התחילו '+m+' דקות';left=m*60;t.dataset.ran='';draw();return;}left=m*60;t.dataset.ran='1';t.textContent='⏹ עצירה ואיפוס';draw();h=setInterval(()=>{left--;if(left<=0){left=0;clearInterval(h);h=null;t.textContent='⏱ התחילו '+m+' דקות';toast('הזמן הסתיים');}draw();},1000);});});

/* text checker: rule based feedback on a requirement, a user story or a prompt */
const VAGUE=['מהיר','מהירה','ידידותי','ידידותית','נוח','נוחה','יעיל','יעילה','קל','קלה','טוב','טובה','פשוט','פשוטה','מודרני','מודרנית','גמיש','גמישה','איכותי','איכותית','חכם','חכמה','מתקדם','מתקדמת','בהקדם','בערך','וכו'];
const has=(t,arr)=>arr.some(w=>t.includes(w));
const RULES={
 req:[['מי המשתמש','כתוב מי משתמש או מי אחראי',t=>has(t,['המשתמש','הלקוח','המלצר','המנהל','העובד','הנציג','המערכת','המזמין','השף','הטבח','המוקדן','הרכז','המתנדב','התורם','הסטודנט','המרצה','בעל ','בעלת ','מנהל','לקוח','עובד'])],
      ['מה הפעולה','יש פועל ברור: מה המערכת עושה',t=>has(t,['תציג','תשלח','תשמור','תחשב','תאפשר','תתריע','תעדכן','תרשום','תפיק','תבדוק','תסמן','יקבל','תקבל','יוכל','תוכל','יראה','תראה','מציג','שולח','שומר','מחשב','מאפשר','מתריע','מעדכן'])],
      ['מספר שאפשר למדוד','יש מספר: זמן, כמות או אחוז',t=>/\d/.test(t)],
      ['בלי מילים עמומות','אין מילים כמו מהיר, נוח, ידידותי',t=>!VAGUE.some(w=>new RegExp('(^|[\\s,.])'+w+'([\\s,.]|$)').test(t))],
      ['באיזה מצב','כתוב מתי או באיזה תנאי',t=>has(t,['כאשר','כש','אם ','בעת','לאחר','אחרי','לפני','בתוך','עד ','בכל '])]],
 story:[['בתור מי','פותח בתפקיד: בתור ...',t=>/(^|\s)(בתור|כ[א-ת]{3,})/.test(t)],
      ['מה רוצים','כתוב מה המשתמש רוצה לעשות',t=>has(t,['אני רוצה','ברצוני','אני צריך','אני צריכה','אני מבקש','אני מבקשת'])],
      ['בשביל מה','כתובה התועלת: כדי ש...',t=>has(t,['כדי ','על מנת','כך ש'])],
      ['תועלת, לא פתרון','לא נקוב כפתור, מסך או טכנולוגיה',t=>!has(t,['כפתור','מסך','טבלה','אפליקציה','SQL','דאטהבייס','בסיס נתונים','אקסל','Excel'])]],
 prompt:[['הקשר','מי אנחנו ומה המצב (הקשר)',t=>has(t,['אני ','אנחנו','הארגון','העסק','החברה','העמותה','המסעדה','אצלנו','רקע','הקשר'])&&t.length>60],
      ['משימה','פועל ברור: מה מבקשים שייעשה',t=>has(t,['כתוב','נסח','סכם','הצע','בנה','צור','השווה','בדוק','מיין','דרג','הפק','תכנן','זהה','פרט','הסבר'])],
      ['אילוצים','מה אסור, מה חובה, על מה להתבסס',t=>has(t,['אל ','בלי ','ללא ','רק ','לכל היותר','לא יותר','חובה','אסור','אם אינך','אם חסר','אל תמציא','התבסס'])],
      ['פורמט','איך התשובה צריכה להיראות',t=>has(t,['טבלה','רשימה','סעיפים','שורות','עמודות','פסקה','משפטים','נקודות','כותרת','בעברית','פורמט'])],
      ['בקשה לשאלות הבהרה','מזמינים את העוזר לשאול לפני שהוא עונה',t=>has(t,['שאל אותי','שאלות הבהרה','שאל שאלות','אם חסר'])]]};
$$('.checker').forEach(b=>{const R=RULES[b.dataset.kind],ta=$('.ckin',b),list=$('.cklist',b),bar=$('.meter i',b),ml=$('.mlab',b);
 list.innerHTML=R.map(r=>'<li><i>○</i><span><b>'+r[0]+'</b>'+r[1]+'</span></li>').join('');
 const run=()=>{const t=ta.value.trim();if(t.length<8){ml.textContent='כתבו לפחות משפט אחד, ואז לחצו על ״בדקו״';return -1;}let ok=0;$$('li',list).forEach((li,i)=>{const g=!!R[i][2](t);li.className=g?'g':'b';$('i',li).textContent=g?'✔':'✘';if(g)ok++;});
  const p=Math.round(ok/R.length*100);bar.style.width=p+'%';bar.style.background=p<50?'#e5484d':p<100?'#e8960c':'#25a65f';ml.textContent=ok===R.length?'כל הרכיבים נמצאו. עכשיו בדקו בעצמכם: האם התוכן נכון?':('נמצאו '+ok+' מתוך '+R.length+'. השלימו את מה שמסומן ב-✘ ובדקו שוב.');b.classList.toggle('solved',ok===R.length);return ok;};
 b.__run=run;$('.chk',b).addEventListener('click',run);$('.exb',b).addEventListener('click',e=>{ta.value=e.currentTarget.dataset.ex;run();});
 $('.rst',b).addEventListener('click',()=>{ta.value='';$$('li',list).forEach(li=>{li.className='';$('i',li).textContent='○';});bar.style.width='0';ml.textContent='כתבו ניסוח ולחצו על ״בדקו״';b.classList.remove('solved');});});


/* query visualiser: the table reacts to the clause that was just revealed */
$$('.qviz').forEach(v=>{const eff=JSON.parse(v.dataset.eff),steps=$$('.qstep',v),tb=$('tbody',v),rows=$$('tbody tr',v);
 const sync=()=>{const k=steps.filter(s=>s.classList.contains('show')).length;let cols=null,keep=null,order=null,warn=null;for(let i=1;i<=k;i++){const e=eff[i];if(!e)continue;if(e.cols)cols=e.cols;if(e.rows)keep=e.rows;if(e.order)order=e.order;warn=e.warn||null;}
  $$('[data-c]',v).forEach(c=>{c.classList.toggle('chl',!!cols&&cols.includes(+c.dataset.c));c.classList.toggle('cdim',!!cols&&!cols.includes(+c.dataset.c));});
  rows.forEach(r=>{r.classList.toggle('rout',!!keep&&!keep.includes(+r.dataset.r));r.classList.toggle('rwarn',!!warn&&warn.includes(+r.dataset.r));});steps.forEach((st,i)=>st.classList.toggle('qbad',!!(eff[i+1]&&eff[i+1].warn)&&i===k-1));(order||rows.map((_,i)=>i)).forEach(i=>tb.appendChild(rows[i]));
  steps.forEach((s,i)=>s.classList.toggle('qcur',i===k-1));};
 const code=$('.qcode',v),opt={attributes:true,subtree:true,attributeFilter:['class']};const mo=new MutationObserver(()=>{mo.disconnect();sync();mo.takeRecords();mo.observe(code,opt);});mo.observe(code,opt);sync();});


/* static slides use the whole height: the body is enlarged until it fills the slide */
function fitSlides(){const k=()=>stage.getBoundingClientRect().width/1280||1;
 slides.forEach(s=>{if(s.classList.contains('pd')||s.classList.contains('s1')||s.querySelector('.order,.checker,.memew,.mc'))return;
  const grows=!!s.querySelector('.act:not(.sorter),.mc');const LIM=grows?612:664;
  const kids=[...s.children].filter(c=>!c.matches('.kick,h2,.ft,.toon,.crumb'));if(!kids.length)return;kids.forEach(c=>c.style.zoom='');
  const bottom=()=>{const sr=s.getBoundingClientRect();return Math.max(...kids.map(c=>c.getBoundingClientRect().bottom-sr.top))/k();};
  const top=(kids[0].getBoundingClientRect().top-s.getBoundingClientRect().top)/k();const room=LIM-top,h=bottom()-top;if(h<=0||h>room*0.95)return;
  let z=Math.min(1.7,room/h);for(let i=0;i<20&&z>1.03;i++){kids.forEach(c=>c.style.zoom=z);if(bottom()<=LIM)break;z-=0.035;}
  if(z<=1.03||bottom()>LIM)kids.forEach(c=>c.style.zoom='');});}
(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(fitSlides);window.__fitSlides=fitSlides;
