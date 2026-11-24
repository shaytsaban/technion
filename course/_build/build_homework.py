# Take-home for meeting 2: the data-model dossier of the charity. Run: python3 build_homework.py
#  -> ../lectures/lecture-2/homework.html (worksheet to fill in and save as PDF), homework.pdf (print), amuta_starter.sql (with blanks)
#  -> ~/Downloads/technion-course-site/private/lesson2-homework-solution.html, amuta_solution.sql (NOT in the public repo)
# Every SQL outcome that the solution states is checked in SQLite at build time.
import os, re, sys, json, sqlite3, subprocess, tempfile, html as _h
H = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, H)
R = lambda f: open(os.path.join(H, f), encoding='utf8').read()
MODE = 'deck'
exec(R('content_a.py'))
OUT = os.path.join(H, '..', 'lectures', 'lecture-2')
PRIV = os.path.expanduser('~/Downloads/technion-course-site/private')
os.makedirs(PRIV, exist_ok=True)
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

# ------------------------------------------------------------------ the charity database (solution)
SCHEMA = {
    'donors': """CREATE TABLE donors (
  donor_id INTEGER PRIMARY KEY,
  name VARCHAR(40) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  city VARCHAR(30),
  active BOOLEAN NOT NULL DEFAULT TRUE
);""",
    'requests': """CREATE TABLE requests (
  request_id INTEGER PRIMARY KEY,
  donor_id INTEGER NOT NULL,
  opened_at TIMESTAMP NOT NULL,
  pickup_address VARCHAR(80) NOT NULL,
  status VARCHAR(12) NOT NULL DEFAULT 'ממתינה' CHECK (status IN ('ממתינה', 'נאספה', 'נדחתה')),
  reject_reason VARCHAR(60),
  FOREIGN KEY (donor_id) REFERENCES donors(donor_id)
);""",
    'pickups': """CREATE TABLE pickups (
  pickup_id INTEGER PRIMARY KEY,
  request_id INTEGER NOT NULL,
  pickup_at TIMESTAMP NOT NULL,
  truck VARCHAR(10) NOT NULL,
  FOREIGN KEY (request_id) REFERENCES requests(request_id)
);""",
    'families': """CREATE TABLE families (
  family_id INTEGER PRIMARY KEY,
  contact_name VARCHAR(40) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  city VARCHAR(30),
  referred_by VARCHAR(40),
  active BOOLEAN NOT NULL DEFAULT TRUE
);""",
    'volunteers': """CREATE TABLE volunteers (
  volunteer_id INTEGER PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);""",
    'items': """CREATE TABLE items (
  item_id INTEGER PRIMARY KEY,
  request_id INTEGER ___1___,
  pickup_id INTEGER,
  kind VARCHAR(20) NOT NULL,
  item_state VARCHAR(12) NOT NULL ___2___ 'לא נבדק'
    CHECK (item_state IN ('לא נבדק', 'תקין', 'דורש תיקון')),
  family_id INTEGER,
  delivered_at DATE,
  ___3___ (request_id) REFERENCES requests(request_id),
  FOREIGN KEY (pickup_id) ___4___ pickups(pickup_id),
  FOREIGN KEY (family_id) REFERENCES families(family_id)
);""",
    'pickup_team': """CREATE TABLE pickup_team (
  pickup_id INTEGER NOT NULL,
  volunteer_id INTEGER NOT NULL,
  role VARCHAR(5) NOT NULL ___5___ (role IN ('נהג', 'סבל')),
  ___6___ (pickup_id, volunteer_id),
  FOREIGN KEY (pickup_id) REFERENCES pickups(pickup_id),
  FOREIGN KEY (volunteer_id) REFERENCES volunteers(volunteer_id)
);""",
    'family_needs': """CREATE TABLE family_needs (
  family_id INTEGER NOT NULL,
  need VARCHAR(20) NOT NULL,
  requested_at DATE NOT NULL,
  fulfilled BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (family_id, need),
  FOREIGN KEY (family_id) REFERENCES families(family_id)
);"""}
BLANKS = {'1': 'NOT NULL', '2': 'DEFAULT', '3': 'FOREIGN KEY', '4': 'REFERENCES', '5': 'CHECK', '6': 'UNIQUE'}
DATA = """INSERT INTO donors (donor_id, name, phone, city) VALUES
  (1, 'רונית לוי', '052-1110001', 'חיפה'), (2, 'דוד מזרחי', '050-2220002', 'נשר'), (3, 'יעל ברק', '058-5550005', 'טירת כרמל');
INSERT INTO requests VALUES
  (1, 1, '2026-11-03 10:00', 'הרצל 10, חיפה', 'נאספה', NULL),
  (2, 2, '2026-11-05 12:30', 'הגפן 4, נשר', 'נאספה', NULL),
  (3, 1, '2026-11-09 09:15', 'הרצל 10, חיפה', 'ממתינה', NULL),
  (4, 3, '2026-11-12 17:40', 'התאנה 7, טירת כרמל', 'נדחתה', 'אין גישה למשאית');
INSERT INTO pickups VALUES (1, 1, '2026-11-06 09:00', '12-345-67'), (2, 2, '2026-11-08 11:00', '12-345-67');
INSERT INTO families (family_id, contact_name, phone, city, referred_by) VALUES
  (10, 'משפחת כהן', '054-3339999', 'חיפה', 'רווחה חיפה'), (11, 'משפחת אבו חמד', '053-4440002', 'נשר', 'רווחה נשר'), (12, 'משפחת חדד', '050-7770007', 'קריית אתא', 'רווחה קריית אתא');
INSERT INTO volunteers (volunteer_id, name, phone) VALUES (1, 'אבי', '052-0001111'), (2, 'מירב', '054-0002222'), (3, 'סאמי', '050-0003333'), (4, 'תמר', '053-0004444');
INSERT INTO items VALUES
  (501, 1, 1, 'ספה', 'תקין', 10, '2026-11-10'), (502, 1, 1, 'שולחן', 'דורש תיקון', NULL, NULL),
  (503, 2, 2, 'מקרר', 'תקין', 11, '2026-11-12'), (504, 2, 2, 'כורסה', 'תקין', 10, '2026-11-20'),
  (505, 3, NULL, 'ארון', 'לא נבדק', NULL, NULL);
INSERT INTO pickup_team VALUES (1, 1, 'נהג'), (1, 2, 'סבל'), (2, 1, 'נהג'), (2, 3, 'סבל');
INSERT INTO family_needs VALUES (10, 'ספה', '2026-10-20', TRUE), (10, 'ארון', '2026-10-20', FALSE), (11, 'מקרר', '2026-11-01', TRUE), (12, 'מיטה', '2026-11-15', FALSE);"""
ORDER_T = ['donors', 'requests', 'pickups', 'families', 'volunteers', 'items', 'pickup_team', 'family_needs']
fill = lambda s: re.sub(r'___(\d)___', lambda m: BLANKS[m.group(1)], s)
SOL_SQL = 'PRAGMA foreign_keys = ON;\n\n' + '\n\n'.join(fill(SCHEMA[t]) for t in ORDER_T) + '\n\n' + DATA + '\n'

PRED = [("INSERT INTO items (item_id, request_id, kind) VALUES (512, 999, 'כיסא');", 'err:FOREIGN KEY constraint failed', 'נדחית: אין פנייה 999 (מפתח זר).'),
        ("INSERT INTO items (item_id, request_id, kind, item_state) VALUES (513, 3, 'שולחן', 'שבור');", None, 'נדחית: ״שבור״ אינו אחד המצבים המותרים (CHECK).'),
        ("INSERT INTO pickup_team VALUES (1, 2, 'סבל');", 'err:UNIQUE constraint failed: pickup_team.pickup_id, pickup_team.volunteer_id', 'נדחית: מירב כבר רשומה לאיסוף 1 (UNIQUE על הצירוף).'),
        ("INSERT INTO items (item_id, request_id, kind) VALUES (514, 3, 'מיטה');", 'ok', 'מתקבלת. המצב נכנס לבד: ״לא נבדק״ (DEFAULT).')]
F3 = 'UPDATE families SET active = FALSE WHERE family_id = 10;'
F4 = """SELECT donors.name, items.kind, items.delivered_at
FROM items
JOIN requests ON items.request_id = requests.request_id
JOIN donors ON requests.donor_id = donors.donor_id
WHERE donors.donor_id = 1;"""


def _f4():
    c = sqlite3.connect(':memory:'); c.executescript(SOL_SQL); return c.execute(F4).fetchall()


def verify():
    con = sqlite3.connect(':memory:'); con.execute('PRAGMA foreign_keys = ON'); con.executescript(SOL_SQL)
    for sql, exp, _ in PRED:
        try:
            con.execute(sql); got = 'ok'
        except sqlite3.Error as e:
            got = 'err:' + str(e)
        if exp is None:
            assert got.startswith('err:CHECK constraint failed'), got
        else:
            assert got == exp, (sql, got)
    assert con.execute("SELECT item_state FROM items WHERE item_id = 514").fetchone()[0] == 'לא נבדק'
    con = sqlite3.connect(':memory:'); con.execute('PRAGMA foreign_keys = ON'); con.executescript(SOL_SQL)
    assert con.execute(F3).rowcount == 1
    rows = _f4()
    assert rows == [('רונית לוי', 'ספה', '2026-11-10'), ('רונית לוי', 'שולחן', None), ('רונית לוי', 'ארון', None)], rows
    # forgetting WHERE in F3 would touch every family
    assert con.execute('UPDATE families SET active = FALSE').rowcount == 3


verify()

# ------------------------------------------------------------------ the worksheet
SOL = [False]


def A(k, sol='', rows=1, cls=''):
    """An answer cell. In the solution build it holds the model answer."""
    if SOL[0]:
        return f'<td class="ans sol {cls}">{TX(sol)}</td>'
    return f'<td class="ans {cls}" contenteditable="true" data-k="{k}" style="height:{rows * 30}px"></td>'


def BOX(k, sol='', lines=3):
    if SOL[0]:
        return f'<div class="box sol">{TX(sol)}</div>'
    return f'<div class="box" contenteditable="true" data-k="{k}" style="min-height:{lines * 30}px"></div>'


def CHK(k, on=False):
    if SOL[0]:
        return '<td class="ck sol">' + ('✔' if on else '') + '</td>'
    return f'<td class="ck"><input type="checkbox" data-k="{k}" aria-label="סימון"></td>'


def T(head, rows, cls=''):
    cls = cls or ('two' if len(head) == 2 else '')
    return f'<table class="wt {cls}"><tr>' + ''.join(f'<th>{TX(h)}</th>' for h in head) + '</tr>' + ''.join('<tr>' + ''.join(c if c.startswith('<td') else f'<td>{TX(c)}</td>' for c in r) + '</tr>' for r in rows) + '</table>'


def CODE(sql):
    h = '<br>'.join(_sqlhl(l) for l in sql.split('\n'))
    return '<code class="sq" dir="ltr">' + re.sub(r'___(\d)___', r'<span class="blank">\1</span>', h) + '</code>'


def PART(n, title, pts, why, body):
    return f'<section class="part"><h2><span class="pn">{n}</span>{TX(title)}<span class="pts">{pts} נקודות</span></h2><p class="why">{TX(why)}</p>{body}</section>'


CASE = ('עמותת ״יד שנייה״ אוספת רהיטים משומשים מתורמים ומעבירה אותם למשפחות. תורם מתקשר למוקד, והמוקדנית רושמת פנייה: מי התורם, מה הוא תורם, ומאיפה אוספים. '
        'רכזת העמותה קובעת מועד לאיסוף, משבצת משאית ושניים עד ארבעה מתנדבים, ולכל מתנדב תפקיד: נהג או סבל. באיסוף כל רהיט מקבל מדבקה עם מספר, ונבדק במחסן: תקין, או דורש תיקון. '
        'עובדת סוציאלית מפנה משפחות, ולכל משפחה רשימת צרכים: ספה, מיטה, מקרר. רהיט מתאים נמסר למשפחה, והמשפחה חותמת. בסוף כל חודש העמותה שולחת לכל תורם דוח: מה נמסר ממה שתרם. '
        'בחודש האחרון נרשמו 240 פניות, ו-60 מהן לא נאספו. היום הכול נרשם בגיליון אחד.')
SHEET2 = [['1', '1', '3.11', 'רונית לוי', '`052-1110001`', 'הרצל 10, חיפה', 'ספה', 'תקין', 'משפחת כהן', '`054-3330001`'],
          ['2', '1', '3.11', 'רונית לוי', '`052-1110001`', 'הרצל 10, חיפה', 'שולחן', 'דורש תיקון', '', ''],
          ['3', '2', '5.11', 'דוד מזרחי', '`050-2220002`', 'הגפן 4, נשר', 'מקרר', 'תקין', 'משפחת אבו חמד', '`053-4440002`'],
          ['4', '3', '9.11', 'רונית לוי', '`052-1119999`', 'הרצל 10, חיפה', 'ארון', 'תקין', 'משפחת כהן', '`054-3330001`'],
          ['5', '4', '12.11', 'יעל ברק', '`058-5550005`', 'התאנה 7, טירת כרמל', 'מיטה', 'תקין', '', ''],
          ['6', '5', '15.11', 'דוד מזרחי', '`050-2220002`', 'הגפן 4, נשר', 'כורסה', 'תקין', 'משפחת כהן', '`054-3339999`'],
          ['7', '0', '', '', '', '', '', '', 'משפחת חדד', '`050-7770007`'],
          ['8', '6', '20.11', 'דוד מזרחי', '`050-2220002`', 'הגפן 4, נשר', 'כיסא', 'דורש תיקון', '', '']]
SHEET2_H = ['שורה', 'פנייה', 'תאריך', 'תורם', 'טלפון התורם', 'כתובת איסוף', 'רהיט', 'מצב', 'משפחה', 'טלפון המשפחה']


def build(sol):
    SOL[0] = sol
    pa = PART('א', 'מהשאלות של הרכזת, אחורה', 10, 'כמו בלוח של אולאף: מתחילים מהשאלה הניהולית, ושואלים מה חייב להירשם כדי לענות עליה.',
              T(['השאלה של הרכזת', 'מה חייב להירשם, ואיפה'],
                [['כמה פניות לא נאספו החודש, ולמה?', A('a1', 'בכל פנייה: תאריך פתיחה, מצב (ממתינה, נאספה, נדחתה) וסיבה כשנדחתה.', 2)],
                 ['כמה ימים רהיט מחכה במחסן, בממוצע?', A('a2', 'בכל איסוף: מתי התקיים. בכל רהיט: באיזה איסוף נאסף, ומתי נמסר. ההפרש הוא זמן ההמתנה.', 2)],
                 ['אילו משפחות מחכות יותר מחודש לרהיט שביקשו?', A('a3', 'בכל צורך של משפחה: מתי התבקש, והאם כבר מולא.', 2)],
                 ['אילו מתנדבים השתתפו ביותר מחמישה איסופים החודש?', A('a4', 'בכל איסוף: מתי התקיים, ואילו מתנדבים השתתפו בו (טבלת קישור).', 2)]]))
    words = [('תורם', 0, ''), ('פנייה', 0, ''), ('כתובת האיסוף', 1, ''), ('לשבץ משאית', 2, ''), ('מתנדב', 0, ''), ('מספר המדבקה', 1, 'מזהה של רהיט'),
             ('לבדוק במחסן', 2, ''), ('מצב הרהיט', 1, ''), ('משפחה', 0, ''), ('לתאם מסירה', 2, ''), ('צורך של משפחה', 0, 'טבלה, כי למשפחה כמה צרכים'), ('משאית', 1, 'עמודה, כל עוד לא שומרים פרטים על המשאית')]
    pb = PART('ב', 'מהראיון לטבלאות', 15, 'שם עצם שיש ממנו הרבה הוא טבלה, פרט עליו הוא עמודה, ופועל הוא פעולה במערכת. לשלוש מילים לבחירתכם, הוסיפו נימוק במשפט.',
              '<div class="quote">״כשתורם מתקשר, המוקדנית רושמת את הפנייה ואת כתובת האיסוף. אני משבצת משאית ומתנדבים. כל רהיט שנאסף מקבל מספר מדבקה, ובמחסן בודקים את מצב הרהיט. כשמשפחה מבקשת מיטה, אני מחפשת מיטה תקינה ומתאמת מסירה.״ <small>רכזת העמותה</small></div>' +
              T(['המילה', 'טבלה', 'עמודה', 'פעולה במערכת', 'נימוק (לשלוש מילים)'],
                [[w, CHK(f'b{i}0', a == 0), CHK(f'b{i}1', a == 1), CHK(f'b{i}2', a == 2), A(f'b{i}n', why)] for i, (w, a, why) in enumerate(words)], cls='cls'))
    pc = PART('ג', 'הגיליון של העמותה', 15, 'אלה שמונה שורות מהגיליון שהעמותה מנהלת היום. חפשו בהן את התקלות של חלק 2, ופרקו אותו לטבלאות.',
              T(SHEET2_H, SHEET2, cls='sheet') +
              T(['המשימה', 'התשובה'],
                [['ג1. תקלת עדכון שכבר קרתה: באילו שורות, ומה הסתירה?', A('c1', 'לרונית לוי שני טלפונים: שורות 1 ו-2 מול שורה 4. ולמשפחת כהן שני טלפונים: שורות 1 ו-4 מול שורה 6.', 2)],
                 ['ג2. סימן לתקלת הוספה: באיזו שורה, ומה עשו בה?', A('c2', 'שורה 7: כדי לרשום את משפחת חדד, שעוד לא קיבלה רהיט, המציאו ״פנייה 0״.', 2)],
                 ['ג3. סכנה לתקלת מחיקה: איזו שורה, ומה ייעלם אם תימחק?', A('c3', 'שורה 5: אם פנייה 4 תבוטל ותימחק, ייעלמו הטלפון והכתובת היחידים של יעל ברק.', 2)],
                 ['ג4. על מה מספרת כל עמודה? (פנייה, תורם, רהיט, משפחה)', A('c4', 'פנייה: מספר, תאריך, כתובת איסוף. תורם: שם, טלפון. רהיט: סוג, מצב. משפחה: שם, טלפון.', 2)],
                 ['ג5. אילו טבלאות יהיו אחרי הפירוק, ואיזו עמודה מחברת כל אחת?', A('c5', 'תורמים; פניות (עם מספר תורם); רהיטים (עם מספר פנייה ומספר משפחה); משפחות.', 3)]]))
    dd = [('requests', 'request_id', 'INTEGER', 'חובה, ייחודי', 'מזהה ראשי', 'מזהה כל פנייה', True), ('requests', 'donor_id', 'INTEGER', 'חובה', 'מפתח זר ← donors', 'הקשר לתורם, בלי להעתיק את פרטיו', True),
          ('requests', 'opened_at', 'TIMESTAMP', 'חובה', '', 'שאלה א1: פניות לפי חודש', False), ('requests', 'status', 'VARCHAR(12)', 'ברירת מחדל ממתינה, ערך מרשימה', '', 'שאלה א1: מה לא נאסף', False),
          ('requests', 'reject_reason', 'VARCHAR(60)', 'רשות', '', 'שאלה א1: למה לא נאסף', False), ('donors', 'phone', 'VARCHAR(15)', 'חובה', '', 'תיאום איסוף. טקסט, כי לא מחשבים איתו', False),
          ('items', 'item_id', 'INTEGER', 'חובה, ייחודי', 'מזהה ראשי', 'מספר המדבקה', False), ('items', 'item_state', 'VARCHAR(12)', 'ברירת מחדל לא נבדק, ערך מרשימה', '', 'רק רהיט תקין נמסר', False),
          ('items', 'family_id', 'INTEGER', 'רשות, עד המסירה', 'מפתח זר ← families', 'למי נמסר', False), ('items', 'delivered_at', 'DATE', 'רשות', '', 'שאלה א2: זמן במחסן', False),
          ('families', 'phone', 'VARCHAR(15)', 'חובה', '', 'תיאום מסירה', False), ('family_needs', 'need', 'VARCHAR(20)', 'חובה', '', 'שאלה א3: מה המשפחה מחכה לו', False),
          ('pickup_team', 'role', 'VARCHAR(5)', 'חובה, נהג או סבל', '', 'עובדה על המתנדב באיסוף הזה', False)]
    pd = PART('ד', 'מילון הנתונים', 20, 'שתי השורות הראשונות מלאות כדוגמה. מלאו את השאר: סוג, כלל, מפתח, ולמה העמודה קיימת. ״למה״ עדיף שיפנה לאחת השאלות של חלק א.',
              T(['טבלה', 'עמודה', 'סוג', 'כלל', 'מפתח', 'למה היא קיימת'],
                [[f'`{t}`', f'`{c}`', ('`' + ty + '`') if ex else A(f'd{i}t', '`' + ty + '`'), r if ex else A(f'd{i}r', r), k if ex else A(f'd{i}k', k), w if ex else A(f'd{i}w', w)]
                 for i, (t, c, ty, r, k, w, ex) in enumerate(dd)], cls='dd'))
    pairs = [('תורם ופנייה', 'הרבה', 'אחד', 'אחד לרבים', '`donor_id` בטבלת הפניות'), ('פנייה ורהיט', 'הרבה', 'אחד', 'אחד לרבים', '`request_id` בטבלת הרהיטים'),
             ('איסוף ורהיט', 'הרבה', 'אחד', 'אחד לרבים', '`pickup_id` בטבלת הרהיטים'), ('משפחה ורהיט', 'הרבה', 'אחד', 'אחד לרבים', '`family_id` בטבלת הרהיטים'),
             ('איסוף ומתנדב', 'הרבה', 'הרבה', 'רבים לרבים', 'טבלת קישור `pickup_team`'), ('משפחה וצורך (ספה, מיטה)', 'הרבה', 'הרבה', 'רבים לרבים', 'טבלת קישור `family_needs`')]
    pe = PART('ה', 'קשרים ותרשים', 15, 'לכל זוג שאלו את שתי השאלות, בשני הכיוונים. אחר כך ציירו את התרשים: על דף, ב-draw.io או ב-dbdiagram.io, וצרפו תמונה.',
              T(['הזוג', 'לאחד מהראשון, כמה מהשני?', 'לאחד מהשני, כמה מהראשון?', 'סוג הקשר', 'איפה המפתח הזר, או איזו טבלת קישור'],
                [[p, A(f'e{i}a', a), A(f'e{i}b', b), A(f'e{i}c', c), A(f'e{i}d', d)] for i, (p, a, b, c, d) in enumerate(pairs)]) +
              T(['המשימה', 'התשובה'],
                [['ה1. צרפו את התרשים: שמונה טבלאות, מפתחות וסימני רגל עורב.', A('e7', 'donors, requests, pickups, items, families, family_needs, volunteers, pickup_team. רגלי העורב בצד של הפניות, הרהיטים, האיסופים ושתי טבלאות הקישור.', 2)],
                 ['ה2. לכל טבלת קישור: איזו עובדה על הצירוף היא מחזיקה?', A('e8', 'pickup_team: התפקיד באיסוף, נהג או סבל. family_needs: מתי הצורך התבקש, והאם מולא.', 2)],
                 ['ה3. בדוח של מבקר המדינה מתואר מאגר שאפשר להזין בו ״עד שתי קביעות של סוג הנזקקות״. מה הייתה הטעות במבנה, ואיך המודל שלכם נמנע ממנה?', A('e9', 'עמודות קבועות לקשר של רבים לרבים. אצלנו כל צורך הוא שורה ב-family_needs, ואין מגבלה על מספר הצרכים.', 3)]]))
    pf = PART('ו', 'SQL: קריאה, השלמה וחיזוי', 15, 'לא כותבים פקודות מאפס. משלימים מילים חסרות, וחוזים מה המסד יענה. אפשר לבדוק את עצמכם: הקובץ amuta_starter.sql רץ בכל כלי SQLite חינמי אחרי ההשלמה.',
              '<h3>ו1. השלימו את שש המילים החסרות</h3>' + CODE(SCHEMA['items'] + '\n\n' + SCHEMA['pickup_team']) +
              T(['מספר', 'המילה החסרה'], [[n, A(f'f1{n}', '`' + w + '`')] for n, w in BLANKS.items()], cls='blanks') +
              '<h3>ו2. חזו: מה המסד יענה על כל פקודה?</h3><p class="note">' + TX('המסד כבר מכיל את הנתונים לדוגמה מהקובץ: פניות 1 עד 4, איסופים 1 ו-2, ובאיסוף 1 משתתפים אבי (1) ומירב (2).') + '</p>' +
              T(['הפקודה', 'תתקבל או תידחה? ובגלל איזה כלל?'], [[CODE(sql), A(f'f2{i}', ans, 2)] for i, (sql, _, ans) in enumerate(PRED)], cls='pred') +
              '<h3>ו3. משפחת כהן עברה לעיר אחרת</h3><p>' + TX('השלימו את הפקודה שמוציאה אותה מהשימוש, בלי למחוק את ההיסטוריה שלה. ומה יקרה אם החלק השני יישכח?') + '</p>' +
              CODE('___7___ families SET active = FALSE ___8___ family_id = 10;') +
              T(['המשימה', 'התשובה'], [['המילים 7 ו-8', A('f3a', '`UPDATE`, `WHERE`')], ['אם החלק השני יישכח', A('f3b', 'כל שלוש המשפחות יסומנו כלא פעילות: בלי WHERE, הפקודה חלה על כל השורות.', 2)]]) +
              '<h3>ו4. קראו את השאילתה, ותארו במשפט אחד מה היא מחזירה</h3><p class="note">' + TX('רמז: קראו לפי הסדר שבו המסד עובד: FROM, JOIN, WHERE, ורק בסוף SELECT.') + '</p>' + CODE(F4) +
              BOX('f4', 'לכל רהיט שרונית לוי (תורמת 1) תרמה: מה הוא, ומתי נמסר. רהיט שעוד לא נמסר מופיע עם תאריך ריק. זה הדוח החודשי לתורמת: ספה שנמסרה ב-10.11, שולחן וארון שעוד לא נמסרו.', 2) +
              '<p class="bonus">' + TX('**בונוס, 5 נקודות:** השלימו את הקובץ amuta_starter.sql, הריצו אותו בכלי SQLite חינמי, הריצו את השאילתה של ו4, וצרפו צילום מסך של התוצאה.') + '</p>')
    pg = PART('ז', 'הנחות והחלטות ניהוליות', 10, 'מודל טוב מתעד גם את מה שאינו מכסה, ומוכן לשינויים.',
              T(['המשימה', 'התשובה'],
                [['ז1. כתבו שתי הנחות מודל, במשפט כל אחת.', A('g1', 'כל פנייה שייכת לתורם אחד. רהיט נמסר למשפחה אחת בלבד, ואם הוחזר, נרשם כרהיט חדש.', 3)],
                 ['ז2. הרכזת רוצה לדעת מתי פג הביטוח של כל משאית. מה משתנה במודל, ולמה?', A('g2', 'טבלה חדשה של משאיות (מספר רישוי, תוקף ביטוח), ובאיסופים מפתח זר למשאית במקום טקסט. הביטוח הוא עובדה על המשאית, לא על האיסוף.', 3)],
                 ['ז3. איזה מידע במודל הכי רגיש, ומי צריך לראות אותו?', A('g3', 'פרטי המשפחות, הצרכים שלהן וההפניה מהרווחה. רק הרכזת והעובדת הסוציאלית. מתנדב רואה רק את כתובת המסירה, ביום המסירה.', 3)]]))
    chk = ['לכל טבלה מזהה ראשי, שאינו שם, טלפון או תעודת זהות.', 'שום עובדה אינה כתובה ביותר ממקום אחד, חוץ ממפתחות זרים.', 'לכל עמודה סוג נכון, ואילוץ שנובע מצורך.',
           'בכל קשר של אחד לרבים, המפתח הזר בצד של ״רבים״.', 'כל קשר של רבים לרבים נפתר בטבלת קישור, ואין עמודות ממוספרות.', 'לכל אחת מארבע השאלות של חלק א יש מסלול בתרשים.']
    selfc = ('<section class="part self"><h2>לפני ההגשה: שש שאלות הבדיקה</h2><ul class="chk">' +
             ''.join(f'<li><label><input type="checkbox" data-k="s{i}"> {TX(x)}</label></li>' if not sol else f'<li>✔ {TX(x)}</li>' for i, x in enumerate(chk)) + '</ul></section>')
    rub = T(['חלק', 'נקודות', 'מה בודקים'], [['א. מהשאלות אחורה', '10', 'לכל שאלה: מה נרשם ובאיזו ישות'], ['ב. מהראיון לטבלאות', '15', 'סיווג נכון ונימוק'], ['ג. הגיליון', '15', 'שלוש התקלות מזוהות בשורות, ופירוק נכון'],
                              ['ד. מילון הנתונים', '20', 'סוג, כלל ומפתח נכונים, ו״למה״ שמפנה לצורך'], ['ה. קשרים ותרשים', '15', 'שתי השאלות, מיקום המפתח הזר, טבלאות הקישור'],
                              ['ו. SQL', '15', 'מילים חסרות, חיזוי נכון ונימוק, קריאת השאילתה'], ['ז. הנחות והחלטות', '10', 'הנחות מנוסחות, שינוי שמבוסס על ״על מה העובדה?״, פרטיות'], ['בונוס', '5', 'צילום מסך של הרצה']], cls='rub')
    head = (f'<header class="hd"><div class="k">{TX(COURSE)} · {TX(INST)} · מפגש 2</div><h1>{"פתרון לדוגמה: " if sol else ""}עבודת בית: תיק מודל הנתונים של עמותת ״יד שנייה״</h1>'
            '<div class="s">' + TX('את התיק של הביסטרו בנינו יחד במפגש. עכשיו אתם בונים תיק כזה לבד, לעמותה, באותם שלבים.') + '</div></header>'
            '<div class="meta"><table class="wt id"><tr><th>שם</th>' + ('<td></td>' if sol else '<td class="ans" contenteditable="true" data-k="name"></td>') + '<th>מספר סטודנט</th>' + ('<td></td>' if sol else '<td class="ans" contenteditable="true" data-k="sid"></td>') + '</tr></table>'
            + ('' if sol else '<div class="tools"><button onclick="window.print()">🖨️ הדפסה, או שמירה כ-PDF</button><button class="ghost" id="clr">ניקוי כל התשובות</button><span class="saved" id="saved">התשובות נשמרות אוטומטית בדפדפן הזה</span></div>') + '</div>'
            '<section class="part intro"><h2>איך עובדים</h2><ul>' + ''.join(f'<li>{TX(x)}</li>' for x in [
                'כותבים ישירות בתאים הצהובים. התשובות נשמרות בדפדפן, ואפשר לחזור אליהן.', 'בסיום: ״הדפסה, או שמירה כ-PDF״, ומגישים את קובץ ה-PDF. מועד ואופן ההגשה: לפי הודעת המרצה.',
                'משך משוער: כשלוש שעות. כל חלק נשען על שקפים מהמפגש, ושמותיהם מופיעים בכל חלק.', 'אין צורך לכתוב SQL מאפס. בחלק ו משלימים מילים, וחוזים תוצאות.']) + '</ul>' + rub + '</section>'
            f'<section class="part case"><h2>המקרה</h2><p>{TX(CASE)}</p></section>')
    css = R('shell/fonts.css') + CSS
    js = '' if sol else JS
    title = ('פתרון לדוגמה, ' if sol else '') + 'עבודת בית למפגש 2: תיק מודל הנתונים של העמותה'
    return (f'<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title><style>{css}</style></head>'
            f'<body class="{"solv" if sol else ""}"><main>{head}{pa}{pb}{pc}{pd}{pe}{pf}{pg}{selfc}<footer>ד״ר שי צבאן · {TX(INST)}</footer></main><script>{js}</script></body></html>')


CSS = '''
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;background:#f6f2ea;color:#16213a;font:17px/1.5 'Heebo','Arial Hebrew',Arial,sans-serif}
main{max-width:1060px;margin:0 auto;padding:22px 20px 60px}
.hd{background:linear-gradient(160deg,#0f1b33,#1b2d55 60%,#27447f);color:#fff;border-radius:18px;padding:20px 26px}
.hd .k{color:#7fe3d6;font-weight:700;font-size:15px}.hd h1{margin:6px 0 4px;font-size:30px;line-height:1.2}.hd .s{color:#d6e0f7}
.meta{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin:14px 0}
.tools{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.tools button{font:inherit;font-weight:700;border:0;border-radius:10px;padding:8px 16px;background:#0f9d90;color:#fff;cursor:pointer}
.tools button.ghost{background:#fff;color:#16213a;box-shadow:inset 0 0 0 2px #e4dccd}.saved{font-size:14.5px;color:#5d6a86}
.part{background:#fff;border-radius:16px;box-shadow:0 2px 0 #e4dccd;padding:16px 20px;margin:14px 0;break-inside:auto}
.part h2{display:flex;align-items:center;gap:10px;font-size:22px;margin:0 0 6px;color:#1b2d55}
.pn{width:36px;height:36px;border-radius:50%;background:#ff6a4d;color:#fff;display:grid;place-items:center;font-size:19px;flex:none}
.pts{margin-right:auto;background:#eef2ff;color:#1b2d55;border-radius:99px;padding:1px 12px;font-size:15px}
.why{color:#3b4a6b;margin:0 0 10px}.note{color:#3b4a6b;font-size:15.5px}
h3{font-size:18px;color:#1b2d55;margin:14px 0 6px}
.wt{width:100%;border-collapse:collapse;margin:8px 0;font-size:16px}.wt th{background:#1b2d55;color:#fff;text-align:right;padding:6px 8px;font-weight:700}
.wt td{border-bottom:1px solid #e4dccd;padding:6px 8px;vertical-align:top}
td.ans{background:#fffbe6;border:1px solid #ecd98a;min-width:120px}td.ans:focus,.box:focus{outline:2px solid #e8960c;background:#fff6cc}
td.sol,.box.sol{background:#e6f6ec!important;border:1px solid #9fd7b4;color:#0d5c30;font-weight:600}
.box{background:#fffbe6;border:1px solid #ecd98a;border-radius:8px;padding:8px 10px;margin:6px 0}
.ck{text-align:center;width:70px}.ck input{width:20px;height:20px}td.ck.sol{color:#0d5c30;font-weight:800;font-size:20px}
.wt.sheet{font-size:14.5px}.wt.sheet th{background:#1d6f42}.wt.sheet td{padding:3px 6px;white-space:nowrap}
.wt.dd{table-layout:fixed}.wt.dd th:nth-child(1){width:15%}.wt.dd th:nth-child(2){width:17%}.wt.dd th:nth-child(3){width:15%}.wt.dd th:nth-child(4){width:18%}.wt.dd th:nth-child(5){width:11%}.wt.dd td{overflow-wrap:anywhere}.wt.dd td .en{font-size:.82em;overflow-wrap:normal;word-break:keep-all}.wt.dd td.ans{min-width:0}
.wt.sheet{table-layout:auto}.wt.sheet td:nth-child(6){white-space:normal}
.wt.two th:nth-child(2){width:58%}.wt.id{width:auto;flex:1}.wt.id td.ans{min-width:220px}
.quote{background:#f0edff;border-right:6px solid #6d4df2;border-radius:10px;padding:10px 14px;margin:6px 0 10px;font-weight:600}.quote small{display:block;font-weight:400;color:#5d6a86}
code.sq{display:block;direction:ltr;text-align:left;font:15px/1.55 Menlo,Consolas,monospace;background:#fbfcfe;border:1.5px solid #cdd5ea;border-radius:10px;padding:8px 12px;white-space:pre-wrap;word-break:break-word}
.wt.pred code.sq{margin:0}.wt.pred td:first-child{width:60%}
.sk{color:#1d4fa8;font-weight:800}.ss{color:#b3541e}.sd{color:#0b7a6e;font-weight:700}.sc{color:#8a93aa}
.blank{display:inline-block;min-width:110px;border-bottom:2.5px solid #e0452b;color:#e0452b;font-weight:800;text-align:center;background:#fde8e6;border-radius:4px 4px 0 0}
.wt.blanks{width:auto;min-width:50%}.bonus{background:#eaf6ff;border-right:6px solid #2f8fd6;border-radius:10px;padding:8px 12px}
.chk{list-style:none;padding:0}.chk li{margin:6px 0}.chk input{width:18px;height:18px;vertical-align:middle;margin-left:8px}
.en{direction:ltr;unicode-bidi:isolate;font-family:Menlo,Consolas,monospace;font-size:.92em}.n{direction:ltr;unicode-bidi:isolate}
footer{text-align:center;color:#5d6a86;font-size:14px;margin-top:20px}
@media print{body{background:#fff;font-size:12.5px}.wt.sheet{font-size:10px}.wt.sheet td,.wt.sheet th{padding:2px 3px}td.ans{min-width:0}main{max-width:none;padding:0}.tools{display:none}.part{box-shadow:none;border:1px solid #e4dccd;break-inside:auto}
 .hd{border-radius:8px}td.ans,.box{background:#fffef6!important}.wt tr{break-inside:avoid}code.sq{font-size:11.5px}@page{size:A4;margin:12mm}}
'''
JS = r'''
(function(){const K='technion-l2-homework';let D={};try{D=JSON.parse(localStorage.getItem(K)||'{}')}catch(e){}
const els=[...document.querySelectorAll('[data-k]')];const sv=document.getElementById('saved');
els.forEach(e=>{const k=e.dataset.k;if(e.type==='checkbox'){e.checked=!!D[k];e.addEventListener('change',()=>{D[k]=e.checked;save();});}
 else{if(D[k])e.textContent=D[k];e.addEventListener('input',()=>{D[k]=e.innerText;save();});}});
let t=null;function save(){clearTimeout(t);t=setTimeout(()=>{try{localStorage.setItem(K,JSON.stringify(D));sv.textContent='נשמר בדפדפן הזה, '+new Date().toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'});}catch(e){sv.textContent='השמירה האוטומטית אינה זמינה בדפדפן הזה. שמרו PDF בסיום.';}},400);}
document.getElementById('clr').addEventListener('click',()=>{if(!confirm('למחוק את כל התשובות שכתבתם בדף הזה?'))return;D={};try{localStorage.removeItem(K)}catch(e){}els.forEach(e=>{if(e.type==='checkbox')e.checked=false;else e.textContent='';});});})();
'''

student = build(False)
solution = build(True)
for bad in ('—', '־', '–', '…'):
    assert bad not in student.replace(R('shell/fonts.css'), '') and bad not in solution.replace(R('shell/fonts.css'), ''), bad
open(os.path.join(OUT, 'homework.html'), 'w', encoding='utf8').write(student)
open(os.path.join(PRIV, 'lesson2-homework-solution.html'), 'w', encoding='utf8').write(solution)
STARTER = ('-- עבודת בית למפגש 2: מסד הנתונים של עמותת ״יד שנייה״\n-- ' + COURSE + ', ' + INST + '\n'
           '-- השלימו את שש המילים המסומנות ___1___ עד ___6___ (חלק ו1 בדף העבודה), ורק אז הריצו את הקובץ בכלי SQLite.\n\n'
           'PRAGMA foreign_keys = ON;\n\n' + '\n\n'.join(SCHEMA[t] for t in ORDER_T) + '\n\n' + DATA + '\n\n'
           '-- חלק ו2: הסירו את שני המקפים מתחילת שורה אחת בכל פעם, הריצו, והשוו לחיזוי שלכם.\n' + ''.join('-- ' + s + '\n' for s, _, _ in PRED) +
           '\n-- חלק ו4: הדוח לתורמת 1\n' + F4 + '\n')
open(os.path.join(OUT, 'amuta_starter.sql'), 'w', encoding='utf8').write(STARTER)
open(os.path.join(PRIV, 'amuta_solution.sql'), 'w', encoding='utf8').write(SOL_SQL)
# the starter must fail until it is completed, and run once it is
try:
    sqlite3.connect(':memory:').executescript(STARTER); raise SystemExit('starter ran with blanks')
except sqlite3.Error:
    pass
sqlite3.connect(':memory:').executescript(fill(STARTER))
# a printable PDF of the empty worksheet
d = tempfile.mkdtemp(dir=os.environ.get('TMPDIR'))
p = os.path.join(d, 'h.html'); open(p, 'w', encoding='utf8').write(student.replace('<script>', '<script>/*', 1).replace('</script>', '*/</script>', 1))
subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-sandbox', f'--user-data-dir={d}/p', '--no-pdf-header-footer', '--virtual-time-budget=6000', f'--print-to-pdf={os.path.join(OUT, "homework.pdf")}', 'file://' + p], capture_output=True, timeout=180)
q = os.path.join(d, 's.html'); open(q, 'w', encoding='utf8').write(solution)
subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-sandbox', f'--user-data-dir={d}/q', '--no-pdf-header-footer', '--virtual-time-budget=6000', f'--print-to-pdf={os.path.join(PRIV, "lesson2-homework-solution.pdf")}', 'file://' + q], capture_output=True, timeout=180)
import fitz
for f in (os.path.join(OUT, 'homework.pdf'), os.path.join(PRIV, 'lesson2-homework-solution.pdf')):
    print(os.path.basename(f), 'pages', len(fitz.open(f)))
print('homework built; SQL checked')
