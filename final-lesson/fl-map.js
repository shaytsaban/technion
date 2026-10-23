/* Course map: one table of topics, each linked to the capstone section and to the original lecture pages. */
(function(){
'use strict';
const SRC = {
 'index.html':'מבוא: נתון, מידע, מסד נתונים','lec1_part2.html':'1 ב׳: CREATE ו-INSERT','lec1_part3.html':'1 ג׳: טעינת נתונים','lec1_part4.html':'1 ד׳: סינון וצבירה','lec_1_part5.html':'1 ה׳: מלכודות AI וסנדבוקס',
 'lec2.1.html':'2.1: JOIN','lec2.2.html':'2.2: GROUP BY','lecture2.3.html':'2.3: NULL, CASE ותאריכים','lec2.4.html':'2.4: SQL בעידן ה-AI',
 'lec3.1.html':'3.1: ארכיטקטורה ו-API','lec3.2.html':'3.2: Backend ב-Apps Script','lec3.3.html':'3.3: לוח מחוונים',
 'lec4part1-11.5.2026.html':'הרצאה 4: מ-Use Case ל-SQL','lec5.html':'הרצאה 5: מאפיון ו-ERD','lec51.html':'5.1: כלי AI','lec6.html':'הרצאה 6: בנייה ב-Supabase',
 'lec7.0.html':'7.0: Antigravity','lec7.1.html':'7.1: צ׳אטבוט','lec7.2.html':'7.2: AI Studio','lec7.4.html':'7.4: חיבור ל-MCP ולמסד','lec7.5.html':'7.5: חיפוש סמנטי','lec7.6.html':'7.6: מיליון משתמשים',
 'lec8.1.html':'הרצאה 8: תדריך הפרויקט','lec9.html':'הרצאה 9: AI מקומי','lec9.1.html':'9.1: כלים וארכיטקטורה',
 'lec10part1-15.6.2026.html':'למה דוח משקר (JOIN)','lec10part2-15.6.2026.html':'OLTP מול OLAP','lec10part3-15.6.2026.html':'ETL','lec10part4-15.6.2026.html':'AI כותב SQL, מי מאמת','lec10part5-15.6.2026.html':'JSON ו-BigQuery','lec10part6-15.6.2026.html':'GROUP BY (BigQuery)','lec10part7-15.6.2026.html':'פונקציות חלון','lec10part8-15.6.2026.html':'CTE ותת-שאילתות','lec10part9-15.6.2026.html':'תאריכים ב-BigQuery','lec10part10-15.6.2026.html':'סוגי JOIN','lec10part11-15.6.2026.html':'איכות נתונים','lecture10part2-15.6.2026.html':'ארכיטקטורת נתונים ו-BI',
 'lec11-part1.html':'מקליק למסד התפעולי','lec11-part2.1.html':'מ-OLTP ל-OLAP','lec11-part2.2.html':'דשבורדים וכלי BI','lecture12.html':'הרצאה 12: פרוצדורות, טריגרים ו-NoSQL','lecture13.html':'הרצאה 13: Cloud Shell ופריסה',
 'lecture14.html':'14 א׳: מתהליך לנתונים','lecture14-2.html':'14 ב׳: מודדים','lecture14-3.html':'14 ג׳: AI והתראות','lecture14-4.html':'14 ד׳: אחרי העלייה לאוויר','tableau-4h/tableau-4h.html':'Tableau Public'
};
const PCOL = {1:'#4f46e5',2:'#0f766e',3:'#b45309',4:'#0369a1',5:'#7c3aed',6:'#be123c'};
const PNAME = {1:'מרעיון לטבלאות',2:'SQL: לשאול את הנתונים',3:'איך המערכת עובדת מאחורי הקלעים',4:'מנתונים לדוחות שאפשר לסמוך עליהם',5:'AI: מה נותנים לו ומה בודקים',6:'הפרויקט: לעקוב, להחליט, למסור'};
// id, part, section id in the capstone, title, one plain line, source files
const N = [
 ['nd',1,'s1-2','נתון, מידע, החלטה','מספר לבד לא אומר כלום. הקשר הופך אותו להחלטה.',['index.html']],
 ['xl',1,'s1-3','אקסל או מסד נתונים','מתי אקסל מספיק ומתי צריך מסד אמיתי.',['index.html']],
 ['tb',1,'s1-4','טבלאות וסוגי נתונים','עמודות עם סוג, כדי שלא יכנסו ״יקר״ בעמודת מחיר.',['index.html','lec1_part2.html']],
 ['pk',1,'s1-5','מפתח ראשי ומפתח זר','איך שורה מזהה את עצמה ואיך טבלה מצביעה על טבלה אחרת.',['index.html']],
 ['er',1,'s1-6','אפיון ו-ERD','מתיאור עסקי לישויות, קשרים ותרשים.',['lec4part1-11.5.2026.html','lec5.html']],
 ['sb',1,'s1-7','בונים ב-Supabase','מסד PostgreSQL בענן: טבלאות, נתונים וסכמה.',['lec6.html']],
 ['cr',1,'s1-8','CREATE, INSERT, SELECT ו-CRUD','שלוש הפקודות הראשונות ובדיקה של SQL שה-AI כתב.',['lec1_part2.html','lec1_part3.html']],
 ['se',2,'s2-1','SELECT וסינון','WHERE, ORDER BY, LIKE, IN, BETWEEN.',['lec1_part4.html','lec_1_part5.html']],
 ['jo',2,'s2-2','JOIN','חיבור טבלאות: INNER, LEFT ומה קורה בלי ON.',['lec2.1.html','lec10part10-15.6.2026.html']],
 ['gb',2,'s2-3','GROUP BY ו-HAVING','מקבצים שורות ומחשבים לכל קבוצה. סדר הביצוע.',['lec2.2.html','lec10part6-15.6.2026.html']],
 ['fo',2,'s2-4','מספר שהוכפל בשקט','JOIN שמכפיל שורות והסכום יוצא גדול מדי.',['lec10part1-15.6.2026.html','lec2.4.html']],
 ['nu',2,'s2-5','NULL, CASE ותאריכים','ערך חסר, תוויות עסקיות ועבודה עם תאריכים.',['lecture2.3.html','lec10part9-15.6.2026.html']],
 ['cw',2,'s2-6','CTE ופונקציות חלון','שאלה בשלבים, סכום מצטבר ודירוג.',['lec10part8-15.6.2026.html','lec10part7-15.6.2026.html']],
 ['js',2,'s2-7','JSON ו-BigQuery','אירועים מהאפליקציה ומחסן הנתונים של גוגל.',['lec10part5-15.6.2026.html']],
 ['dm',2,'s2-8','UPDATE, DELETE וטרנזקציה','לשנות בלי להרוס: WHERE, בדיקה לפני, ROLLBACK.',['lec1_part3.html','lec1_part4.html']],
 ['sw',2,'s2-9','מספרים שנראים נכון ואינם','שאילתות שרצות בלי שגיאה ונותנות תשובה שגויה.',['lec2.4.html','lec10part10-15.6.2026.html']],
 ['hc',3,'s3-1','מהקליק עד המטבח','הדרך של הזמנה: דפדפן, שרת, מסד ובחזרה.',['lec11-part1.html','lec3.1.html']],
 ['ht',3,'s3-2','HTTP ו-JSON','איך הדפדפן והשרת מדברים ובאיזה פורמט.',['lec11-part1.html']],
 ['bk',3,'s3-3','שרת, מפתחות וסודות','למה רק השרת מדבר עם המסד ואיפה שומרים מפתחות.',['lec3.1.html','lec3.2.html','lec3.3.html','lec7.4.html']],
 ['ac',3,'s3-4','טרנזקציות ו-ACID','הכול או כלום, כדי שהזמנה לא תישמר חצי.',['lec11-part1.html']],
 ['pt',3,'s3-5','פרוצדורות וטריגרים','חוקים שרצים בתוך המסד.',['lecture12.html']],
 ['ns',3,'s3-6','SQL מול NoSQL','טבלאות מול מסמכים ומתי כל אחד מתאים.',['lecture12.html']],
 ['sc',3,'s3-7','עומסים: איזון, מטמון, עותקים','מה עושים כשהרבה לקוחות לוחצים יחד.',['lecture12.html','lec7.6.html']],
 ['vs',3,'s3-8','חיפוש לפי משמעות ועדכון חי','וקטורים ו-WebSockets.',['lec7.5.html']],
 ['dp',3,'s3-9','פריסה: Cloud Shell, GitHub, Neon, Render','איך קוד מהמחשב שלי נהיה אתר חי.',['lecture13.html']],
 ['oo',4,'s4-1','מערכת חיה מול מערכת דוחות','למה לא מריצים דוחות כבדים על המסד של ההזמנות.',['lec10part2-15.6.2026.html','lec11-part2.1.html']],
 ['co',4,'s4-2','אחסון בעמודות','למה מחסן נתונים קורא רק מה שצריך.',['lecture10part2-15.6.2026.html']],
 ['et',4,'s4-3','ETL','לחלץ, לנקות ולטעון.',['lec10part3-15.6.2026.html','lec11-part2.1.html']],
 ['st',4,'s4-4','סכמת כוכב','טבלת עובדות באמצע וטבלאות הקשר מסביב.',['lec11-part2.1.html']],
 ['dq',4,'s4-5','איכות נתונים','ארבע תקלות שגורמות למספר להיות לא נכון.',['lec10part11-15.6.2026.html']],
 ['gv',4,'s4-6','הגדרה אחת לכל מדד','שלושה אנשים, שלושה מספרים להכנסות.',['lecture10part2-15.6.2026.html']],
 ['vw',4,'s4-6v','VIEW: חלון לכל בעל עניין','כל בעל תפקיד רואה רק את העמודות והשורות שהוא צריך.',['lec6.html','lecture10part2-15.6.2026.html','lecture12.html']],
 ['ln',4,'s4-7','שושלת נתונים','מאיפה המספר הגיע ואיך מוצאים את התקלה.',['lecture10part2-15.6.2026.html']],
 ['lk',4,'s4-8','אגם, מחסן, אצווה וזרימה','איפה שומרים נתונים ומתי מעדכנים.',['lecture10part2-15.6.2026.html']],
 ['bi',4,'s4-9','דשבורדים ו-BI','מה בונים ולמי. Looker Studio ו-Tableau.',['lec11-part2.2.html','lec3.3.html','tableau-4h/tableau-4h.html']],
 ['pr',5,'s5-1','פרומפט בארבעה חלקים','הקשר, משימה, אילוצים ופורמט. פרומפט לכל שכבה.',['lec5.html','lec3.2.html','lec3.3.html']],
 ['tr',5,'s5-2','שלוש המלכודות','המצאה, חוסר הקשר והסכמה יתר.',['lec5.html','lec1_part2.html']],
 ['au',5,'s5-3','ביקורת על SQL של AI','מריצים ובודקים לפני שסומכים.',['lec2.4.html','lec1_part4.html','lec10part4-15.6.2026.html']],
 ['lm',5,'s5-5','איפה ה-AI רץ','ענן מול מקומי, טמפרטורה ופרטיות.',['lec51.html','lec_1_part5.html','lec9.html','lec9.1.html']],
 ['mc',5,'s5-6','API, MCP וסוכנים','איך מחברים מודל לכלים ולנתונים.',['lec51.html','lec7.4.html','lec8.1.html']],
 ['rg',5,'s5-7','זיכרון ו-RAG','איך המודל ״יודע״ דברים שלא למד.',['lec9.1.html']],
 ['lg',5,'s5-7f','LangChain ו-LangGraph','מסגרות לבניית סוכנים: גרף, זיכרון משותף ואישור אנושי.',['lec9.1.html','lec9.html','lec51.html']],
 ['dv',5,'s5-8','כלי פיתוח עם AI','AI Studio, Antigravity ומלכודות של בנייה עם סוכן.',['lec7.0.html','lec7.1.html','lec7.2.html']],
 ['t2',5,'s5-9','Text-to-SQL','איך מאמתים שאילתה שכתב מודל.',['lec10part4-15.6.2026.html']],
 ['tc',6,'s6-1','פרוסה דקה ועקיבות','מהצורך ועד הבדיקה, בלי לאבד חוליה.',['lec8.1.html']],
 ['pd',6,'s6-2','פרויקט כבעיית נתונים','משימות, תקציב וסיכונים כטבלאות.',['lecture14.html']],
 ['qc',6,'s6-3','בדיקה לפני דיווח','מספר בלי בדיקה הוא דעה.',['lecture14-2.html']],
 ['th',6,'s6-4','שלושה מספרים במשפט','זמן, כסף ועבודה.',['lecture14-2.html']],
 ['fc',6,'s6-5','תחזית, ספים ורמזור','מתי נדלקת נורה אדומה.',['lecture14-2.html']],
 ['ai',6,'s6-6','AI מנסח, אדם חותם','דוח סטטוס שה-AI כתב ומה בודקים בו.',['lecture14-3.html']],
 ['al',6,'s6-7','התראות והחלטות','שאילתה, סף ושעון. ומה מחליטים.',['lecture14-3.html']],
 ['oc',6,'s6-8','תוצר מול תוצאה','האם המערכת באמת עובדת, ואיך לא לטעות בסיבתיות.',['lecture14-4.html']],
 ['fi',6,'s6-9','אתגר הגמר','שאלה עסקית אחת, מקצה לקצה.',['lecture14.html','lecture14-2.html','lecture14-3.html','lecture14-4.html']],
];
const $ = (s,r)=>(r||document).querySelector(s), $$ = (s,r)=>Array.from((r||document).querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// every page of the course, in course order: group, file, plain description
const CAT = [
 ['פתיחה: מסדי נתונים ו-SQL ראשון','index2.html','פורטל הקורס: רשימת כל ההרצאות בשני המודולים.'],
 ['פתיחה: מסדי נתונים ו-SQL ראשון','index.html','ה-AI כקבלן והאדריכל כמחליט, נתון מול מידע, אקסל מול מסד נתונים, טבלאות, סוגי נתונים ומפתחות.'],
 ['פתיחה: מסדי נתונים ו-SQL ראשון','lec1_part2.html','CREATE, INSERT ו-SELECT, ובדיקה של SQL ש-AI כתב.'],
 ['פתיחה: מסדי נתונים ו-SQL ראשון','lec1_part3.html','טעינת נתונים בייבוא וב-API, למה INSERT בלי שמות עמודות שביר, WHERE לפי מפתח.'],
 ['פתיחה: מסדי נתונים ו-SQL ראשון','lec1_part4.html','DELETE ו-UPDATE, סינון, צבירות ומלכודות של AI.'],
 ['פתיחה: מסדי נתונים ו-SQL ראשון','lec_1_part5.html','אותו חומר, ועוד איזה AI לבחור: ענן מול מקומי.'],
 ['SQL: JOIN, קיבוץ ושיפוט','lec2.1.html','JOIN: טבלאות קשורות, INNER מול LEFT, מכפלה קרטזית.'],
 ['SQL: JOIN, קיבוץ ושיפוט','lec2.2.html','GROUP BY, פונקציות צבירה, WHERE מול HAVING וסדר הביצוע.'],
 ['SQL: JOIN, קיבוץ ושיפוט','lecture2.3.html','NULL, COALESCE, CASE ותאריכים.'],
 ['SQL: JOIN, קיבוץ ושיפוט','lec2.4.html','סדנה: שגיאות לוגיות ש-AI מייצר, וסימולציות לבדיקה.'],
 ['ארכיטקטורה ובנייה עם AI','lec3.1.html','ארכיטקטורת אפליקציה: דפדפן, Apps Script ו-API כמלצר.'],
 ['ארכיטקטורה ובנייה עם AI','lec3.2.html','פרומפט לשכבת ה-Backend ב-Apps Script והפעלה כ-Web App.'],
 ['ארכיטקטורה ובנייה עם AI','lec3.3.html','פרומפט ללוח המחוונים ובדיקות.'],
 ['ארכיטקטורה ובנייה עם AI','lec4part1-11.5.2026.html','מ-Use Case ל-SQL ולכרטיסי עבודה.'],
 ['ארכיטקטורה ובנייה עם AI','lec5.html','אפיון, ישויות, ERD, פרומפט בארבעה חלקים, API מול MCP.'],
 ['ארכיטקטורה ובנייה עם AI','lec51.html','כלי AI: API בענן, מפתחות, מודלים מקומיים, טמפרטורה, MCP.'],
 ['ארכיטקטורה ובנייה עם AI','lec6.html','בנייה צעד אחר צעד של מסד נתונים ב-Supabase.'],
 ['סוכנים, חיפוש וסקייל','lec7.0.html','Antigravity: בונים סוכן.'],
 ['סוכנים, חיפוש וסקייל','lec7.1.html','מעבדת צ׳אטבוט ב-Antigravity.'],
 ['סוכנים, חיפוש וסקייל','lec7.2.html','AI Studio: בונים בוט שידוכים.'],
 ['סוכנים, חיפוש וסקייל','lec7.4.html','חיבור AI Studio ו-MCP לאפליקציה ולמסד נתונים.'],
 ['סוכנים, חיפוש וסקייל','lec7.5.html','חיפוש סמנטי, מסדי נתונים וקטוריים ו-WebSockets.'],
 ['סוכנים, חיפוש וסקייל','lec7.6.html','מטמון, מאגר חיבורים וחלוקת עומסים.'],
 ['פרויקט ו-AI מקומי','lec8.1.html','תדריך הפרויקט המלווה: עקיבות ופרוסה אנכית דקה.'],
 ['פרויקט ו-AI מקומי','lec9.html','יסודות ה-LLM המקומי.'],
 ['פרויקט ו-AI מקומי','lec9.1.html','כלים וארכיטקטורה: Python, Ollama, סוכנים ו-RAG.'],
 ['BigQuery וארכיטקטורת נתונים','lec10part1-15.6.2026.html','למה דוח אחד יכול לשקר: מטבלה ועד JOIN.'],
 ['BigQuery וארכיטקטורת נתונים','lec10part2-15.6.2026.html','למה אסור להריץ דוח על המסד החי: OLTP מול OLAP.'],
 ['BigQuery וארכיטקטורת נתונים','lec10part3-15.6.2026.html','איך נתונים מלוכלכים הופכים לדוח נקי: ETL.'],
 ['BigQuery וארכיטקטורת נתונים','lec10part4-15.6.2026.html','ה-AI כותב SQL, אבל מי מאמת.'],
 ['BigQuery וארכיטקטורת נתונים','lec10part5-15.6.2026.html','איך נתונים נכנסים למערכת: JSON, XML ו-BigQuery.'],
 ['BigQuery וארכיטקטורת נתונים','lec10part6-15.6.2026.html','אגרגציה ו-GROUP BY.'],
 ['BigQuery וארכיטקטורת נתונים','lec10part7-15.6.2026.html','פונקציות חלון.'],
 ['BigQuery וארכיטקטורת נתונים','lec10part8-15.6.2026.html','CTE ותת-שאילתות.'],
 ['BigQuery וארכיטקטורת נתונים','lec10part9-15.6.2026.html','תאריכים ב-BigQuery.'],
 ['BigQuery וארכיטקטורת נתונים','lec10part10-15.6.2026.html','סוגי JOIN והשורות שנעלמות בשקט.'],
 ['BigQuery וארכיטקטורת נתונים','lec10part11-15.6.2026.html','איכות נתונים: אפשר לסמוך על המספר?'],
 ['BigQuery וארכיטקטורת נתונים','lecture10part2-15.6.2026.html','ארכיטקטורת נתונים ו-BI: Lakehouse, ממשל, שושלת, Data Mesh ו-Tableau Public.'],
 ['מהקליק למסד, BI ופריסה','lec11-part1.html','מקליק עד המסד התפעולי: HTTP, JSON, שרת ו-ACID.'],
 ['מהקליק למסד, BI ופריסה','lec11-part2.1.html','מ-OLTP ל-OLAP: למה להעתיק ואיך, סכמת כוכב.'],
 ['מהקליק למסד, BI ופריסה','lec11-part2.2.html','מנתונים לתובנות: דשבורדים וכלי BI.'],
 ['מהקליק למסד, BI ופריסה','lecture12.html','פרוצדורות מאוחסנות, טריגרים, SQL מול NoSQL ומאזן עומסים.'],
 ['מהקליק למסד, BI ופריסה','lecture13.html','Cloud Shell, Express, Neon, GitHub ו-Render.'],
 ['בקרת פרויקט','lecture14.html','חלק א׳: מהתהליך העסקי לנתונים.'],
 ['בקרת פרויקט','lecture14-2.html','חלק ב׳: מודדים ורואים.'],
 ['בקרת פרויקט','lecture14-3.html','חלק ג׳: AI, התראות והחלטות.'],
 ['בקרת פרויקט','lecture14-4.html','חלק ד׳: אחרי העלייה לאוויר.'],
 ['Tableau','tableau-4h/tableau-4h.html','שיעור פתיחה מלא ב-Tableau Public.'],
];
SRC['index2.html'] = 'פורטל הקורס';
// sections that have no topic node of their own but should still point back to lectures: id -> [title, sources]
const EXTRA = {
 's1-1':['האדריכל והקבלן',['index.html','lec_1_part5.html']],
 's2-10':['אתגר הסיכום ב-SQL',['lec2.2.html','lec10part6-15.6.2026.html','lec10part10-15.6.2026.html']],
 's5-4':['רשימת הבדיקה של האדריכל',['lec2.4.html','lec1_part2.html','lec10part11-15.6.2026.html']],
};
function chipsFor(files){ return files.map(f=>'<a class="tool" href="../'+f+'" target="_blank" rel="noopener">'+esc(SRC[f]||f)+'</a>').join(''); }
function srcLines(){
  $$('.sec[id]').forEach(sec=>{
    if (sec.querySelector('.srcline')) return;
    const id = sec.id; let files = [];
    N.filter(n=>n[2]===id).forEach(n=>n[5].forEach(f=>{ if (files.indexOf(f)<0) files.push(f); }));
    if (EXTRA[id]) EXTRA[id][1].forEach(f=>{ if (files.indexOf(f)<0) files.push(f); });
    if (!files.length) return;
    const d = document.createElement('div'); d.className = 'srcline'; d.innerHTML = '<b>📖 חזרה לשיעור:</b> '+chipsFor(files); sec.appendChild(d);
  });
}
function whereChips(file){
  const out = [];
  N.forEach(n=>{ if (n[5].indexOf(file)>=0) out.push('<a class="chip b" href="part'+n[1]+'.html#'+n[2]+'">חלק '+n[1]+': '+esc(n[3])+'</a>'); });
  Object.keys(EXTRA).forEach(id=>{ if (EXTRA[id][1].indexOf(file)>=0) out.push('<a class="chip b" href="part'+id.charAt(1)+'.html#'+id+'">חלק '+id.charAt(1)+': '+esc(EXTRA[id][0])+'</a>'); });
  return out.join(' ') || '<span class="chip">רקע</span>';
}
function renderTable(box){
  let h = '<div class="tw"><table class="tbl cm-table"><thead><tr><th>השיעור</th><th>מה יש בו</th><th>איפה זה חוזר בסיכום</th></tr></thead><tbody>', g = '';
  CAT.forEach(r=>{
    if (r[0] !== g){ g = r[0]; h += '<tr class="cm-g"><td colspan="3">'+esc(g)+'</td></tr>'; }
    h += '<tr><td><a class="tool" href="../'+r[1]+'" target="_blank" rel="noopener">'+esc(SRC[r[1]]||r[1])+'</a></td><td>'+esc(r[2])+'</td><td>'+whereChips(r[1])+'</td></tr>';
  });
  box.innerHTML = h+'</tbody></table></div>';
}

function card(n, self, here){
  const [id,p,s,t,d,src] = n;
  const chips = src.map(f=>'<a class="tool" href="../'+f+'" target="_blank" rel="noopener">'+esc(SRC[f]||f)+'</a>').join('');
  const me = here===p ? '' : '<a class="tool" style="background:#fef3c7;border-color:#fde68a;color:#92400e" href="part'+p+'.html#'+s+'">בסיכום</a>';
  const chk = self ? '<label class="cm-chk"><input type="checkbox" data-n="'+id+'"> אני יודע לעשות את זה</label>' : '';
  return '<div class="cm-card" data-q="'+esc((t+' '+d).toLowerCase())+'" style="border-top-color:'+PCOL[p]+'"><b>'+esc(t)+'</b><p>'+esc(d)+'</p>'+chk+'<div class="cm-l">'+(here===p?'<span class="chip g">בחלק הזה</span>':me)+chips+'</div></div>';
}
function render(box){
  if (box.dataset.mode === 'table'){ renderTable(box); return; }
  const part = +box.dataset.part || 0, mini = box.dataset.mini === '1', self = box.dataset.mode === 'self';
  let h = '';
  if (mini){
    const ns = N.filter(n=>n[1]===part);
    h += '<div class="cm-h">📚 איפה זה היה בקורס</div><div class="cm-grid">'+ns.map(n=>card(n,false,part)).join('')+'</div>';
  } else {
    h += '<div class="cm-bar"><input type="search" class="cm-s" placeholder="חפשו נושא, למשל JOIN, טריגר, ETL, פרומפט..." aria-label="חיפוש נושא"><span class="chip b" id="cm-count"></span></div>';
    for (let p=1;p<=6;p++){
      const ns = N.filter(n=>n[1]===p);
      h += '<div class="cm-part" id="cm-p'+p+'" style="border-inline-start-color:'+PCOL[p]+'"><h3><span class="pn" style="background:'+PCOL[p]+'">חלק '+p+'</span> '+esc(PNAME[p])+'</h3><div class="cm-grid">'+ns.map(n=>card(n,self,0)).join('')+'</div></div>';
    }
    if (self) h += '<div class="box recap" id="cm-review" style="display:none"><b>כדאי לחזור על:</b><div id="cm-rev"></div></div>';
  }
  box.innerHTML = h;
  if (mini) return;
  const cnt = $('#cm-count', box), all = $$('.cm-card', box);
  function filter(){ const q = $('.cm-s', box).value.trim().toLowerCase(); let v = 0; all.forEach(c=>{ const on = !q || c.dataset.q.indexOf(q) >= 0; c.style.display = on ? '' : 'none'; if (on) v++; }); $$('.cm-part', box).forEach(p=>{ p.style.display = $$('.cm-card', p).some(c=>c.style.display !== 'none') ? '' : 'none'; }); cnt.textContent = v+' נושאים'; }
  $('.cm-s', box).addEventListener('input', filter); filter();
  if (self){
    const st = window.FL.store();
    function review(){
      const rest = N.filter(n=>!st.acts['cm-'+n[0]]); const done = N.length - rest.length;
      const r = $('#cm-review', box); r.style.display = '';
      $('#cm-rev', box).innerHTML = '<p>סימנתם '+done+' מתוך '+N.length+'.'+(rest.length?' אלה הנושאים שעוד לא סימנתם, עם הקישור לחומר:':' כל הכבוד, סימנתם הכול.')+'</p>' + rest.map(n=>'<div style="margin:4px 0"><b>'+esc(n[3])+'</b> '+n[5].map(f=>'<a class="tool" href="../'+f+'" target="_blank" rel="noopener">'+esc(SRC[f]||f)+'</a>').join('')+'</div>').join('');
    }
    $$('input[data-n]', box).forEach(i=>{ i.checked = !!st.acts['cm-'+i.dataset.n]; i.addEventListener('change', ()=>{ if (i.checked) st.acts['cm-'+i.dataset.n] = 1; else delete st.acts['cm-'+i.dataset.n]; try { localStorage.setItem('fl1', JSON.stringify(st)); } catch(e){} review(); }); });
    review();
  }
}
function init(){ $$('.cmap').forEach(render); srcLines(); }
window.FL_MAPDATA = {N: N, SRC: SRC};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
