-- ביסטרו אולאף: מודל הנתונים של מפגש 2
-- הקורס: ניתוח מערכות וניהול פרויקטים בעידן ה-AI, הטכניון, היחידה ללימודי חוץ
-- פותחים בכל כלי SQLite ומריצים. לפני ההרצה: PRAGMA foreign_keys = ON;

PRAGMA foreign_keys = ON;

CREATE TABLE waiters (
  waiter_id INTEGER PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE shifts (
  shift_id INTEGER PRIMARY KEY,
  shift_date DATE NOT NULL,
  part VARCHAR(10) NOT NULL CHECK (part IN ('צהריים', 'ערב'))
);

CREATE TABLE dining_tables (
  table_no INTEGER PRIMARY KEY,
  floor INTEGER NOT NULL,
  seats INTEGER NOT NULL CHECK (seats > 0)
);

CREATE TABLE dishes (
  dish_id INTEGER PRIMARY KEY,
  name VARCHAR(40) NOT NULL UNIQUE,
  price DECIMAL(8,2) NOT NULL CHECK (price > 0),
  available BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY,
  table_no INTEGER NOT NULL,
  waiter_id INTEGER NOT NULL,
  shift_id INTEGER NOT NULL,
  opened_at TIMESTAMP NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'ממתינה',
  FOREIGN KEY (table_no) REFERENCES dining_tables(table_no),
  FOREIGN KEY (waiter_id) REFERENCES waiters(waiter_id),
  FOREIGN KEY (shift_id) REFERENCES shifts(shift_id)
);

CREATE TABLE order_items (
  item_id INTEGER PRIMARY KEY,
  order_id INTEGER NOT NULL,
  dish_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  note VARCHAR(100),
  price_paid DECIMAL(8,2) NOT NULL,
  returned BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (dish_id) REFERENCES dishes(dish_id)
);

INSERT INTO waiters (waiter_id, name, phone) VALUES (17, 'יוסי', '050-0000017'), (23, 'יוסי', '054-0000023'), (26, 'דנה', '053-0000026'), (31, 'עומר', '052-0000031');
INSERT INTO shifts VALUES (1, '2026-11-26', 'ערב');
INSERT INTO dining_tables VALUES (2, 0, 2), (4, 0, 4), (6, 0, 6), (9, 1, 8);
INSERT INTO dishes (dish_id, name, price) VALUES (1, 'פסטה', 62), (2, 'סלט', 44), (3, 'דג', 96), (4, 'מרק', 38), (5, 'סטייק', 128), (6, 'קינוח', 34);
INSERT INTO orders (order_id, table_no, waiter_id, shift_id, opened_at) VALUES (1201, 6, 17, 1, '2026-11-26 19:02'), (1202, 4, 26, 1, '2026-11-26 19:10'), (1203, 2, 17, 1, '2026-11-26 19:31'), (1204, 6, 31, 1, '2026-11-26 19:45');
INSERT INTO order_items (item_id, order_id, dish_id, quantity, note, price_paid) VALUES (1, 1201, 1, 1, 'בלי בצל', 62), (2, 1201, 2, 2, NULL, 44), (3, 1202, 1, 2, NULL, 62), (4, 1203, 3, 1, NULL, 96), (5, 1204, 1, 1, NULL, 62), (6, 1204, 4, 1, NULL, 38);
