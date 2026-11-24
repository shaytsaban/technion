# Meeting 2. The content is in four files; this one holds the meta data, the shared data and the SQL of the bistro.
LMETA = dict(date='', draft=True, title='מישויות לטבלאות',
             h1=('מישויות', 'לטבלאות'),
             sub='הפתק של ביסטרו אולאף הופך היום למסד נתונים שעונה למנהל: טבלאות, עמודות וכללים, מפתחות וקשרים, תרשים אחד שנבדק מול ההחלטה, ופקודות SQL שבונות את הכול.',
             cover='מאיפה באות טבלאות, הגיליון שנשבר ושלוש התקלות, נרמול, סוגי נתונים ואילוצים, מזהה ראשי ומפתח זר, קשרים, טבלת שורות ההזמנה, תרשים ישויות וקשרים, ופקודות SQL עד תיק מודל נתונים מלא.',
             next_h='לשאול את הנתונים',
             next_t='במפגש 3 שואלים את הטבלאות שבנינו היום: סינון, מיון, סיכום וקיבוץ. כל שאילתה נקראת קליק אחר קליק, ומסתיימת במשפט לאולאף.')
HAVE_END = ''


def SS(sid, h, body, kick=None, cls=''):
    S(sid, h, h, body, kick=KICK(kick) if kick else None, cls=cls)


THREAD_L = ['מהתהליך לנתונים', 'הגיליון של אתי', 'עמודות וכללים', 'מזהים ומפתחות', 'קשרים', 'שורות ההזמנה', 'התרשים המלא', 'SQL והתוצר']
SART.update({'a-sortw': '🎙️', 'b-sortan': '💥', 'b-sortf': '🧭', 'c-sortt': '🔤', 'e-sortr': '🔗', 'f-sorta': '🧾', 'h-events': '⚡'})

# The practice case. Every slide on it carries the badge, so that the class always knows which case is on the screen.
AMUTA = set()


def AM(*ids):
    AMUTA.update(ids)


# ------------------------------------------------------------------ shared data of the bistro
W_ROWS = [['17', 'יוסי', '`050-0000017`'], ['23', 'יוסי', '`054-0000023`'], ['26', 'דנה', '`053-0000026`'], ['31', 'עומר', '`052-0000031`']]
SHEET_H = ['הזמנה', 'שולחן', 'מלצר', 'טלפון המלצר', 'מנה', 'מחיר', 'כמות']
SHEET = [['1201', '6', 'יוסי', '`050-0000017`', 'פסטה', '62', '1'], ['1201', '6', 'יוסי', '`050-0000017`', 'סלט', '44', '2'], ['1202', '4', 'דנה', '`053-0000026`', 'פסטה', '62', '2'],
         ['1203', '2', 'יוסי', '`050-0000017`', 'דג', '96', '1'], ['1204', '6', 'עומר', '`052-0000031`', 'פסטה', '62', '1'], ['1204', '6', 'עומר', '`052-0000031`', 'מרק', '38', '1']]
D_ROWS = [['1', 'פסטה', '62', 'כן'], ['2', 'סלט', '44', 'כן'], ['3', 'דג', '96', 'כן'], ['4', 'מרק', '38', 'כן']]
O_ROWS = [['1201', '6', '17'], ['1202', '4', '26'], ['1203', '2', '17'], ['1204', '6', '31']]
I_ROWS = [['1', '1201', '1', '1'], ['2', '1201', '2', '2'], ['3', '1202', '1', '2'], ['4', '1203', '3', '1'], ['5', '1204', '1', '1'], ['6', '1204', '4', '1']]

# The full model of the bistro, as a diagram. Boxes: key, x, y, width, name, Hebrew name, columns.
ERD_BOX = [('w', 10, 10, 220, 'waiters', 'מלצרים', [('waiter_id', 'pk'), ('name', ''), ('phone', ''), ('active', '')]),
           ('s', 10, 285, 220, 'shifts', 'משמרות', [('shift_id', 'pk'), ('shift_date', ''), ('part', '')]),
           ('o', 330, 92, 250, 'orders', 'הזמנות', [('order_id', 'pk'), ('opened_at', ''), ('table_no', 'fk'), ('waiter_id', 'fk'), ('shift_id', 'fk'), ('status', '')]),
           ('t', 985, 10, 175, 'dining_tables', 'שולחנות', [('table_no', 'pk'), ('floor', ''), ('seats', '')]),
           ('i', 660, 172, 250, 'order_items', 'שורות הזמנה', [('item_id', 'pk'), ('order_id', 'fk'), ('dish_id', 'fk'), ('quantity', ''), ('note', ''), ('price_paid', ''), ('returned', '')]),
           ('d', 985, 232, 175, 'dishes', 'מנות', [('dish_id', 'pk'), ('name', ''), ('price', ''), ('available', '')])]

# ------------------------------------------------------------------ the SQL of the bistro. Every database slide runs against it at build time.
SQL_T = {
    'waiters': """CREATE TABLE waiters (
  waiter_id INTEGER PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);""",
    'shifts': """CREATE TABLE shifts (
  shift_id INTEGER PRIMARY KEY,
  shift_date DATE NOT NULL,
  part VARCHAR(10) NOT NULL CHECK (part IN ('צהריים', 'ערב'))
);""",
    'dining_tables': """CREATE TABLE dining_tables (
  table_no INTEGER PRIMARY KEY,
  floor INTEGER NOT NULL,
  seats INTEGER NOT NULL CHECK (seats > 0)
);""",
    'dishes': """CREATE TABLE dishes (
  dish_id INTEGER PRIMARY KEY,
  name VARCHAR(40) NOT NULL UNIQUE,
  price DECIMAL(8,2) NOT NULL CHECK (price > 0),
  available BOOLEAN NOT NULL DEFAULT TRUE
);""",
    'orders': """CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  table_no INTEGER NOT NULL,
  waiter_id INTEGER NOT NULL,
  shift_id INTEGER NOT NULL,
  opened_at TIMESTAMP NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'ממתינה',
  FOREIGN KEY (table_no) REFERENCES dining_tables(table_no),
  FOREIGN KEY (waiter_id) REFERENCES waiters(waiter_id),
  FOREIGN KEY (shift_id) REFERENCES shifts(shift_id)
);""",
    'order_items': """CREATE TABLE order_items (
  item_id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  dish_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  note VARCHAR(100),
  price_paid DECIMAL(8,2) NOT NULL,
  returned BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (dish_id) REFERENCES dishes(dish_id)
);"""}
SQL_D = {
    'waiters': "INSERT INTO waiters (waiter_id, name, phone) VALUES (17, 'יוסי', '050-0000017'), (23, 'יוסי', '054-0000023'), (26, 'דנה', '053-0000026'), (31, 'עומר', '052-0000031');",
    'shifts': "INSERT INTO shifts VALUES (1, '2026-11-26', 'ערב');",
    'dining_tables': "INSERT INTO dining_tables VALUES (2, 0, 2), (4, 0, 4), (6, 0, 6), (9, 1, 8);",
    'dishes': "INSERT INTO dishes (dish_id, name, price) VALUES (1, 'פסטה', 62), (2, 'סלט', 44), (3, 'דג', 96), (4, 'מרק', 38), (5, 'סטייק', 128), (6, 'קינוח', 34);",
    'orders': "INSERT INTO orders (order_id, table_no, waiter_id, shift_id, opened_at) VALUES (1201, 6, 17, 1, '2026-11-26 19:02'), (1202, 4, 26, 1, '2026-11-26 19:10'), (1203, 2, 17, 1, '2026-11-26 19:31'), (1204, 6, 31, 1, '2026-11-26 19:45');",
    'order_items': "INSERT INTO order_items (item_id, order_id, dish_id, quantity, note, price_paid) VALUES (1, 1201, 1, 1, 'בלי בצל', 62), (2, 1201, 2, 2, NULL, 44), (3, 1202, 1, 2, NULL, 62), (4, 1203, 3, 1, NULL, 96), (5, 1204, 1, 1, NULL, 62), (6, 1204, 4, 1, NULL, 38);"}
SQL_ORDER = ['waiters', 'shifts', 'dining_tables', 'dishes', 'orders', 'order_items']


def SETUP(*names, data=True):
    """The SQL that creates the named tables (and fills them), in a safe order."""
    ns = [n for n in SQL_ORDER if n in names]
    return '\n'.join(SQL_T[n] for n in ns) + ('\n' + '\n'.join(SQL_D[n] for n in ns) if data else '')


def L(step, sql):
    """The lines of one statement, all revealed at the same step."""
    return [(step, x) for x in sql.split('\n')]


exec(R('content_g2.py'))
for _f in 'abcd':
    exec(R(f'content_l2{_f}.py'))

# the badge of the practice case
for _s in SL:
    if _s['id'] in AMUTA:
        _s['cls'] = (_s['cls'] + ' amuta').strip()
        _s['kick'] = '🛋️ מגרש האימון: עמותת ״יד שנייה״ · ' + (_s['kick'] or '')

# the script of the meeting, ready to run in any SQLite tool
BISTRO_SQL = ('-- ביסטרו אולאף: מודל הנתונים של מפגש 2\n-- הקורס: ' + COURSE + ', ' + INST + '\n-- פותחים בכל כלי SQLite ומריצים. לפני ההרצה: PRAGMA foreign_keys = ON;\n\nPRAGMA foreign_keys = ON;\n\n'
              + '\n\n'.join(SQL_T[n] for n in SQL_ORDER) + '\n\n' + '\n'.join(SQL_D[n] for n in SQL_ORDER) + '\n')
_sqlcheck('bistro.sql', BISTRO_SQL, [])
if MODE == 'deck':
    _o = os.path.join(H, '..', 'lectures', 'lecture-2')
    os.makedirs(_o, exist_ok=True)
    open(os.path.join(_o, 'bistro.sql'), 'w', encoding='utf8').write(BISTRO_SQL)
