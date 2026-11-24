-- עבודת בית למפגש 2: מסד הנתונים של עמותת ״יד שנייה״
-- ניתוח מערכות וניהול פרויקטים בעידן ה-AI, הטכניון, היחידה ללימודי חוץ
-- השלימו את שש המילים המסומנות ___1___ עד ___6___ (חלק ו1 בדף העבודה), ורק אז הריצו את הקובץ בכלי SQLite.

PRAGMA foreign_keys = ON;

CREATE TABLE donors (
  donor_id INTEGER PRIMARY KEY,
  name VARCHAR(40) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  city VARCHAR(30),
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE requests (
  request_id INTEGER PRIMARY KEY,
  donor_id INTEGER NOT NULL,
  opened_at TIMESTAMP NOT NULL,
  pickup_address VARCHAR(80) NOT NULL,
  status VARCHAR(12) NOT NULL DEFAULT 'ממתינה' CHECK (status IN ('ממתינה', 'נאספה', 'נדחתה')),
  reject_reason VARCHAR(60),
  FOREIGN KEY (donor_id) REFERENCES donors(donor_id)
);

CREATE TABLE pickups (
  pickup_id INTEGER PRIMARY KEY,
  request_id INTEGER NOT NULL,
  pickup_at TIMESTAMP NOT NULL,
  truck VARCHAR(10) NOT NULL,
  FOREIGN KEY (request_id) REFERENCES requests(request_id)
);

CREATE TABLE families (
  family_id INTEGER PRIMARY KEY,
  contact_name VARCHAR(40) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  city VARCHAR(30),
  referred_by VARCHAR(40),
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE volunteers (
  volunteer_id INTEGER PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE items (
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
);

CREATE TABLE pickup_team (
  pickup_id INTEGER NOT NULL,
  volunteer_id INTEGER NOT NULL,
  role VARCHAR(5) NOT NULL ___5___ (role IN ('נהג', 'סבל')),
  ___6___ (pickup_id, volunteer_id),
  FOREIGN KEY (pickup_id) REFERENCES pickups(pickup_id),
  FOREIGN KEY (volunteer_id) REFERENCES volunteers(volunteer_id)
);

CREATE TABLE family_needs (
  family_id INTEGER NOT NULL,
  need VARCHAR(20) NOT NULL,
  requested_at DATE NOT NULL,
  fulfilled BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (family_id, need),
  FOREIGN KEY (family_id) REFERENCES families(family_id)
);

INSERT INTO donors (donor_id, name, phone, city) VALUES
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
INSERT INTO family_needs VALUES (10, 'ספה', '2026-10-20', TRUE), (10, 'ארון', '2026-10-20', FALSE), (11, 'מקרר', '2026-11-01', TRUE), (12, 'מיטה', '2026-11-15', FALSE);

-- חלק ו2: הסירו את שני המקפים מתחילת שורה אחת בכל פעם, הריצו, והשוו לחיזוי שלכם.
-- INSERT INTO items (item_id, request_id, kind) VALUES (512, 999, 'כיסא');
-- INSERT INTO items (item_id, request_id, kind, item_state) VALUES (513, 3, 'שולחן', 'שבור');
-- INSERT INTO pickup_team VALUES (1, 2, 'סבל');
-- INSERT INTO items (item_id, request_id, kind) VALUES (514, 3, 'מיטה');

-- חלק ו4: הדוח לתורמת 1
SELECT donors.name, items.kind, items.delivered_at
FROM items
JOIN requests ON items.request_id = requests.request_id
JOIN donors ON requests.donor_id = donors.donor_id
WHERE donors.donor_id = 1;
