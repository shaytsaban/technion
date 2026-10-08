(function(){
'use strict';
const D = {"seed": ["CREATE TABLE team (id INTEGER PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL)", "CREATE TABLE tasks (id INTEGER PRIMARY KEY, name TEXT NOT NULL, phase TEXT NOT NULL, owner_id INTEGER REFERENCES team(id),\n  start_week INTEGER, end_week INTEGER, budget INTEGER, pct_done INTEGER, status TEXT)", "CREATE TABLE costs (id INTEGER PRIMARY KEY, task_id INTEGER REFERENCES tasks(id), description TEXT, amount INTEGER, week INTEGER)", "CREATE TABLE risks (id INTEGER PRIMARY KEY, title TEXT, severity INTEGER, probability INTEGER, owner_id INTEGER REFERENCES team(id), status TEXT)", "INSERT INTO team VALUES (1, 'אתי', 'מנהלת הפרויקט')", "INSERT INTO team VALUES (2, 'נועה', 'מנתחת מערכות')", "INSERT INTO team VALUES (3, 'ד״ר קונדילה', 'מובילה טכנית')", "INSERT INTO team VALUES (4, 'עומר', 'נתונים ו-BI')", "INSERT INTO team VALUES (5, 'תמר', 'בדיקות והדרכה')", "INSERT INTO tasks VALUES (1, 'ראיונות עם צוות המסעדה', 'אפיון', 2, 1, 2, 8000, 100, 'done')", "INSERT INTO tasks VALUES (2, 'סיפורי משתמש ו-Use Cases', 'אפיון', 2, 2, 3, 6000, 100, 'done')", "INSERT INTO tasks VALUES (3, 'שרטוט מסכים ואב טיפוס', 'אפיון', 2, 3, 4, 7000, 100, 'done')", "INSERT INTO tasks VALUES (4, 'תכנון מסד הנתונים (ERD)', 'נתונים', 4, 3, 4, 6000, 100, 'done')", "INSERT INTO tasks VALUES (5, 'הקמת מסד הנתונים בענן', 'נתונים', 4, 4, 5, 5000, 100, 'done')", "INSERT INTO tasks VALUES (6, 'הסבת התפריט והמלאי מאקסל', 'נתונים', 4, 5, 6, 8000, 50, 'late')", "INSERT INTO tasks VALUES (7, 'מסך הזמנות בטאבלט של המלצר', 'פיתוח', 3, 4, 7, 20000, 60, 'late')", "INSERT INTO tasks VALUES (8, 'מסך המטבח', 'פיתוח', 3, 5, 8, 15000, 30, 'in_progress')", "INSERT INTO tasks VALUES (9, 'חיבור למסופי האשראי', 'פיתוח', 3, 5, 6, 12000, 90, 'late')", "INSERT INTO tasks VALUES (10, 'דשבורד למנהל המסעדה', 'פיתוח', 4, 7, 9, 9000, 10, 'in_progress')", "INSERT INTO tasks VALUES (11, 'בדיקות קבלה עם המלצרים', 'בדיקות', 5, 8, 10, 8000, 0, 'not_started')", "INSERT INTO tasks VALUES (12, 'הדרכת צוות המסעדה', 'בדיקות', 5, 9, 10, 6000, 0, 'not_started')", "INSERT INTO tasks VALUES (13, 'פיילוט בערב שקט', 'עלייה לאוויר', 1, 11, 11, 5000, 0, 'not_started')", "INSERT INTO tasks VALUES (14, 'עלייה לאוויר מלאה', 'עלייה לאוויר', 1, 12, 12, 5000, 0, 'not_started')", "INSERT INTO costs VALUES (1, 1, 'שעות ראיונות ואפיון', 8500, 2)", "INSERT INTO costs VALUES (2, 2, 'כתיבת סיפורי משתמש', 6000, 3)", "INSERT INTO costs VALUES (3, 3, 'עיצוב מסכים ואב טיפוס', 7800, 4)", "INSERT INTO costs VALUES (4, 4, 'תכנון ERD', 5000, 4)", "INSERT INTO costs VALUES (5, 5, 'מנוי ענן למסד הנתונים', 1200, 4)", "INSERT INTO costs VALUES (6, 5, 'שעות הקמה והגדרות', 3600, 5)", "INSERT INTO costs VALUES (7, 6, 'הקלדת תפריט ומלאי', 4200, 5)", "INSERT INTO costs VALUES (8, 6, 'ניקוי נתוני האקסל', 2900, 6)", "INSERT INTO costs VALUES (9, 7, 'פיתוח מסך הזמנות, שלב א', 7000, 5)", "INSERT INTO costs VALUES (10, 7, 'פיתוח מסך הזמנות, שלב ב', 6500, 6)", "INSERT INTO costs VALUES (11, 7, 'רכישת 6 טאבלטים', 5400, 6)", "INSERT INTO costs VALUES (12, 8, 'פיתוח מסך המטבח', 5000, 7)", "INSERT INTO costs VALUES (13, 8, 'מסך תצוגה למטבח', 2100, 7)", "INSERT INTO costs VALUES (14, 9, 'רישיון מסופי אשראי', 4800, 5)", "INSERT INTO costs VALUES (15, 9, 'שעות אינטגרציה', 7500, 6)", "INSERT INTO costs VALUES (16, 9, 'שעות אינטגרציה', 7500, 6)", "INSERT INTO costs VALUES (17, 9, 'יועץ אבטחת תשלומים', 2400, 7)", "INSERT INTO costs VALUES (18, 10, 'תכנון הדשבורד', 1500, 8)", "INSERT INTO costs VALUES (19, 7, 'תיקוני באגים במסך ההזמנות', 2600, 8)", "INSERT INTO costs VALUES (20, 8, 'פיתוח מסך המטבח, המשך', 2000, 8)", "INSERT INTO risks VALUES (1, 'המלצרים הוותיקים יסרבו לעבוד עם טאבלט', 4, 4, 5, 'open')", "INSERT INTO risks VALUES (2, 'ה-Wi-Fi במסעדה נופל בשעות העומס', 5, 3, 3, 'open')", "INSERT INTO risks VALUES (3, 'ספק מסופי האשראי מאחר באישור החיבור', 4, 3, 3, 'open')", "INSERT INTO risks VALUES (4, 'התפריט באקסל מלא שגיאות וכפילויות', 3, 4, 4, 'open')", "INSERT INTO risks VALUES (5, 'חריגה מתקציב הפיתוח', 4, 2, 1, 'open')", "INSERT INTO risks VALUES (6, 'אין גיבוי אם המערכת קורסת בערב שישי', 5, 2, 3, 'open')", "INSERT INTO risks VALUES (7, 'דליפת פרטי אשראי של לקוחות', 5, 1, 3, 'open')", "CREATE TABLE waiters (id INTEGER PRIMARY KEY, name TEXT NOT NULL, seniority_years INTEGER, trained_early INTEGER)", "CREATE TABLE orders (id INTEGER PRIMARY KEY, waiter_id INTEGER REFERENCES waiters(id), week INTEGER, channel TEXT, minutes_to_kitchen REAL, had_error INTEGER, amount INTEGER)", "INSERT INTO waiters VALUES (1, 'יוסי', 22, 0)", "INSERT INTO waiters VALUES (2, 'רחל', 15, 0)", "INSERT INTO waiters VALUES (3, 'אבי', 8, 1)", "INSERT INTO waiters VALUES (4, 'דנה', 4, 1)", "INSERT INTO waiters VALUES (5, 'עידו', 2, 1)", "INSERT INTO waiters VALUES (6, 'מאיה', 1, 1)", "INSERT INTO orders VALUES (1, 1, 1, 'paper', 6.9, 0, 380)", "INSERT INTO orders VALUES (2, 1, 1, 'paper', 8.6, 0, 410)", "INSERT INTO orders VALUES (3, 1, 1, 'paper', 7.2, 0, 370)", "INSERT INTO orders VALUES (4, 1, 1, 'paper', 4.0, 0, 110)", "INSERT INTO orders VALUES (5, 2, 1, 'paper', 5.9, 0, 190)", "INSERT INTO orders VALUES (6, 2, 1, 'paper', 8.5, 1, 110)", "INSERT INTO orders VALUES (7, 2, 1, 'paper', 5.0, 1, 380)", "INSERT INTO orders VALUES (8, 2, 1, 'paper', 7.0, 0, 230)", "INSERT INTO orders VALUES (9, 3, 1, 'paper', 6.5, 0, 380)", "INSERT INTO orders VALUES (10, 3, 1, 'paper', 5.9, 0, 140)", "INSERT INTO orders VALUES (11, 3, 1, 'paper', 5.4, 0, 270)", "INSERT INTO orders VALUES (12, 3, 1, 'tablet', 1.3, 0, 150)", "INSERT INTO orders VALUES (13, 4, 1, 'paper', 5.8, 0, 90)", "INSERT INTO orders VALUES (14, 4, 1, 'tablet', 1.9, 0, 330)", "INSERT INTO orders VALUES (15, 4, 1, 'paper', 5.9, 1, 210)", "INSERT INTO orders VALUES (16, 4, 1, 'paper', 5.1, 1, 300)", "INSERT INTO orders VALUES (17, 5, 1, 'tablet', 1.1, 0, 170)", "INSERT INTO orders VALUES (18, 5, 1, 'tablet', 0.7, 0, 400)", "INSERT INTO orders VALUES (19, 5, 1, 'tablet', 1.3, 0, 210)", "INSERT INTO orders VALUES (20, 5, 1, 'paper', 8.1, 0, 330)", "INSERT INTO orders VALUES (21, 6, 1, 'tablet', 1.1, 0, 260)", "INSERT INTO orders VALUES (22, 6, 1, 'paper', 9.3, 0, 100)", "INSERT INTO orders VALUES (23, 6, 1, 'tablet', 1.1, 0, 150)", "INSERT INTO orders VALUES (24, 6, 1, 'tablet', 0.7, 0, 90)", "INSERT INTO orders VALUES (25, 1, 2, 'paper', 5.5, 0, 130)", "INSERT INTO orders VALUES (26, 1, 2, 'paper', 4.8, 0, 90)", "INSERT INTO orders VALUES (27, 1, 2, 'paper', 5.7, 0, 390)", "INSERT INTO orders VALUES (28, 1, 2, 'paper', 4.3, 0, 180)", "INSERT INTO orders VALUES (29, 2, 2, 'paper', 4.9, 0, 210)", "INSERT INTO orders VALUES (30, 2, 2, 'tablet', 1.4, 0, 330)", "INSERT INTO orders VALUES (31, 2, 2, 'paper', 7.1, 0, 150)", "INSERT INTO orders VALUES (32, 2, 2, 'tablet', 1.3, 0, 340)", "INSERT INTO orders VALUES (33, 3, 2, 'tablet', 1.7, 0, 270)", "INSERT INTO orders VALUES (34, 3, 2, 'paper', 9.1, 0, 170)", "INSERT INTO orders VALUES (35, 3, 2, 'tablet', 1.3, 0, 130)", "INSERT INTO orders VALUES (36, 3, 2, 'tablet', 1.9, 0, 100)", "INSERT INTO orders VALUES (37, 4, 2, 'tablet', 1.1, 0, 110)", "INSERT INTO orders VALUES (38, 4, 2, 'tablet', 1.1, 0, 170)", "INSERT INTO orders VALUES (39, 4, 2, 'tablet', 0.7, 0, 300)", "INSERT INTO orders VALUES (40, 4, 2, 'tablet', 1.5, 0, 170)", "INSERT INTO orders VALUES (41, 5, 2, 'tablet', 1.9, 0, 310)", "INSERT INTO orders VALUES (42, 5, 2, 'tablet', 1.9, 1, 130)", "INSERT INTO orders VALUES (43, 5, 2, 'tablet', 1.6, 0, 130)", "INSERT INTO orders VALUES (44, 5, 2, 'tablet', 1.3, 0, 170)", "INSERT INTO orders VALUES (45, 6, 2, 'tablet', 1.9, 0, 390)", "INSERT INTO orders VALUES (46, 6, 2, 'paper', 8.7, 0, 100)", "INSERT INTO orders VALUES (47, 6, 2, 'tablet', 1.4, 0, 330)", "INSERT INTO orders VALUES (48, 6, 2, 'tablet', 0.5, 0, 140)", "INSERT INTO orders VALUES (49, 1, 3, 'paper', 9.5, 0, 300)", "INSERT INTO orders VALUES (50, 1, 3, 'paper', 7.9, 0, 370)", "INSERT INTO orders VALUES (51, 1, 3, 'paper', 6.7, 0, 410)", "INSERT INTO orders VALUES (52, 1, 3, 'tablet', 1.4, 0, 230)", "INSERT INTO orders VALUES (53, 2, 3, 'paper', 4.2, 0, 400)", "INSERT INTO orders VALUES (54, 2, 3, 'paper', 3.6, 0, 210)", "INSERT INTO orders VALUES (55, 2, 3, 'paper', 8.0, 0, 370)", "INSERT INTO orders VALUES (56, 2, 3, 'paper', 4.9, 0, 250)", "INSERT INTO orders VALUES (57, 3, 3, 'tablet', 1.1, 0, 210)", "INSERT INTO orders VALUES (58, 3, 3, 'paper', 5.8, 0, 290)", "INSERT INTO orders VALUES (59, 3, 3, 'tablet', 0.7, 0, 110)", "INSERT INTO orders VALUES (60, 3, 3, 'paper', 9.2, 0, 190)", "INSERT INTO orders VALUES (61, 4, 3, 'tablet', 1.2, 0, 350)", "INSERT INTO orders VALUES (62, 4, 3, 'tablet', 1.3, 0, 370)", "INSERT INTO orders VALUES (63, 4, 3, 'tablet', 1.7, 0, 110)", "INSERT INTO orders VALUES (64, 4, 3, 'tablet', 0.9, 0, 100)", "INSERT INTO orders VALUES (65, 5, 3, 'tablet', 1.1, 0, 260)", "INSERT INTO orders VALUES (66, 5, 3, 'tablet', 0.7, 0, 160)", "INSERT INTO orders VALUES (67, 5, 3, 'tablet', 1.4, 0, 320)", "INSERT INTO orders VALUES (68, 5, 3, 'paper', 7.6, 0, 390)", "INSERT INTO orders VALUES (69, 6, 3, 'tablet', 1.6, 0, 110)", "INSERT INTO orders VALUES (70, 6, 3, 'tablet', 0.9, 0, 410)", "INSERT INTO orders VALUES (71, 6, 3, 'tablet', 1.6, 0, 230)", "INSERT INTO orders VALUES (72, 6, 3, 'tablet', 1.9, 0, 170)", "INSERT INTO orders VALUES (73, 1, 4, 'paper', 4.7, 0, 90)", "INSERT INTO orders VALUES (74, 1, 4, 'paper', 6.9, 0, 300)", "INSERT INTO orders VALUES (75, 1, 4, 'paper', 7.4, 0, 160)", "INSERT INTO orders VALUES (76, 1, 4, 'paper', 8.9, 0, 280)", "INSERT INTO orders VALUES (77, 2, 4, 'paper', 8.2, 0, 100)", "INSERT INTO orders VALUES (78, 2, 4, 'paper', 4.0, 0, 350)", "INSERT INTO orders VALUES (79, 2, 4, 'paper', 6.4, 1, 130)", "INSERT INTO orders VALUES (80, 2, 4, 'paper', 3.7, 0, 170)", "INSERT INTO orders VALUES (81, 3, 4, 'tablet', 2.0, 0, 370)", "INSERT INTO orders VALUES (82, 3, 4, 'paper', 6.5, 0, 140)", "INSERT INTO orders VALUES (83, 3, 4, 'paper', 6.1, 0, 190)", "INSERT INTO orders VALUES (84, 3, 4, 'tablet', 1.8, 0, 280)", "INSERT INTO orders VALUES (85, 4, 4, 'tablet', 1.9, 0, 220)", "INSERT INTO orders VALUES (86, 4, 4, 'tablet', 0.7, 0, 260)", "INSERT INTO orders VALUES (87, 4, 4, 'tablet', 0.8, 0, 410)", "INSERT INTO orders VALUES (88, 4, 4, 'tablet', 1.1, 0, 110)", "INSERT INTO orders VALUES (89, 5, 4, 'tablet', 1.1, 0, 160)", "INSERT INTO orders VALUES (90, 5, 4, 'tablet', 1.5, 0, 380)", "INSERT INTO orders VALUES (91, 5, 4, 'tablet', 1.9, 0, 260)", "INSERT INTO orders VALUES (92, 5, 4, 'tablet', 1.2, 0, 390)", "INSERT INTO orders VALUES (93, 6, 4, 'tablet', 0.7, 0, 100)", "INSERT INTO orders VALUES (94, 6, 4, 'tablet', 0.7, 0, 100)", "INSERT INTO orders VALUES (95, 6, 4, 'tablet', 0.7, 1, 270)", "INSERT INTO orders VALUES (96, 6, 4, 'tablet', 1.0, 0, 150)", "INSERT INTO orders VALUES (97, 1, 5, 'paper', 7.0, 0, 250)", "INSERT INTO orders VALUES (98, 1, 5, 'paper', 7.7, 0, 100)", "INSERT INTO orders VALUES (99, 1, 5, 'paper', 6.0, 0, 190)", "INSERT INTO orders VALUES (100, 1, 5, 'paper', 8.7, 0, 220)", "INSERT INTO orders VALUES (101, 2, 5, 'paper', 8.6, 0, 170)", "INSERT INTO orders VALUES (102, 2, 5, 'tablet', 1.6, 0, 200)", "INSERT INTO orders VALUES (103, 2, 5, 'tablet', 1.0, 0, 220)", "INSERT INTO orders VALUES (104, 2, 5, 'paper', 4.7, 1, 240)", "INSERT INTO orders VALUES (105, 3, 5, 'tablet', 0.6, 0, 360)", "INSERT INTO orders VALUES (106, 3, 5, 'paper', 6.0, 0, 170)", "INSERT INTO orders VALUES (107, 3, 5, 'tablet', 1.4, 0, 150)", "INSERT INTO orders VALUES (108, 3, 5, 'tablet', 1.5, 0, 320)", "INSERT INTO orders VALUES (109, 4, 5, 'tablet', 1.3, 0, 410)", "INSERT INTO orders VALUES (110, 4, 5, 'paper', 8.5, 0, 390)", "INSERT INTO orders VALUES (111, 4, 5, 'tablet', 0.6, 0, 410)", "INSERT INTO orders VALUES (112, 4, 5, 'paper', 6.4, 0, 160)", "INSERT INTO orders VALUES (113, 5, 5, 'tablet', 1.8, 0, 150)", "INSERT INTO orders VALUES (114, 5, 5, 'tablet', 0.7, 0, 130)", "INSERT INTO orders VALUES (115, 5, 5, 'tablet', 1.0, 0, 410)", "INSERT INTO orders VALUES (116, 5, 5, 'tablet', 0.8, 0, 110)", "INSERT INTO orders VALUES (117, 6, 5, 'tablet', 0.8, 0, 320)", "INSERT INTO orders VALUES (118, 6, 5, 'tablet', 0.8, 0, 410)", "INSERT INTO orders VALUES (119, 6, 5, 'tablet', 1.0, 0, 340)", "INSERT INTO orders VALUES (120, 6, 5, 'tablet', 0.8, 0, 300)", "INSERT INTO orders VALUES (121, 1, 6, 'paper', 5.0, 0, 190)", "INSERT INTO orders VALUES (122, 1, 6, 'paper', 5.9, 0, 320)", "INSERT INTO orders VALUES (123, 1, 6, 'paper', 8.1, 0, 200)", "INSERT INTO orders VALUES (124, 1, 6, 'tablet', 1.0, 0, 90)", "INSERT INTO orders VALUES (125, 2, 6, 'paper', 9.4, 0, 120)", "INSERT INTO orders VALUES (126, 2, 6, 'tablet', 1.9, 0, 300)", "INSERT INTO orders VALUES (127, 2, 6, 'tablet', 1.1, 0, 130)", "INSERT INTO orders VALUES (128, 2, 6, 'tablet', 2.0, 0, 160)", "INSERT INTO orders VALUES (129, 3, 6, 'tablet', 2.0, 1, 150)", "INSERT INTO orders VALUES (130, 3, 6, 'tablet', 0.9, 0, 120)", "INSERT INTO orders VALUES (131, 3, 6, 'tablet', 1.5, 1, 250)", "INSERT INTO orders VALUES (132, 3, 6, 'tablet', 1.9, 0, 410)", "INSERT INTO orders VALUES (133, 4, 6, 'tablet', 1.3, 0, 150)", "INSERT INTO orders VALUES (134, 4, 6, 'tablet', 1.7, 0, 110)", "INSERT INTO orders VALUES (135, 4, 6, 'tablet', 1.9, 0, 190)", "INSERT INTO orders VALUES (136, 4, 6, 'tablet', 1.3, 0, 360)", "INSERT INTO orders VALUES (137, 5, 6, 'tablet', 1.1, 0, 280)", "INSERT INTO orders VALUES (138, 5, 6, 'tablet', 0.9, 0, 270)", "INSERT INTO orders VALUES (139, 5, 6, 'tablet', 1.6, 1, 240)", "INSERT INTO orders VALUES (140, 5, 6, 'tablet', 1.4, 0, 330)", "INSERT INTO orders VALUES (141, 6, 6, 'tablet', 1.0, 0, 290)", "INSERT INTO orders VALUES (142, 6, 6, 'tablet', 1.9, 0, 390)", "INSERT INTO orders VALUES (143, 6, 6, 'tablet', 1.6, 0, 150)", "INSERT INTO orders VALUES (144, 6, 6, 'tablet', 1.6, 0, 240)"], "week9": ["INSERT INTO costs (id, task_id, description, amount, week) VALUES (21, 8, 'פיתוח מסך המטבח, שבוע 9', 3000, 9)", "INSERT INTO costs (id, task_id, description, amount, week) VALUES (22, 9, 'שעות אינטגרציה נוספות', 2500, 9)", "INSERT INTO costs (id, task_id, description, amount, week) VALUES (23, 10, 'פיתוח הדשבורד', 2000, 9)", "INSERT INTO costs (id, task_id, description, amount, week) VALUES (24, 6, 'ניקוי נתונים נוסף', 1500, 9)", "UPDATE tasks SET pct_done = 80 WHERE id = 6", "UPDATE tasks SET pct_done = 85 WHERE id = 7", "UPDATE tasks SET pct_done = 45, status = 'late' WHERE id = 8", "UPDATE tasks SET pct_done = 25 WHERE id = 10", "UPDATE risks SET probability = 4 WHERE id = 2"], "sol": {"team_all": "SELECT *\nFROM team", "tasks_all": "SELECT id, name, phase, end_week, budget, pct_done, status\nFROM tasks", "cols3": "SELECT name, phase, budget\nFROM tasks", "late": "SELECT name, end_week, pct_done\nFROM tasks\nWHERE status = 'late'", "big": "SELECT name, budget\nFROM tasks\nWHERE budget > 10000", "top5": "SELECT name, budget\nFROM tasks\nORDER BY budget DESC\nLIMIT 5", "by_status": "SELECT status, COUNT(*) AS num_tasks\nFROM tasks\nGROUP BY status", "late_owner": "SELECT t.name AS task, m.name AS owner, t.end_week, t.pct_done\nFROM tasks t\nJOIN team m ON m.id = t.owner_id\nWHERE t.status = 'late'", "owner_load": "SELECT m.name AS owner, COUNT(*) AS num_tasks, SUM(t.budget) AS total_budget\nFROM tasks t\nJOIN team m ON m.id = t.owner_id\nGROUP BY m.name\nORDER BY total_budget DESC", "kondila": "SELECT name, pct_done, status\nFROM tasks\nWHERE owner_id = 3", "budget_total": "SELECT SUM(budget) AS total_budget\nFROM tasks", "spent_total": "SELECT SUM(amount) AS total_spent\nFROM costs", "task9": "SELECT id, description, amount, week\nFROM costs\nWHERE task_id = 9", "dedup": "DELETE FROM costs WHERE id = 16", "over_budget": "SELECT t.name, t.budget, SUM(c.amount) AS spent,\n       SUM(c.amount) - t.budget AS over_by\nFROM tasks t\nJOIN costs c ON c.task_id = t.id\nGROUP BY t.id, t.name, t.budget\nHAVING SUM(c.amount) > t.budget\nORDER BY over_by DESC", "three": "SELECT\n  ROUND(100.0 * (SELECT SUM(amount) FROM costs) / SUM(budget), 1) AS pct_money,\n  ROUND(100.0 * 8 / 12, 1) AS pct_time,\n  ROUND(100.0 * SUM(budget * pct_done / 100.0) / SUM(budget), 1) AS pct_work\nFROM tasks", "by_phase": "WITH b AS (SELECT phase, SUM(budget) AS budget, MIN(start_week) AS first_week\n           FROM tasks GROUP BY phase),\n     a AS (SELECT t.phase, SUM(c.amount) AS actual\n           FROM costs c JOIN tasks t ON t.id = c.task_id GROUP BY t.phase)\nSELECT b.phase, b.budget, COALESCE(a.actual, 0) AS actual,\n       COALESCE(a.actual, 0) - b.budget AS diff\nFROM b LEFT JOIN a ON a.phase = b.phase\nORDER BY b.first_week", "weekly": "SELECT week, SUM(amount) AS spent_this_week,\n       SUM(SUM(amount)) OVER (ORDER BY week) AS spent_so_far\nFROM costs\nGROUP BY week\nORDER BY week", "risks": "SELECT title, severity * probability AS exposure\nFROM risks\nORDER BY exposure DESC", "risks_high": "SELECT title, severity * probability AS exposure\nFROM risks\nWHERE severity * probability >= 12", "alert_q": "SELECT name, 8 - end_week AS weeks_late\nFROM tasks\nWHERE status = 'late'\n  AND 8 - end_week > 1", "p4_orders": "SELECT id, waiter_id, week, channel, minutes_to_kitchen, had_error, amount\nFROM orders\nLIMIT 8", "p4_channel": "SELECT channel, COUNT(*) AS num_orders\nFROM orders\nGROUP BY channel", "p4_speed": "SELECT channel,\n       ROUND(AVG(minutes_to_kitchen), 1) AS avg_minutes,\n       ROUND(100.0 * SUM(had_error) / COUNT(*), 1) AS error_pct\nFROM orders\nGROUP BY channel", "p4_waiter": "SELECT w.name, w.seniority_years,\n       ROUND(100.0 * SUM(o.channel = 'tablet') / COUNT(*), 0) AS tablet_pct\nFROM orders o\nJOIN waiters w ON w.id = o.waiter_id\nGROUP BY w.name, w.seniority_years\nORDER BY tablet_pct", "p4_week": "SELECT week,\n       ROUND(100.0 * SUM(channel = 'tablet') / COUNT(*), 0) AS tablet_pct\nFROM orders\nGROUP BY week\nORDER BY week", "p4_vets": "SELECT name, seniority_years\nFROM waiters\nWHERE seniority_years >= 10"}, "expected": {"team_all": {"columns": ["id", "name", "role"], "values": [[1, "אתי", "מנהלת הפרויקט"], [2, "נועה", "מנתחת מערכות"], [3, "ד״ר קונדילה", "מובילה טכנית"], [4, "עומר", "נתונים ו-BI"], [5, "תמר", "בדיקות והדרכה"]]}, "tasks_all": {"columns": ["id", "name", "phase", "end_week", "budget", "pct_done", "status"], "values": [[1, "ראיונות עם צוות המסעדה", "אפיון", 2, 8000, 100, "done"], [2, "סיפורי משתמש ו-Use Cases", "אפיון", 3, 6000, 100, "done"], [3, "שרטוט מסכים ואב טיפוס", "אפיון", 4, 7000, 100, "done"], [4, "תכנון מסד הנתונים (ERD)", "נתונים", 4, 6000, 100, "done"], [5, "הקמת מסד הנתונים בענן", "נתונים", 5, 5000, 100, "done"], [6, "הסבת התפריט והמלאי מאקסל", "נתונים", 6, 8000, 50, "late"], [7, "מסך הזמנות בטאבלט של המלצר", "פיתוח", 7, 20000, 60, "late"], [8, "מסך המטבח", "פיתוח", 8, 15000, 30, "in_progress"], [9, "חיבור למסופי האשראי", "פיתוח", 6, 12000, 90, "late"], [10, "דשבורד למנהל המסעדה", "פיתוח", 9, 9000, 10, "in_progress"], [11, "בדיקות קבלה עם המלצרים", "בדיקות", 10, 8000, 0, "not_started"], [12, "הדרכת צוות המסעדה", "בדיקות", 10, 6000, 0, "not_started"], [13, "פיילוט בערב שקט", "עלייה לאוויר", 11, 5000, 0, "not_started"], [14, "עלייה לאוויר מלאה", "עלייה לאוויר", 12, 5000, 0, "not_started"]]}, "cols3": {"columns": ["name", "phase", "budget"], "values": [["ראיונות עם צוות המסעדה", "אפיון", 8000], ["סיפורי משתמש ו-Use Cases", "אפיון", 6000], ["שרטוט מסכים ואב טיפוס", "אפיון", 7000], ["תכנון מסד הנתונים (ERD)", "נתונים", 6000], ["הקמת מסד הנתונים בענן", "נתונים", 5000], ["הסבת התפריט והמלאי מאקסל", "נתונים", 8000], ["מסך הזמנות בטאבלט של המלצר", "פיתוח", 20000], ["מסך המטבח", "פיתוח", 15000], ["חיבור למסופי האשראי", "פיתוח", 12000], ["דשבורד למנהל המסעדה", "פיתוח", 9000], ["בדיקות קבלה עם המלצרים", "בדיקות", 8000], ["הדרכת צוות המסעדה", "בדיקות", 6000], ["פיילוט בערב שקט", "עלייה לאוויר", 5000], ["עלייה לאוויר מלאה", "עלייה לאוויר", 5000]]}, "late": {"columns": ["name", "end_week", "pct_done"], "values": [["הסבת התפריט והמלאי מאקסל", 6, 50], ["מסך הזמנות בטאבלט של המלצר", 7, 60], ["חיבור למסופי האשראי", 6, 90]]}, "big": {"columns": ["name", "budget"], "values": [["מסך הזמנות בטאבלט של המלצר", 20000], ["מסך המטבח", 15000], ["חיבור למסופי האשראי", 12000]]}, "top5": {"columns": ["name", "budget"], "values": [["מסך הזמנות בטאבלט של המלצר", 20000], ["מסך המטבח", 15000], ["חיבור למסופי האשראי", 12000], ["דשבורד למנהל המסעדה", 9000], ["ראיונות עם צוות המסעדה", 8000]]}, "by_status": {"columns": ["status", "num_tasks"], "values": [["done", 5], ["in_progress", 2], ["late", 3], ["not_started", 4]]}, "late_owner": {"columns": ["task", "owner", "end_week", "pct_done"], "values": [["הסבת התפריט והמלאי מאקסל", "עומר", 6, 50], ["מסך הזמנות בטאבלט של המלצר", "ד״ר קונדילה", 7, 60], ["חיבור למסופי האשראי", "ד״ר קונדילה", 6, 90]]}, "owner_load": {"columns": ["owner", "num_tasks", "total_budget"], "values": [["ד״ר קונדילה", 3, 47000], ["עומר", 4, 28000], ["נועה", 3, 21000], ["תמר", 2, 14000], ["אתי", 2, 10000]]}, "kondila": {"columns": ["name", "pct_done", "status"], "values": [["מסך הזמנות בטאבלט של המלצר", 60, "late"], ["מסך המטבח", 30, "in_progress"], ["חיבור למסופי האשראי", 90, "late"]]}, "budget_total": {"columns": ["total_budget"], "values": [[120000]]}, "spent_total": {"columns": ["total_spent"], "values": [[93500]]}, "task9": {"columns": ["id", "description", "amount", "week"], "values": [[14, "רישיון מסופי אשראי", 4800, 5], [15, "שעות אינטגרציה", 7500, 6], [16, "שעות אינטגרציה", 7500, 6], [17, "יועץ אבטחת תשלומים", 2400, 7]]}, "p4_orders": {"columns": ["id", "waiter_id", "week", "channel", "minutes_to_kitchen", "had_error", "amount"], "values": [[1, 1, 1, "paper", 6.9, 0, 380], [2, 1, 1, "paper", 8.6, 0, 410], [3, 1, 1, "paper", 7.2, 0, 370], [4, 1, 1, "paper", 4.0, 0, 110], [5, 2, 1, "paper", 5.9, 0, 190], [6, 2, 1, "paper", 8.5, 1, 110], [7, 2, 1, "paper", 5.0, 1, 380], [8, 2, 1, "paper", 7.0, 0, 230]]}, "p4_channel": {"columns": ["channel", "num_orders"], "values": [["paper", 57], ["tablet", 87]]}, "p4_speed": {"columns": ["channel", "avg_minutes", "error_pct"], "values": [["paper", 6.6, 10.5], ["tablet", 1.3, 5.7]]}, "p4_waiter": {"columns": ["name", "seniority_years", "tablet_pct"], "values": [["יוסי", 22, 8.0], ["רחל", 15, 29.0], ["אבי", 8, 63.0], ["דנה", 4, 79.0], ["מאיה", 1, 92.0], ["עידו", 2, 92.0]]}, "p4_week": {"columns": ["week", "tablet_pct"], "values": [[1, 33.0], [2, 67.0], [3, 58.0], [4, 58.0], [5, 63.0], [6, 83.0]]}, "p4_vets": {"columns": ["name", "seniority_years"], "values": [["יוסי", 22], ["רחל", 15]]}, "c4_waiter": {"columns": ["label", "value"], "values": [["עידו", 92.0], ["מאיה", 92.0], ["דנה", 79.0], ["אבי", 63.0], ["רחל", 29.0], ["יוסי", 8.0]]}, "c4_week": {"columns": ["label", "value"], "values": [["שבוע 1", 33.0], ["שבוע 2", 67.0], ["שבוע 3", 58.0], ["שבוע 4", 58.0], ["שבוע 5", 63.0], ["שבוע 6", 83.0]]}, "c4_funnel": {"columns": ["label", "value"], "values": [["1. כל המלצרים", 6], ["2. ניסו טאבלט לפחות פעם", 6], ["3. רוב ההזמנות שלהם בטאבלט", 4], ["4. כמעט תמיד בטאבלט (90% ומעלה)", 2]]}, "c4_trained": {"columns": ["label", "value"], "values": [["הודרכו מוקדם", 81.0], ["הודרכו ברגע האחרון", 19.0]]}, "dedup": {"columns": ["total_spent"], "values": [[86000]]}, "over_budget": {"columns": ["name", "budget", "spent", "over_by"], "values": [["חיבור למסופי האשראי", 12000, 14700, 2700], ["מסך הזמנות בטאבלט של המלצר", 20000, 21500, 1500], ["שרטוט מסכים ואב טיפוס", 7000, 7800, 800], ["ראיונות עם צוות המסעדה", 8000, 8500, 500]]}, "three": {"columns": ["pct_money", "pct_time", "pct_work"], "values": [[71.7, 66.7, 53.5]]}, "by_phase": {"columns": ["phase", "budget", "actual", "diff"], "values": [["אפיון", 21000, 22300, 1300], ["נתונים", 19000, 16900, -2100], ["פיתוח", 56000, 46800, -9200], ["בדיקות", 14000, 0, -14000], ["עלייה לאוויר", 10000, 0, -10000]]}, "weekly": {"columns": ["week", "spent_this_week", "spent_so_far"], "values": [[2, 8500, 8500], [3, 6000, 14500], [4, 14000, 28500], [5, 19600, 48100], [6, 22300, 70400], [7, 9500, 79900], [8, 6100, 86000]]}, "risks": {"columns": ["title", "exposure"], "values": [["המלצרים הוותיקים יסרבו לעבוד עם טאבלט", 16], ["ה-Wi-Fi במסעדה נופל בשעות העומס", 15], ["ספק מסופי האשראי מאחר באישור החיבור", 12], ["התפריט באקסל מלא שגיאות וכפילויות", 12], ["אין גיבוי אם המערכת קורסת בערב שישי", 10], ["חריגה מתקציב הפיתוח", 8], ["דליפת פרטי אשראי של לקוחות", 5]]}, "risks_high": {"columns": ["title", "exposure"], "values": [["המלצרים הוותיקים יסרבו לעבוד עם טאבלט", 16], ["ה-Wi-Fi במסעדה נופל בשעות העומס", 15], ["ספק מסופי האשראי מאחר באישור החיבור", 12], ["התפריט באקסל מלא שגיאות וכפילויות", 12]]}, "alert_q": {"columns": ["name", "weeks_late"], "values": [["הסבת התפריט והמלאי מאקסל", 2], ["חיבור למסופי האשראי", 2]]}}, "t8": {"tasks": {"columns": ["id", "name", "phase", "owner_id", "start_week", "end_week", "budget", "pct_done", "status"], "values": [[1, "ראיונות עם צוות המסעדה", "אפיון", 2, 1, 2, 8000, 100, "done"], [2, "סיפורי משתמש ו-Use Cases", "אפיון", 2, 2, 3, 6000, 100, "done"], [3, "שרטוט מסכים ואב טיפוס", "אפיון", 2, 3, 4, 7000, 100, "done"], [4, "תכנון מסד הנתונים (ERD)", "נתונים", 4, 3, 4, 6000, 100, "done"], [5, "הקמת מסד הנתונים בענן", "נתונים", 4, 4, 5, 5000, 100, "done"], [6, "הסבת התפריט והמלאי מאקסל", "נתונים", 4, 5, 6, 8000, 50, "late"], [7, "מסך הזמנות בטאבלט של המלצר", "פיתוח", 3, 4, 7, 20000, 60, "late"], [8, "מסך המטבח", "פיתוח", 3, 5, 8, 15000, 30, "in_progress"], [9, "חיבור למסופי האשראי", "פיתוח", 3, 5, 6, 12000, 90, "late"], [10, "דשבורד למנהל המסעדה", "פיתוח", 4, 7, 9, 9000, 10, "in_progress"], [11, "בדיקות קבלה עם המלצרים", "בדיקות", 5, 8, 10, 8000, 0, "not_started"], [12, "הדרכת צוות המסעדה", "בדיקות", 5, 9, 10, 6000, 0, "not_started"], [13, "פיילוט בערב שקט", "עלייה לאוויר", 1, 11, 11, 5000, 0, "not_started"], [14, "עלייה לאוויר מלאה", "עלייה לאוויר", 1, 12, 12, 5000, 0, "not_started"]]}, "costs": {"columns": ["id", "task_id", "description", "amount", "week"], "values": [[1, 1, "שעות ראיונות ואפיון", 8500, 2], [2, 2, "כתיבת סיפורי משתמש", 6000, 3], [3, 3, "עיצוב מסכים ואב טיפוס", 7800, 4], [4, 4, "תכנון ERD", 5000, 4], [5, 5, "מנוי ענן למסד הנתונים", 1200, 4], [6, 5, "שעות הקמה והגדרות", 3600, 5], [7, 6, "הקלדת תפריט ומלאי", 4200, 5], [8, 6, "ניקוי נתוני האקסל", 2900, 6], [9, 7, "פיתוח מסך הזמנות, שלב א", 7000, 5], [10, 7, "פיתוח מסך הזמנות, שלב ב", 6500, 6], [11, 7, "רכישת 6 טאבלטים", 5400, 6], [12, 8, "פיתוח מסך המטבח", 5000, 7], [13, 8, "מסך תצוגה למטבח", 2100, 7], [14, 9, "רישיון מסופי אשראי", 4800, 5], [15, 9, "שעות אינטגרציה", 7500, 6], [17, 9, "יועץ אבטחת תשלומים", 2400, 7], [18, 10, "תכנון הדשבורד", 1500, 8], [19, 7, "תיקוני באגים במסך ההזמנות", 2600, 8], [20, 8, "פיתוח מסך המטבח, המשך", 2000, 8]]}, "risks": {"columns": ["id", "title", "severity", "probability", "owner_id", "status"], "values": [[1, "המלצרים הוותיקים יסרבו לעבוד עם טאבלט", 4, 4, 5, "open"], [2, "ה-Wi-Fi במסעדה נופל בשעות העומס", 5, 3, 3, "open"], [3, "ספק מסופי האשראי מאחר באישור החיבור", 4, 3, 3, "open"], [4, "התפריט באקסל מלא שגיאות וכפילויות", 3, 4, 4, "open"], [5, "חריגה מתקציב הפיתוח", 4, 2, 1, "open"], [6, "אין גיבוי אם המערכת קורסת בערב שישי", 5, 2, 3, "open"], [7, "דליפת פרטי אשראי של לקוחות", 5, 1, 3, "open"]]}, "team": {"columns": ["id", "name", "role"], "values": [[1, "אתי", "מנהלת הפרויקט"], [2, "נועה", "מנתחת מערכות"], [3, "ד״ר קונדילה", "מובילה טכנית"], [4, "עומר", "נתונים ו-BI"], [5, "תמר", "בדיקות והדרכה"]]}}, "t9": {"tasks": {"columns": ["id", "name", "phase", "owner_id", "start_week", "end_week", "budget", "pct_done", "status"], "values": [[1, "ראיונות עם צוות המסעדה", "אפיון", 2, 1, 2, 8000, 100, "done"], [2, "סיפורי משתמש ו-Use Cases", "אפיון", 2, 2, 3, 6000, 100, "done"], [3, "שרטוט מסכים ואב טיפוס", "אפיון", 2, 3, 4, 7000, 100, "done"], [4, "תכנון מסד הנתונים (ERD)", "נתונים", 4, 3, 4, 6000, 100, "done"], [5, "הקמת מסד הנתונים בענן", "נתונים", 4, 4, 5, 5000, 100, "done"], [6, "הסבת התפריט והמלאי מאקסל", "נתונים", 4, 5, 6, 8000, 80, "late"], [7, "מסך הזמנות בטאבלט של המלצר", "פיתוח", 3, 4, 7, 20000, 85, "late"], [8, "מסך המטבח", "פיתוח", 3, 5, 8, 15000, 45, "late"], [9, "חיבור למסופי האשראי", "פיתוח", 3, 5, 6, 12000, 90, "late"], [10, "דשבורד למנהל המסעדה", "פיתוח", 4, 7, 9, 9000, 25, "in_progress"], [11, "בדיקות קבלה עם המלצרים", "בדיקות", 5, 8, 10, 8000, 0, "not_started"], [12, "הדרכת צוות המסעדה", "בדיקות", 5, 9, 10, 6000, 0, "not_started"], [13, "פיילוט בערב שקט", "עלייה לאוויר", 1, 11, 11, 5000, 0, "not_started"], [14, "עלייה לאוויר מלאה", "עלייה לאוויר", 1, 12, 12, 5000, 0, "not_started"]]}, "costs": {"columns": ["id", "task_id", "description", "amount", "week"], "values": [[1, 1, "שעות ראיונות ואפיון", 8500, 2], [2, 2, "כתיבת סיפורי משתמש", 6000, 3], [3, 3, "עיצוב מסכים ואב טיפוס", 7800, 4], [4, 4, "תכנון ERD", 5000, 4], [5, 5, "מנוי ענן למסד הנתונים", 1200, 4], [6, 5, "שעות הקמה והגדרות", 3600, 5], [7, 6, "הקלדת תפריט ומלאי", 4200, 5], [8, 6, "ניקוי נתוני האקסל", 2900, 6], [9, 7, "פיתוח מסך הזמנות, שלב א", 7000, 5], [10, 7, "פיתוח מסך הזמנות, שלב ב", 6500, 6], [11, 7, "רכישת 6 טאבלטים", 5400, 6], [12, 8, "פיתוח מסך המטבח", 5000, 7], [13, 8, "מסך תצוגה למטבח", 2100, 7], [14, 9, "רישיון מסופי אשראי", 4800, 5], [15, 9, "שעות אינטגרציה", 7500, 6], [17, 9, "יועץ אבטחת תשלומים", 2400, 7], [18, 10, "תכנון הדשבורד", 1500, 8], [19, 7, "תיקוני באגים במסך ההזמנות", 2600, 8], [20, 8, "פיתוח מסך המטבח, המשך", 2000, 8], [21, 8, "פיתוח מסך המטבח, שבוע 9", 3000, 9], [22, 9, "שעות אינטגרציה נוספות", 2500, 9], [23, 10, "פיתוח הדשבורד", 2000, 9], [24, 6, "ניקוי נתונים נוסף", 1500, 9]]}, "risks": {"columns": ["id", "title", "severity", "probability", "owner_id", "status"], "values": [[1, "המלצרים הוותיקים יסרבו לעבוד עם טאבלט", 4, 4, 5, "open"], [2, "ה-Wi-Fi במסעדה נופל בשעות העומס", 5, 4, 3, "open"], [3, "ספק מסופי האשראי מאחר באישור החיבור", 4, 3, 3, "open"], [4, "התפריט באקסל מלא שגיאות וכפילויות", 3, 4, 4, "open"], [5, "חריגה מתקציב הפיתוח", 4, 2, 1, "open"], [6, "אין גיבוי אם המערכת קורסת בערב שישי", 5, 2, 3, "open"], [7, "דליפת פרטי אשראי של לקוחות", 5, 1, 3, "open"]]}, "team": {"columns": ["id", "name", "role"], "values": [[1, "אתי", "מנהלת הפרויקט"], [2, "נועה", "מנתחת מערכות"], [3, "ד״ר קונדילה", "מובילה טכנית"], [4, "עומר", "נתונים ו-BI"], [5, "תמר", "בדיקות והדרכה"]]}}, "charts": {"phase_budget": [["פיתוח", 56000], ["אפיון", 21000], ["נתונים", 19000], ["בדיקות", 14000], ["עלייה לאוויר", 10000]], "phase_actual": [["פיתוח", 46800], ["אפיון", 22300], ["נתונים", 16900]], "phase_count": [["פיתוח", 4], ["נתונים", 3], ["אפיון", 3], ["עלייה לאוויר", 2], ["בדיקות", 2]], "phase_prog": [["אפיון", 100.0], ["נתונים", 83.0], ["פיתוח", 48.0], ["עלייה לאוויר", 0.0], ["בדיקות", 0.0]], "owner_budget": [["ד״ר קונדילה", 47000], ["עומר", 28000], ["נועה", 21000], ["תמר", 14000], ["אתי", 10000]], "owner_actual": [["ד״ר קונדילה", 45300], ["נועה", 22300], ["עומר", 18400]], "owner_count": [["עומר", 4], ["נועה", 3], ["ד״ר קונדילה", 3], ["תמר", 2], ["אתי", 2]], "owner_prog": [["נועה", 100.0], ["עומר", 65.0], ["ד״ר קונדילה", 60.0], ["תמר", 0.0], ["אתי", 0.0]], "status_budget": [["late", 40000], ["done", 32000], ["not_started", 24000], ["in_progress", 24000]], "status_actual": [["late", 43300], ["done", 32100], ["in_progress", 10600]], "status_count": [["done", 5], ["not_started", 4], ["late", 3], ["in_progress", 2]], "status_prog": [["done", 100.0], ["late", 67.0], ["in_progress", 20.0], ["not_started", 0.0]]}, "charts4": {"c4_waiter": "SELECT w.name AS label, ROUND(100.0 * SUM(o.channel = 'tablet') / COUNT(*), 0) AS value FROM orders o JOIN waiters w ON w.id = o.waiter_id GROUP BY w.name ORDER BY value DESC", "c4_week": "SELECT 'שבוע ' || week AS label, ROUND(100.0 * SUM(channel = 'tablet') / COUNT(*), 0) AS value FROM orders GROUP BY week ORDER BY week", "c4_funnel": "WITH a AS (SELECT waiter_id, 100.0 * SUM(channel = 'tablet') / COUNT(*) AS pct, SUM(channel = 'tablet') AS n FROM orders GROUP BY waiter_id) SELECT '1. כל המלצרים' AS label, (SELECT COUNT(*) FROM waiters) AS value UNION ALL SELECT '2. ניסו טאבלט לפחות פעם', COUNT(*) FROM a WHERE n > 0 UNION ALL SELECT '3. רוב ההזמנות שלהם בטאבלט', COUNT(*) FROM a WHERE pct > 50 UNION ALL SELECT '4. כמעט תמיד בטאבלט (90% ומעלה)', COUNT(*) FROM a WHERE pct >= 90", "c4_trained": "SELECT CASE WHEN w.trained_early = 1 THEN 'הודרכו מוקדם' ELSE 'הודרכו ברגע האחרון' END AS label, ROUND(100.0 * SUM(o.channel = 'tablet') / COUNT(*), 0) AS value FROM orders o JOIN waiters w ON w.id = o.waiter_id GROUP BY w.trained_early ORDER BY value DESC"}};
const ACTS = {"1": ["m-who", "st-control", "st-biz", "m-biz", "st-wbs", "m-wbs", "q1a", "p-ent", "st-table", "lab-team_all", "lab-tasks_all", "q1b", "st-select", "lab-cols3", "lab-late", "lab-big", "lab-top5", "st-group", "lab-by_status", "st-join", "lab-late_owner", "lab-owner_load", "lab-kondila", "q1c"], "2": ["lab-budget_total", "lab-spent_total", "st-dq", "tool-dq", "lab-task9", "lab-dedup", "lab-over_budget", "q2a", "st-weighted", "lab-three", "lab-by_phase", "tool-gantt", "st-planned", "lab-weekly", "q2b", "st-forecast", "tool-forecast", "st-exposure", "lab-risks", "lab-risks_high", "tool-heat", "st-rag", "tool-board", "tool-chart", "q2c"], "3": ["st-traps", "tool-audit", "st-prompt", "tool-prompt", "tool-checks", "tool-devil", "tool-risk", "st-fallback", "q3mid", "st-alert", "lab-alert_q", "tool-alerts", "tool-week9", "st-fatigue", "m-route", "st-mvp", "tool-sim", "tool-status", "q3a", "q3b", "q3c", "q3d", "q3e", "q3f"], "4": ["st4-outcome", "q4a", "lab-p4_orders", "lab-p4_channel", "lab-p4_speed", "st4-funnel", "lab-p4_waiter", "lab-p4_vets", "lab-p4_week", "m4-voice", "p4-ai", "st4-retro", "m4-retro", "q4b", "q4c"]};
const PAGE = window.L14_PAGE || 1;
const $ = (s,r)=> (r||document).querySelector(s);
const $$ = (s,r)=> Array.from((r||document).querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f1 = x => (Math.round(x*10)/10).toFixed(1);
const nis = x => Math.round(Number(x)).toLocaleString('en-US');
const sum = (arr, f) => arr.reduce((a,x)=>a+f(x), 0);
const KEY = 'l14v2';
const SESSION = [].concat(ACTS[1], ACTS[2], ACTS[3]); const EXTRA = ACTS[4] || []; const ALL = SESSION.concat(EXTRA);
let store = (function(){ try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.acts && s.journal) { s.risksAdded = s.risksAdded || []; return s; } } catch(e){} return {acts:{}, journal:[], risksAdded:[]}; })();
function save(){ try { localStorage.setItem(KEY, JSON.stringify(store)); } catch(e){} }
const state = {engine:false};
let SQLmod = null, db = null;
const week = () => store.journal.indexOf('WEEK9') >= 0 ? 9 : 8;
const dedupDone = () => store.journal.some(s => /^DELETE/i.test(s));
if (new URLSearchParams(location.search).get('teacher') === '1') document.body.classList.add('teacher');

/* ---------- engine ---------- */
function seed(){
  db = new SQLmod.Database(); D.seed.forEach(s=>db.run(s));
  store.journal.forEach(e => { try { if (e === 'WEEK9') D.week9.forEach(s=>db.run(s)); else db.run(e); } catch(err){} });
}
function q(sql){ const r = db.exec(sql); return r.length ? r[r.length-1] : {columns:[], values:[]}; }
function one(sql){ const r = q(sql); return r.values.length ? r.values[0][0] : null; }
function setEngineChip(){ const e = $('#eng'); if (!e) return;
  if (state.engine){ e.textContent = '🟢 SQL'; e.className = 'chipst ok'; } else { e.textContent = '🔴 SQL לא נטען'; e.className = 'chipst bad'; } }
function startEngine(){
  if (typeof initSqlJs !== 'function'){ setEngineChip(); refreshAll(); return; }
  initSqlJs({locateFile: f => 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/' + f})
    .then(S => { SQLmod = S; seed(); state.engine = true; setEngineChip(); refreshAll(); })
    .catch(() => { state.engine = false; setEngineChip(); refreshAll(); });
}

/* ---------- data access (engine or static fallback) ---------- */
function tbl(name){
  if (state.engine){ const r = q('SELECT * FROM ' + name); return r.values.map(v => { const o = {}; r.columns.forEach((c,i)=>o[c]=v[i]); return o; }); }
  const T = (week() === 9 ? D.t9 : D.t8)[name];
  let rows = T.values.map(v => { const o = {}; T.columns.forEach((c,i)=>o[c]=v[i]); return o; });
  if (name === 'risks') rows = rows.concat(store.risksAdded.map((r,i)=>({id:100+i, title:r.title, severity:r.severity, probability:r.probability, owner_id:1, status:'open'})));
  return rows;
}
function plannedAt(tasks, w){ return sum(tasks, t => { const len = t.end_week - t.start_week + 1; const d = Math.max(0, Math.min(len, w - t.start_week + 1)); return t.budget * d / len; }); }
function metrics(){
  const tasks = tbl('tasks'), costs = tbl('costs'), risks = tbl('risks'), w = week();
  const budget = sum(tasks, t=>t.budget), spent = sum(costs, c=>c.amount), earned = sum(tasks, t=>t.budget*t.pct_done/100);
  const top = risks.map(r=>({t:r.title, e:r.severity*r.probability})).sort((a,b)=>b.e-a.e)[0] || {t:'', e:0};
  const pm = 100*spent/budget, pw = 100*earned/budget, pt = 100*w/12;
  return {week:w, budget:budget, spent:spent, earned:earned, planned:plannedAt(tasks, w), pctMoney:pm, pctWork:pw, pctTime:pt, gap:pm-pw, late:tasks.filter(t=>t.status==='late').length, topRisk:top.t, topExp:top.e};
}
function teamName(id){ const m = tbl('team').find(x=>x.id===id); return m ? m.name : ''; }
function lateRows(){ const w = week(), team = tbl('team'); return tbl('tasks').filter(t=>t.status==='late').map(t=>({name:t.name, owner:(team.find(m=>m.id===t.owner_id)||{}).name||'', end:t.end_week, pct:t.pct_done, w:w-t.end_week})).sort((a,b)=>b.w-a.w); }
function riskRows(){ const team = tbl('team'); return tbl('risks').map(r=>({id:r.id, title:r.title, severity:r.severity, probability:r.probability, e:r.severity*r.probability, owner:(team.find(m=>m.id===r.owner_id)||{}).name||''})).sort((a,b)=>b.e-a.e); }

/* ---------- progress ---------- */
function markDone(id){ $$('[data-act="'+id+'"]').forEach(e=>e.classList.add('is-done')); }
function done(id){ if (ALL.indexOf(id) < 0) return; if (!store.acts[id]){ store.acts[id] = 1; save(); fxPop(id); } markDone(id); renderProgress(); }
function renderProgress(){
  const n = SESSION.filter(i=>store.acts[i]).length, pct = Math.round(100*n/SESSION.length);
  if ($('#pbar')) $('#pbar').style.width = pct + '%';
  if ($('#ppct')) $('#ppct').textContent = pct + '% הושלם';
  [1,2,3,4].forEach(p => { const el = $('#part'+p+' small'); if (el && ACTS[p]){ const k = ACTS[p].filter(i=>store.acts[i]).length; el.textContent = ' ' + k + '/' + ACTS[p].length; } });
  $$('.endpct').forEach(e => { const k = ACTS[PAGE].filter(i=>store.acts[i]).length; e.textContent = 'בחלק הזה השלמתם ' + k + ' מתוך ' + ACTS[PAGE].length + ' פעילויות.' + (PAGE === 4 ? ' (חלק ההמשך נספר בנפרד ממד המפגש.)' : ' סך הכול במפגש: ' + pct + '%.'); });
}

/* ---------- result tables ---------- */
function fmtCell(v){ if (v === null) return '<i>NULL</i>'; if (typeof v === 'number') return esc(Number.isInteger(v) ? v.toLocaleString('en-US') : String(v)); return esc(v); }
function tableHTML(res){
  if (!res || !res.columns || !res.columns.length) return '<div class="rc">אין שורות להצגה.</div>';
  let h = '<div class="tw"><table class="res"><thead><tr>' + res.columns.map(c=>'<th>'+esc(c)+'</th>').join('') + '</tr></thead><tbody>';
  res.values.slice(0,60).forEach(r => { h += '<tr>' + r.map(v=>'<td' + (typeof v === 'number' ? ' class="num"' : '') + '>' + fmtCell(v) + '</td>').join('') + '</tr>'; });
  return h + '</tbody></table></div><div class="rc">' + res.values.length + ' שורות</div>';
}
function hasNum(res, n){ return res.values.some(r => r.some(v => typeof v === 'number' && Math.abs(v - n) < 0.051)); }
function colSetEquals(res, arr){
  const want = arr.map(String).sort().join('|');
  for (let c = 0; c < res.columns.length; c++){ if (res.values.map(r => String(r[c])).sort().join('|') === want) return true; }
  return false;
}
const NAMES = ids => D.t8.tasks.values.filter(v => ids.indexOf(v[0]) >= 0).map(v => v[1]);

/* ---------- labs ---------- */
const LABS = {
  team_all:    {title:`מי בצוות?`, mode:'given', rows:2},
  tasks_all:   {title:`כל המשימות בפרויקט`, mode:'given', rows:2},
  cols3:       {title:`רק שלוש עמודות`, mode:'free', rows:2, pre:"SELECT \nFROM tasks",
                hints:[`אחרי SELECT רושמים את שמות העמודות שרוצים, מופרדים בפסיקים: name, phase, budget`, `SELECT name, phase, budget FROM tasks`],
                check:(res)=> (res.columns.length === 3 && res.values.length === 14 && hasNum(res, 20000)) ? {ok:true, msg:`יפה. 14 משימות, שלוש עמודות בלבד. ככה בוחרים מה לראות.`} : {ok:false, msg:`עוד לא. צריכות לחזור 14 שורות עם שלוש עמודות בדיוק: name, phase, budget. קיבלתם ${res.columns.length} עמודות.`}},
  late:        {title:`אילו משימות באיחור?`, mode:'free', rows:3, pre:"SELECT name, end_week, pct_done\nFROM tasks\nWHERE ",
                hints:[`העמודה status מחזיקה אחד מארבעה ערכים. הערך של משימה באיחור הוא 'late', בתוך גרשיים בודדים.`, `השלימו את השורה האחרונה כך:  WHERE status = 'late'`],
                check:(res)=> (res.values.length === 3 && (colSetEquals(res, NAMES([6,7,9])) || colSetEquals(res, [6,7,9]))) ? {ok:true, msg:`מצוין! שלוש משימות באיחור. שימו לב לזו שעומדת על 90%: היא הייתה אמורה להסתיים בשבוע 6.`} : {ok:false, msg:`עוד לא. אמורות לחזור בדיוק 3 שורות, רק של משימות שהסטטוס שלהן הוא 'late'. קיבלתם ${res.values.length}.`}},
  big:         {title:`המשימות היקרות`, mode:'free', rows:3, pre:"SELECT name, budget\nFROM tasks\nWHERE ",
                hints:[`תנאי על מספר נכתב בלי גרשיים. למשל: budget > 10000`, `השלימו:  WHERE budget > 10000`],
                check:(res)=> (res.values.length === 3 && hasNum(res, 20000) && hasNum(res, 15000) && hasNum(res, 12000)) ? {ok:true, msg:`נכון: שלוש משימות עם תקציב מעל 10,000 ₪. שלושתן בשלב הפיתוח.`} : {ok:false, msg:`עוד לא. אמורות לחזור 3 משימות שהתקציב שלהן גדול מ-10,000. קיבלתם ${res.values.length} שורות.`}},
  top5:        {title:`חמש המשימות הגדולות, ממוינות`, mode:'given', rows:4},
  by_status:   {title:`כמה משימות בכל סטטוס?`, mode:'free', rows:3, pre:"SELECT status, COUNT(*) AS num_tasks\nFROM tasks\n",
                hints:[`כדי לספור לכל קבוצה בנפרד, מוסיפים בסוף שורה שמקבצת לפי העמודה status.`, `הוסיפו שורה אחרונה:  GROUP BY status`],
                check:(res)=> (res.values.length === 4 && [5,4,3,2].every(n=>hasNum(res, n))) ? {ok:true, msg:`בדיוק: 5 הושלמו, 4 טרם התחילו, 3 באיחור, 2 בעבודה. 14 שורות הפכו לארבע.`} : {ok:false, msg:`עוד לא. אמורות לחזור 4 שורות, אחת לכל סטטוס, עם מספר המשימות בכל אחד.`}},
  late_owner:  {title:`מי אחראי על המשימות שבאיחור?`, mode:'given', rows:4},
  owner_load:  {title:`כמה משימות וכמה תקציב אצל כל אחד?`, mode:'given', rows:5},
  kondila:     {title:`המשימות של ד״ר קונדילה`, mode:'free', rows:3, pre:"SELECT name, pct_done, status\nFROM tasks\nWHERE ",
                hints:[`בטבלת team ראינו שה-id של ד״ר קונדילה הוא 3. בטבלת tasks העמודה owner_id מצביעה על האחראי.`, `השלימו:  WHERE owner_id = 3`],
                check:(res)=> (res.values.length === 3 && colSetEquals(res, NAMES([7,8,9]))) ? {ok:true, msg:`נכון. שלוש משימות, שתיים מהן באיחור והשלישית על 30% בלבד. זה לב הפרויקט.`} : {ok:false, msg:`עוד לא. אמורות לחזור 3 משימות, אלה שה-owner_id שלהן הוא 3.`}},
  budget_total:{title:`התקציב הכולל`, mode:'given', rows:2},
  spent_total: {title:`כמה כסף יצא בפועל?`, mode:'free', rows:2, pre:"SELECT \nFROM costs",
                hints:[`צריך פונקציית סיכום על העמודה amount. אותה פונקציה שסיכמה תקציב בשאילתה הקודמת.`, `SELECT SUM(amount) FROM costs`],
                check:(res)=>{ if (hasNum(res, 93500)) return {ok:true, msg:`נכון: 93,500 ₪. כתבו את המספר בצ׳אט, ואז המשיכו לקרוא. יש בו בעיה.`};
                  if (hasNum(res, 86000)) return {ok:true, msg:`נכון: 86,000 ₪ (כבר ניקיתם את הכפילות, כל הכבוד).`};
                  if (hasNum(res, 95000) || hasNum(res, 102500)) return {ok:true, msg:`נכון לשבוע 9. (הרצתם כבר שבוע קדימה, אז המספר גבוה יותר.)`};
                  return {ok:false, msg:`עוד לא. אמור לחזור מספר אחד: סכום כל העמודה amount.`}; }},
  task9:       {title:`כל ההוצאות של משימה 9`, mode:'given', rows:3},
  dedup:       {title:`מחיקת השורה הכפולה`, mode:'write', rows:2, pre:"", ph:"DELETE FROM ... WHERE id = ...",
                hints:[`השורות הכפולות הן id 15 ו-id 16. מוחקים רק אחת מהן, מהטבלה costs.`, `DELETE FROM costs WHERE id = 16`]},
  over_budget: {title:`אילו משימות כבר חרגו מהתקציב שלהן?`, mode:'given', rows:7},
  three:       {title:`כסף, זמן, עבודה: שלושה אחוזים`, mode:'given', rows:6, after:()=>renderThree(true)},
  by_phase:    {title:`תקציב מול ביצוע לפי שלב`, mode:'given', rows:9},
  weekly:      {title:`הוצאה לפי שבוע, וסכום מצטבר`, mode:'given', rows:6},
  risks:       {title:`חשיפה לסיכון, מהגבוה לנמוך`, mode:'free', rows:3, pre:"SELECT title, \nFROM risks\nORDER BY ",
                hints:[`חשיפה = severity * probability. תנו לעמודה החדשה שם בעזרת AS, למשל AS exposure, ומיינו לפיה בסדר יורד (DESC).`, `SELECT title, severity * probability AS exposure\nFROM risks\nORDER BY exposure DESC`],
                check:(res, sql)=>{ if (![16,12,10,8,5].every(n => hasNum(res, n))) return {ok:false, msg:`עוד לא. לכל סיכון צריכה להופיע החשיפה שלו: severity כפול probability.`};
                  const mx = Math.max.apply(null, res.values.map(r => Math.max.apply(null, r.filter(v=>typeof v==='number'))));
                  if (res.values[0].filter(v => typeof v === 'number').indexOf(mx) === -1 || !/order\s+by/i.test(sql)) return {ok:false, msg:`החישוב נכון! עכשיו רק מיינו מהגבוה לנמוך: ORDER BY ... DESC`};
                  return {ok:true, msg:`מצוין. בראש הרשימה: ״${res.values[0].find(v => typeof v === 'string') || ''}״. שימו לב איזה סוג סיכון זה.`}; }},
  risks_high:  {title:`רק הסיכונים הגבוהים`, mode:'free', rows:3, pre:"SELECT title, severity * probability AS exposure\nFROM risks\nWHERE ",
                hints:[`ב-WHERE אי אפשר להשתמש בשם exposure, אז חוזרים על החישוב: severity * probability >= 12`, `השלימו:  WHERE severity * probability >= 12`],
                check:(res)=> (res.values.length >= 4 && hasNum(res, 16) && hasNum(res, 12) && !hasNum(res, 10) && !hasNum(res, 5)) ? {ok:true, msg:`נכון. אלה הסיכונים שמגיעים לשולחן של מנהלת הפרויקט. השאר במעקב בלבד.`} : {ok:false, msg:`עוד לא. אמורים לחזור רק הסיכונים שהחשיפה שלהם 12 ומעלה (ארבעה כאלה בנתוני המקור).`}},
  p4_orders:   {title:`הצצה בטבלת ההזמנות החדשה`, mode:'given', rows:3},
  p4_channel:  {title:`כמה הזמנות בכל ערוץ?`, mode:'free', rows:3, pre:"SELECT channel, COUNT(*) AS num_orders\nFROM orders\n",
                hints:[`זו אותה תבנית מחלק א׳: כדי לספור לכל ערוץ בנפרד, מוסיפים שורת קיבוץ לפי העמודה channel.`, `הוסיפו שורה אחרונה:  GROUP BY channel`],
                check:(res)=> (res.values.length === 2 && hasNum(res, 87) && hasNum(res, 57)) ? {ok:true, msg:`נכון: 87 הזמנות בטאבלט ו-57 בפתק. כלומר כ-60% בלבד עוברות במערכת החדשה.`} : {ok:false, msg:`עוד לא. אמורות לחזור 2 שורות: אחת לכל ערוץ, עם מספר ההזמנות.`}},
  p4_speed:    {title:`מהירות וטעויות, לפי ערוץ`, mode:'given', rows:5},
  p4_waiter:   {title:`אחוז השימוש בטאבלט, לכל מלצר`, mode:'given', rows:6},
  p4_week:     {title:`אחוז השימוש בטאבלט, שבוע אחר שבוע`, mode:'given', rows:5},
  p4_vets:     {title:`מי המלצרים הוותיקים?`, mode:'free', rows:3, pre:"SELECT name, seniority_years\nFROM waiters\nWHERE ",
                hints:[`תנאי על מספר, בלי גרשיים. ותיק הוא מי שיש לו 10 שנות ותק ומעלה.`, `השלימו:  WHERE seniority_years >= 10`],
                check:(res)=> (res.values.length === 2 && hasNum(res, 22) && hasNum(res, 15)) ? {ok:true, msg:`נכון: יוסי ורחל. אלה בדיוק שני המלצרים עם אחוז השימוש הנמוך ביותר. הסיכון מחלק ב׳ התממש.`} : {ok:false, msg:`עוד לא. אמורים לחזור 2 מלצרים: אלה עם 10 שנות ותק ומעלה.`}},
  alert_q:     {title:`השאילתה שמאחורי כלל ההתראה`, mode:'free', rows:4, pre:"SELECT name, 8 - end_week AS weeks_late\nFROM tasks\nWHERE status = 'late'\n  AND ",
                hints:[`האיחור בשבועות הוא 8 פחות end_week. רוצים רק משימות שמאחרות יותר משבוע אחד.`, `השלימו:  AND 8 - end_week > 1`],
                check:(res)=> (res.values.length === 2 && colSetEquals(res, NAMES([6,9]))) ? {ok:true, msg:`זהו. שתי משימות מאחרות יותר משבוע. השאילתה הזו, עם שעון שמריץ אותה כל בוקר, היא כלל התראה.`} : {ok:false, msg:`עוד לא. אמורות לחזור 2 משימות: אלה שהאיחור שלהן גדול משבוע אחד.`}}
};
function labBox(id){ return $('.lab[data-lab="'+id+'"]'); }
function buildLabs(){
  $$('.lab').forEach(box => {
    const id = box.dataset.lab, L = LABS[id]; if (!L) return;
    box.dataset.mode = L.mode; box.dataset.act = 'lab-' + id;
    const tag = L.mode === 'given' ? '▶ הרצה' : '✍️ כתיבה עצמית';
    const val = L.mode === 'given' ? D.sol[id] : (L.pre || '');
    let h = '<div class="lab-head"><span class="lab-tag">' + tag + '</span><span>' + L.title + '</span></div>';
    h += '<textarea rows="' + (L.rows||3) + '" spellcheck="false" autocapitalize="off" autocomplete="off"' + (L.ph ? ' placeholder="' + esc(L.ph) + '"' : '') + '>' + esc(val) + '</textarea>';
    h += '<div class="lab-btns"><button class="btn gold" data-do="run">▶ הרץ</button>';
    if (L.mode !== 'given') h += '<button class="btn ghost" data-do="hint">💡 רמז</button><button class="btn ghost" data-do="show">👀 הראו לי</button>';
    h += '</div><div class="lab-msg"></div><div class="lab-out"></div>';
    box.innerHTML = h; box._hint = 0;
    box.addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b) return;
      if (b.dataset.do === 'run') runLab(id); if (b.dataset.do === 'hint') hintLab(id); if (b.dataset.do === 'show') showLab(id); });
    $('textarea', box).addEventListener('keydown', ev => { if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter'){ ev.preventDefault(); runLab(id); } });
  });
}
function say(el, kind, text){ el.className = 'lab-msg ' + kind; el.textContent = text; }
function hintLab(id){ const box = labBox(id), L = LABS[id]; const i = Math.min(box._hint, L.hints.length-1); box._hint++; say($('.lab-msg', box), 'info', '💡 רמז ' + (i+1) + ': ' + L.hints[i]); }
function labDone(id){ labBox(id).classList.add('done'); done('lab-' + id); }
function showLab(id){
  const box = labBox(id), L = LABS[id]; $('textarea', box).value = D.sol[id];
  if (state.engine){ runLab(id); return; }
  $('.lab-out', box).innerHTML = tableHTML(D.expected[id]); say($('.lab-msg', box), 'info', 'זה הפתרון, וזו התוצאה הצפויה.');
  if (id === 'dedup' && !dedupDone()){ store.journal.unshift('DELETE FROM costs WHERE id = 16'); save(); }
  labDone(id); if (L.after) L.after(); refreshAll();
}
function runLab(id){
  const box = labBox(id), L = LABS[id], msg = $('.lab-msg', box), out = $('.lab-out', box);
  const sql = $('textarea', box).value.trim().replace(/;+\s*$/,'');
  msg.className = 'lab-msg'; msg.textContent = '';
  if (!sql){ say(msg, 'warnm', 'התיבה ריקה. כתבו שאילתה ולחצו שוב.'); return; }
  if (!state.engine){
    if (L.mode === 'given'){ out.innerHTML = tableHTML(D.expected[id]); say(msg, 'info', 'מנוע ה-SQL לא נטען אצלכם, אז זו התוצאה הצפויה של השאילתה.'); labDone(id); if (L.after) L.after(); }
    else say(msg, 'warnm', 'מנוע ה-SQL לא נטען אצלכם (כנראה חסימת רשת). לחצו ״הראו לי״ כדי לראות את הפתרון והתוצאה, וממשיכים כרגיל.');
    return;
  }
  const isWrite = /^\s*(insert|update|delete|drop|alter|create|replace|truncate)\b/i.test(sql);
  if (isWrite && L.mode !== 'write'){ say(msg, 'bad', 'במעבדה הזו רק קוראים נתונים (SELECT). שינויים בנתונים עושים רק במקום שנבקש.'); return; }
  if (L.mode === 'write'){
    if (!/^\s*delete\s+from\s+costs\b/i.test(sql)){ say(msg, 'bad', 'כאן נדרשת פקודה אחת: DELETE FROM costs, עם תנאי.'); return; }
    if (!/\bwhere\b/i.test(sql)){ say(msg, 'bad', 'עצרו! DELETE בלי WHERE מוחק את כל הטבלה. זוכרים מהמפגש הראשון? מוחקים רק עם WHERE, ורק לפי id.'); return; }
    if (dedupDone()){ say(msg, 'ok', 'הכפילות כבר נמחקה. אין מה למחוק שוב.'); labDone(id); return; }
  }
  try {
    if (L.mode === 'write'){
      const before = db.export(), sumBefore = one('SELECT SUM(amount) FROM costs');
      db.run(sql);
      const dups = one('SELECT COUNT(*) FROM (SELECT 1 FROM costs GROUP BY task_id, description, amount, week HAVING COUNT(*) > 1)');
      const sumAfter = one('SELECT SUM(amount) FROM costs');
      if (dups === 0 && sumAfter === sumBefore - 7500){
        const gone = one('SELECT COUNT(*) FROM costs WHERE id = 16') === 0 ? 16 : 15;
        store.journal.unshift('DELETE FROM costs WHERE id = ' + gone); save();
        out.innerHTML = tableHTML(q('SELECT SUM(amount) AS total_spent FROM costs'));
        say(msg, 'ok', 'נמחקה שורה אחת. הסכום האמיתי: ' + nis(sumAfter) + ' ₪. 7,500 ₪ ״ישבו״ בדוח בלי שום הודעת שגיאה.');
        labDone(id); refreshAll();
      } else { db = new SQLmod.Database(before); say(msg, 'bad', 'נמחק משהו אחר ממה שהתכוונו, אז שחזרתי את הנתונים. מחקו רק אחת משתי השורות הכפולות, לפי ה-id שלה (15 או 16).'); }
      return;
    }
    const res = q(sql); out.innerHTML = tableHTML(res);
    if (L.check){ const v = L.check(res, sql); say(msg, v.ok ? 'ok' : 'bad', (v.ok ? '✅ ' : '') + v.msg); if (v.ok) labDone(id); }
    else labDone(id);
    if (L.after) L.after();
  } catch(e){ if (/incomplete input/i.test(e.message) || (L.pre && sql === L.pre.trim())) say(msg, 'warnm', 'השאילתה עוד לא שלמה. השלימו את החלק החסר ולחצו שוב ״הרץ״. צריכים כיוון? לחצו ״רמז״.');
    else say(msg, 'bad', 'שגיאת SQL: ' + e.message + ' · בדקו שמות טבלאות ועמודות, פסיקים וגרשיים.'); }
}

/* ---------- generic components ---------- */
const STAGES = ['🔍 תהליך עסקי','📝 דרישות','📋 תוכנית פרויקט','🗄️ נתונים','📏 מדדים','📟 לוח בקרה','🤖 עוזר AI','🔔 התראות','🧑‍⚖️ החלטה'];
function initPipes(){ $$('.pipe').forEach(p => { const cur = p.dataset.abs !== undefined ? +p.dataset.abs : +p.dataset.cur + 2; let h = '<em>איפה אנחנו במסלול:</em>';
  STAGES.forEach((s,i) => { h += (i ? '<i>←</i>' : '') + '<span class="' + (i < cur ? 'done' : (i === cur ? 'cur' : '')) + '">' + s + '</span>'; }); p.innerHTML = h; }); }
function initSteps(){ $$('.steps').forEach(box => { const sts = $$('.st', box), id = box.dataset.act; let i = store.acts[id] ? sts.length : 1;
  const head = document.createElement('div'); head.className = 'steps-h'; head.innerHTML = '<b>🧩 ' + esc(box.dataset.title || 'מושג יסוד') + '</b><span></span>'; box.insertBefore(head, box.firstChild);
  const btn = document.createElement('button'); btn.className = 'btn lite'; btn.textContent = 'המשך ←'; box.appendChild(btn);
  const render = () => { sts.forEach((s,k)=>s.classList.toggle('on', k < i)); $('span', head).textContent = 'שלב ' + Math.min(i, sts.length) + ' מתוך ' + sts.length; if (i >= sts.length){ btn.style.display = 'none'; done(id); } };
  btn.addEventListener('click', () => { i++; render(); }); render(); }); }
function initMatch(){ $$('.match').forEach(box => { const opts = box.dataset.opts.split('|'), items = $$('.mi', box), id = box.dataset.act; let solved = 0;
  items.forEach(mi => { const wrap = document.createElement('div'); wrap.className = 'mbtns'; const fbk = document.createElement('span'); fbk.className = 'mfb';
    opts.forEach(o => { const b = document.createElement('button'); b.textContent = o; b.addEventListener('click', () => { if (mi.classList.contains('ok')) return;
      $$('button', wrap).forEach(x=>x.classList.remove('w'));
      if (o === mi.dataset.a){ b.classList.add('c'); mi.classList.add('ok'); fbk.textContent = mi.dataset.exp || 'נכון!'; solved++; if (solved === items.length) done(id); }
      else { b.classList.add('w'); fbk.textContent = 'לא בדיוק, נסו שוב.'; } }); wrap.appendChild(b); });
    mi.appendChild(wrap); mi.appendChild(fbk); }); }); }
function initPick(){ $$('.pick').forEach(box => { const ws = $$('.w', box), id = box.dataset.act;
  ws.forEach(w => w.addEventListener('click', () => { if (!box.classList.contains('checked')) w.classList.toggle('sel'); }));
  const btn = document.createElement('button'); btn.className = 'btn'; btn.textContent = 'בדקו אותי'; const fbk = document.createElement('p'); fbk.style.fontWeight = '700';
  btn.addEventListener('click', () => { let hit = 0, need = 0, wrong = 0;
    ws.forEach(w => { const ok = w.dataset.ok === '1', sel = w.classList.contains('sel'); if (ok) need++; w.classList.remove('sel');
      if (ok && sel){ w.classList.add('right'); hit++; } else if (ok){ w.classList.add('missed'); } else if (sel){ w.classList.add('wrong'); wrong++; } });
    box.classList.add('checked'); fbk.textContent = 'מצאתם ' + hit + ' מתוך ' + need + (wrong ? ', וסימנתם ' + wrong + ' שאינם נכונים' : '') + '. ' + (box.dataset.exp || ''); done(id); });
  box.appendChild(btn); box.appendChild(fbk); }); }
function initQuiz(){ $$('.quiz').forEach(qz => { const opts = $$('.opt', qz), fbk = $('.fb', qz);
  opts.forEach(o => o.addEventListener('click', () => { opts.forEach(x => x.classList.remove('c','w'));
    const ok = o.dataset.c === '1'; o.classList.add(ok ? 'c' : 'w'); if (!ok) opts.filter(x => x.dataset.c === '1').forEach(x => x.classList.add('c'));
    fbk.innerHTML = (ok ? '<b>✅ נכון.</b> ' : '<b>❌ לא מדויק.</b> ') + esc(fbk.dataset.exp); if (qz.dataset.act) done(qz.dataset.act); })); }); }
function copyText(text, msgEl, okText){
  const fin = () => { if (msgEl){ msgEl.textContent = okText || 'הועתק ✓'; setTimeout(()=>{ msgEl.textContent = ''; }, 2600); } };
  const fallback = () => { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); fin(); } catch(e){ if (msgEl) msgEl.textContent = 'סמנו והעתיקו ידנית'; } ta.remove(); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(fin).catch(fallback); else fallback();
}

/* ---------- three bars ---------- */
function renderThree(force){ const box = $('#threeBars'); if (!box) return; if (!force && !box.dataset.on) return; box.dataset.on = '1';
  const m = metrics();
  [['m', m.pctMoney], ['t', m.pctTime], ['w', m.pctWork]].forEach(p => { $('#b3'+p[0]).textContent = f1(p[1]) + '%'; $('#b3'+p[0]+'i').style.width = Math.min(100, p[1]) + '%'; });
  $('#threeSentence').innerHTML = 'במשפט אחד: שילמנו <span class="n">' + Math.round(m.pctMoney) + '%</span> מהתקציב, עבר <span class="n">' + Math.round(m.pctTime) + '%</span> מהזמן, ובוצע רק <span class="n">' + Math.round(m.pctWork) + '%</span> מהעבודה.' + (dedupDone() ? '' : ' <span style="color:#b91c1c">(שימו לב: עוד לא מחקתם את החשבונית הכפולה, אז אחוז הכסף מנופח.)</span>'); }

/* ---------- data quality tool ---------- */
const DQ = {
  dups:   {sql:"SELECT task_id, description, amount, week, COUNT(*) AS times\nFROM costs\nGROUP BY task_id, description, amount, week\nHAVING COUNT(*) > 1", fb:()=> dedupDone() ? 0 : 1,
           text:n => n ? 'נמצאה קבוצה אחת של שורות זהות: אותה משימה, אותו תיאור, אותו סכום, אותו שבוע. זו חשבונית שהוזנה פעמיים.' : 'אין כפילויות. (מחקתם אותה כבר.)'},
  nulls:  {sql:"SELECT COUNT(*) AS missing\nFROM costs\nWHERE amount IS NULL OR task_id IS NULL", fb:()=>0, count:true, text:n => n ? 'יש שורות עם ערך חסר.' : '0 שורות עם ערך חסר. תקין.'},
  bad:    {sql:"SELECT COUNT(*) AS impossible\nFROM costs\nWHERE amount <= 0", fb:()=>0, count:true, text:n => n ? 'יש סכומים שליליים או אפס.' : '0 סכומים בלתי אפשריים. תקין.'},
  orphan: {sql:"SELECT COUNT(*) AS orphans\nFROM costs c\nLEFT JOIN tasks t ON t.id = c.task_id\nWHERE t.id IS NULL", fb:()=>0, count:true, text:n => n ? 'יש הוצאות שלא שייכות לאף משימה.' : '0 הוצאות ״יתומות״. כל הוצאה שייכת למשימה קיימת.'}
};
function initDQ(){ const box = $('#dq'); if (!box) return; const ran = {};
  $$('.dq-row', box).forEach(row => { const k = row.dataset.q, c = DQ[k]; const r = document.createElement('div'); r.className = 'res'; row.appendChild(r);
    $('button', row).addEventListener('click', () => { let n;
      if (state.engine){ const res = q(c.sql); n = c.count ? res.values[0][0] : res.values.length; } else n = c.fb();
      row.classList.add('ran'); row.classList.toggle('ok', !n); row.classList.toggle('bad', !!n);
      r.innerHTML = '<pre class="sql">' + esc(c.sql) + '</pre><b>' + (n ? '❌ ' : '✅ ') + esc(c.text(n)) + '</b>';
      ran[k] = 1; if (Object.keys(ran).length === 4) done('tool-dq'); }); }); }

/* ---------- gantt ---------- */
const STAT = {done:'הושלמה', in_progress:'בעבודה', late:'באיחור', not_started:'טרם התחילה'};
function renderGantt(){ const box = $('#gantt'); if (!box) return; const tasks = tbl('tasks'), w = week(), team = tbl('team');
  let h = '<div class="g-in"><div class="g-head"><span>משימה</span><div class="g-weeks">';
  for (let k = 1; k <= 12; k++) h += '<span class="' + (k === w ? 'now' : '') + '">' + (k === w ? '▼' : '') + k + '</span>';
  h += '</div></div>';
  tasks.forEach(t => { h += '<div class="g-row"><span class="g-lab" title="' + esc(t.name) + '">' + esc(t.name) + '</span><div class="g-track"><div class="g-bar ' + t.status + '" data-id="' + t.id + '" style="grid-column:' + t.start_week + ' / span ' + (t.end_week - t.start_week + 1) + '"><i style="width:' + t.pct_done + '%"></i></div></div></div>'; });
  h += '</div><div class="g-legend"><span><i style="background:#34d399"></i>הושלמה</span><span><i style="background:#fbbf24"></i>בעבודה</span><span><i style="background:#f87171"></i>באיחור</span><span><i style="background:#cbd5e1"></i>טרם התחילה</span><span>▼ השבוע הנוכחי (' + w + ') · החלק הכהה בכל פס הוא מה שכבר בוצע</span></div><div class="g-info" id="gInfo">לחצו על פס כדי לראות את פרטי המשימה.</div>';
  box.innerHTML = h;
  $$('.g-bar', box).forEach(b => b.addEventListener('click', () => { const t = tasks.find(x => x.id === +b.dataset.id); $$('.g-bar', box).forEach(x=>x.classList.remove('sel')); b.classList.add('sel');
    const own = (team.find(m=>m.id===t.owner_id)||{}).name || ''; const lateBy = t.status === 'late' ? ' · <b style="color:#b91c1c">מאחרת ' + (w - t.end_week) + ' שבועות</b>' : '';
    $('#gInfo').innerHTML = '<b>' + esc(t.name) + '</b> · ' + esc(own) + ' · שבועות ' + t.start_week + ' עד ' + t.end_week + ' · תקציב <span class="n">' + nis(t.budget) + ' ₪</span> · בוצע <span class="n">' + t.pct_done + '%</span> · ' + STAT[t.status] + lateBy;
    done('tool-gantt'); })); }

/* ---------- s-curve ---------- */
function renderScurve(){ const box = $('#scurve'); if (!box) return; const tasks = tbl('tasks'), costs = tbl('costs'), m = metrics(), w = m.week;
  const W = 640, H = 290, L = 46, R = 18, T = 16, B = 30, maxY = 130000;
  const X = k => L + (W-L-R)*(k/12), Y = v => T + (H-T-B)*(1 - v/maxY);
  const planned = [0], actual = [0];
  for (let k = 1; k <= 12; k++) planned.push(plannedAt(tasks, k));
  for (let k = 1; k <= w; k++) actual.push(sum(costs.filter(c=>c.week <= k), c=>c.amount));
  const path = arr => arr.map((v,k)=>(k ? 'L' : 'M') + X(k).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
  let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="עקומת תכנון מול ביצוע">';
  [0,40000,80000,120000].forEach(v => { s += '<line x1="' + L + '" x2="' + (W-R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '" stroke="#e2e8f0"/><text x="' + (L-6) + '" y="' + (Y(v)+4) + '" text-anchor="end" font-size="11" fill="#64748b">' + (v/1000) + 'K</text>'; });
  for (let k = 1; k <= 12; k++) s += '<text x="' + X(k) + '" y="' + (H-10) + '" text-anchor="middle" font-size="11" fill="' + (k === w ? '#b91c1c' : '#64748b') + '" font-weight="' + (k === w ? 800 : 400) + '">' + k + '</text>';
  s += '<line x1="' + X(w) + '" x2="' + X(w) + '" y1="' + T + '" y2="' + (H-B) + '" stroke="#b91c1c" stroke-dasharray="5 4"/>';
  s += '<path d="' + path(planned) + '" fill="none" stroke="#6366f1" stroke-width="3" stroke-linejoin="round"/>';
  s += '<path d="' + path(actual) + '" fill="none" stroke="#ef4444" stroke-width="3" stroke-linejoin="round"/>';
  s += '<circle cx="' + X(w) + '" cy="' + Y(m.planned) + '" r="5" fill="#6366f1"/><circle cx="' + X(w) + '" cy="' + Y(m.spent) + '" r="5" fill="#ef4444"/>';
  s += '<circle cx="' + X(w) + '" cy="' + Y(m.earned) + '" r="8" fill="#10b981" stroke="#fff" stroke-width="2"/></svg>';
  s += '<div class="legend"><span><i style="background:#6366f1"></i>תכנון מצטבר</span><span><i style="background:#ef4444"></i>הוצאה בפועל</span><span><i style="background:#10b981;height:10px;width:10px;border-radius:50%"></i>שווי העבודה שבוצעה</span><span style="color:#b91c1c">┊ היום (שבוע ' + w + ')</span></div>';
  s += '<div class="big2"><div><div class="v">' + nis(m.planned) + ' ₪</div><div class="l">תוכנן לבצע עד היום</div></div><div><div class="v" style="color:#dc2626">' + nis(m.spent) + ' ₪</div><div class="l">שולם בפועל</div></div><div><div class="v" style="color:#059669">' + nis(m.earned) + ' ₪</div><div class="l">שווי העבודה שבוצעה באמת</div></div></div>';
  box.innerHTML = s; }

/* ---------- forecast ---------- */
function forecast(m, opts){ const o = opts || {}; let remaining = m.budget - m.earned - (o.cut || 0);
  const rate = m.earned / m.week, cpw = m.spent / m.earned;
  return {end: m.week + remaining / (rate * (1 + (o.speed || 0))), cost: m.spent + remaining * cpw * (1 - (o.save || 0)) + (o.extra || 0)}; }
function renderForecast(){ const out = $('#fcOut'); if (!out) return; const m = metrics();
  const sp = +$('#fcSpeed').value, sv = +$('#fcSave').value; $('#fcSpeedV').textContent = sp + '%'; $('#fcSaveV').textContent = sv + '%';
  const f = forecast(m, {speed: sp/100, save: sv/100});
  out.innerHTML = '<div class="big2"><div class="' + (f.end > 12.05 ? 'bad' : 'good') + '"><div class="v">שבוע ' + f1(f.end) + '</div><div class="l">סיום צפוי (תכנון: שבוע 12)</div></div><div class="' + (f.cost > m.budget + 1 ? 'bad' : 'good') + '"><div class="v">' + nis(f.cost) + ' ₪</div><div class="l">עלות צפויה בסיום (תקציב: ' + nis(m.budget) + ' ₪)</div></div></div>'
    + '<p style="margin:0;font-size:.93rem">איך חישבנו: בוצעה עבודה בשווי <span class="n">' + nis(m.earned) + ' ₪</span> ב-<span class="n">' + m.week + '</span> שבועות, כלומר <span class="n">' + nis(m.earned/m.week) + ' ₪</span> בשבוע. נשארה עבודה בשווי <span class="n">' + nis(m.budget - m.earned) + ' ₪</span>. וכל שקל של עבודה עלה לנו בפועל <span class="n">' + (m.spent/m.earned).toFixed(2) + ' ₪</span>.</p>'; }

/* ---------- heat map ---------- */
function renderHeat(){ const box = $('#heat'); if (!box) return; const rs = riskRows(); let h = '<div class="hl"></div>';
  for (let p = 1; p <= 5; p++) h += '<div class="hl">' + p + '</div>';
  for (let s = 5; s >= 1; s--){ h += '<div class="hl">' + s + '</div>';
    for (let p = 1; p <= 5; p++){ const n = rs.filter(r => r.severity === s && r.probability === p).length, e = s*p; h += '<div class="hc ' + (e >= 15 ? 'r' : (e >= 8 ? 'y' : 'g')) + '" data-s="' + s + '" data-p="' + p + '">' + (n || '') + '</div>'; } }
  box.innerHTML = h;
  $$('.hc', box).forEach(c => c.addEventListener('click', () => { $$('.hc', box).forEach(x=>x.classList.remove('sel')); c.classList.add('sel');
    const list = rs.filter(r => r.severity === +c.dataset.s && r.probability === +c.dataset.p);
    $('#heatInfo').innerHTML = '<b>חומרה ' + c.dataset.s + ' × סבירות ' + c.dataset.p + ' = חשיפה ' + (c.dataset.s * c.dataset.p) + '.</b> ' + (list.length ? list.map(r => '״' + esc(r.title) + '״ (' + esc(r.owner) + ')').join(' · ') : 'אין סיכונים במשבצת הזו.');
    done('tool-heat'); })); }

/* ---------- board + chart ---------- */
function lampClass(v, y, r){ return v >= r ? 'r' : (v >= y ? 'y' : 'g'); }
function renderBoard(){ if (!$('#kGap')) return; const m = metrics();
  $('#kWeek').textContent = m.week; $('#kGap').textContent = f1(m.gap);
  $('#kMoney').textContent = f1(m.pctMoney) + '%'; $('#kMoneyS').textContent = nis(m.spent) + ' ₪ מתוך ' + nis(m.budget);
  $('#kTime').textContent = f1(m.pctTime) + '%'; $('#kWork').textContent = f1(m.pctWork) + '%';
  $('#kLate').textContent = m.late; $('#kRisk').textContent = m.topExp; $('#kRiskS').textContent = m.topRisk;
  $('#lGap').className = 'lamp ' + lampClass(m.gap, +$('#yGap').value, +$('#rGap').value);
  $('#lLate').className = 'lamp ' + lampClass(m.late, +$('#yLate').value, +$('#rLate').value);
  $('#lRisk').className = 'lamp ' + lampClass(m.topExp, +$('#yRisk').value, +$('#rRisk').value); }
const DIM = {phase:['t.phase','שלב'], owner:['m.name','אחראי/ת'], status:['t.status','סטטוס']};
const MET = {budget:['SUM(t.budget)','תקציב מתוכנן (₪)',false], actual:['SUM(c.amount)','הוצאה בפועל (₪)',true], count:['COUNT(*)','מספר משימות',false], prog:['ROUND(AVG(t.pct_done), 0)','אחוז ביצוע ממוצע',false]};
function chartSQL(d, mt){ const from = MET[mt][2] ? 'FROM costs c\nJOIN tasks t ON t.id = c.task_id\nJOIN team m ON m.id = t.owner_id' : 'FROM tasks t\nJOIN team m ON m.id = t.owner_id';
  return 'SELECT ' + DIM[d][0] + ' AS label, ' + MET[mt][0] + ' AS value\n' + from + '\nGROUP BY ' + DIM[d][0] + '\nORDER BY value DESC'; }
function renderChart(){ if (!$('#chartOut')) return; const d = $('#cDim').value, mt = $('#cMet').value, sql = chartSQL(d, mt); $('#chartSql').textContent = sql;
  let rows; if (state.engine){ try { rows = q(sql).values; } catch(e){ rows = []; } } else rows = D.charts[d + '_' + mt] || [];
  const mx = Math.max.apply(null, rows.map(r => +r[1]).concat([1]));
  let h = '<p style="font-weight:800;margin:4px 0 8px">' + MET[mt][1] + ' לפי ' + DIM[d][1] + '</p>';
  rows.forEach(r => { const lab = d === 'status' ? (STAT[r[0]] || r[0]) : r[0]; h += '<div class="hbar"><span>' + esc(lab) + '</span><div class="track"><i style="width:' + (100 * (+r[1]) / mx) + '%"></i></div><span class="val">' + nis(r[1]) + '</span></div>'; });
  $('#chartOut').innerHTML = h; }

/* ---------- prompt builder + risks ---------- */
function dataBlock(){ const m = metrics(), L = [];
  L.push('פרויקט: "מהפתק לטאבלט", מערכת הזמנות למסעדה. שבוע ' + m.week + ' מתוך 12.');
  L.push('תקציב כולל: ' + nis(m.budget) + ' ש"ח. הוצאה בפועל: ' + nis(m.spent) + ' ש"ח (' + f1(m.pctMoney) + '% מהתקציב).');
  L.push('זמן שעבר: ' + f1(m.pctTime) + '%. עבודה שבוצעה (משוקלל לפי תקציב): ' + f1(m.pctWork) + '%.');
  lateRows().forEach(r => L.push('משימה באיחור: ' + r.name + ' | אחראי/ת: ' + r.owner + ' | סיום מתוכנן: שבוע ' + r.end + ' | בוצע: ' + r.pct + '%'));
  riskRows().forEach(r => L.push('סיכון: ' + r.title + ' | חומרה ' + r.severity + ' | סבירות ' + r.probability + ' | חשיפה ' + r.e));
  return L.join('\n'); }
function renderPrompt(){ if (!$('#pOut')) return; const cons = $('#pCons').value.trim();
  $('#pOut').textContent = 'הקשר: ' + $('#pCtx').value.trim() + '\n\nמשימה: ' + $('#pTask').value.trim() + '\n\nאילוצים: ' + (cons || '[כתבו כאן לפחות אילוץ אחד]') + '\n\nפורמט: ' + $('#pFmt').value.trim() + '\n\nהנתונים:\n' + dataBlock(); }
function renderRiskTable(){ if (!$('#rTable')) return; $('#rTable').innerHTML = tableHTML({columns:['title','severity','probability','exposure','owner'], values: riskRows().map(r=>[r.title, r.severity, r.probability, r.e, r.owner])}); }
function addRisk(){ const t = $('#rTitle').value.trim(), s = Math.max(1, Math.min(5, +$('#rSev').value || 1)), p = Math.max(1, Math.min(5, +$('#rProb').value || 1));
  $('#rSql').style.display = 'block';
  if (t.length < 4){ $('#rSql').textContent = '-- כתבו קודם תיאור קצר של הסיכון'; return; }
  const sql = "INSERT INTO risks (title, severity, probability, owner_id, status) VALUES ('" + t.replace(/'/g, "''") + "', " + s + ", " + p + ", 1, 'open')";
  $('#rSql').textContent = sql.replace(' VALUES', '\nVALUES') + ';';
  if (state.engine){ try { db.run(sql); } catch(e){} }
  store.journal.push(sql); store.risksAdded.push({title:t, severity:s, probability:p}); save();
  $('#rTitle').value = ''; done('tool-risk'); refreshAll(); }

/* ---------- alerts ---------- */
function evalAlerts(){ if (!$('#alOut')) return; const X = +$('#thGap').value, N = +$('#thLate').value, S = +$('#thRisk').value, m = metrics(), A = [];
  if (m.gap > X) A.push({ic:'💸', t:'פער של ' + f1(m.gap) + ' נקודות: יצא ' + f1(m.pctMoney) + '% מהכסף, בוצע ' + f1(m.pctWork) + '% מהעבודה', to:'אתי (מנהלת הפרויקט) ומיסטר אולאף (נותן החסות)'});
  lateRows().forEach(r => { if (r.w > N) A.push({ic:'⏰', t:'״' + r.name + '״ מאחרת ' + r.w + ' שבועות (בוצע ' + r.pct + '%)', to: r.owner + ' ואתי'}); });
  riskRows().forEach(r => { if (r.e >= S) A.push({ic:'⚠️', t:'סיכון בחשיפה ' + r.e + ': ' + r.title, to: r.owner + ' ואתי'}); });
  const n = A.length; let h = '<h3>שבוע ' + m.week + ': נדלקו ' + n + ' התראות</h3>';
  if (n === 0) h += '<div class="verdict y">😴 שומר ישן. אף כלל לא נדלק, למרות שהפרויקט באיחור ובחריגה. הספים גבוהים מדי.</div>';
  else if (n <= 6) h += '<div class="verdict g">👍 מאוזן. מספר התראות שבן אדם באמת יקרא, וכל אחת מהן מצדיקה פעולה.</div>';
  else h += '<div class="verdict r">🔕 עייפות התראות. ' + n + ' הודעות בבוקר אחד? אחרי שבוע כולם ישתיקו את הערוץ.</div>';
  A.forEach(a => { h += '<div class="alert"><span class="ic">' + a.ic + '</span><div><b>' + esc(a.t) + '</b><small>נשלח אל: ' + esc(a.to) + '</small></div></div>'; });
  $('#alOut').innerHTML = h; done('tool-alerts'); }
function nextWeek(){ if (week() !== 9){ if (state.engine) D.week9.forEach(s => db.run(s)); store.journal.push('WEEK9'); save(); refreshAll(); } evalAlerts(); done('tool-week9'); }
function resetWeek(){ store.journal = store.journal.filter(e => e !== 'WEEK9'); save(); if (state.engine) seed(); refreshAll(); if ($('#alOut')) $('#alOut').innerHTML = '<p class="rc">חזרנו לשבוע 8.</p>'; }

/* ---------- decision simulator ---------- */
function renderSim(){ const out = $('#simOut'); if (!out) return; const m = metrics(), tasks = tbl('tasks'), risks = tbl('risks');
  const A = $('#simA').checked, B = $('#simB').checked, C = $('#simC').checked;
  $$('.sim label.opt2').forEach(l => l.classList.toggle('on', $('input', l).checked));
  const t10 = tasks.find(t => t.id === 10), cut = (A && t10) ? t10.budget * (1 - t10.pct_done/100) : 0;
  const base = forecast(m, {}), f = forecast(m, {cut: cut, speed: B ? 0.25 : 0, extra: (B ? 12000 : 0) + (C ? 2000 : 0)});
  const top = arr => arr.sort((a,b)=>b.e-a.e)[0] || {t:'', e:0};
  const r0 = top(risks.map(r=>({t:r.title, e:r.severity*r.probability}))), r1 = top(risks.map(r=>({t:r.title, e:r.severity*((C && r.id === 1) ? 2 : r.probability)})));
  const cls = (v, lim) => v > lim ? ' style="color:#b91c1c;font-weight:800"' : ' style="color:#047857;font-weight:800"';
  out.innerHTML = '<div class="tw"><table><tr><th>מדד</th><th>אם לא מחליטים כלום</th><th>עם ההחלטות שסימנתם</th></tr>'
    + '<tr><td>סיום צפוי (תכנון: שבוע 12)</td><td class="num">שבוע ' + f1(base.end) + '</td><td class="num"' + cls(f.end, 12.05) + '>שבוע ' + f1(f.end) + '</td></tr>'
    + '<tr><td>עלות צפויה (תקציב: ' + nis(m.budget) + ' ₪)</td><td class="num">' + nis(base.cost) + ' ₪</td><td class="num"' + cls(f.cost, m.budget) + '>' + nis(f.cost) + ' ₪</td></tr>'
    + '<tr><td>הסיכון הגבוה ביותר</td><td>' + esc(r0.t) + ' (' + r0.e + ')</td><td>' + esc(r1.t) + ' (' + r1.e + ')</td></tr></table></div>'
    + '<p style="font-size:.9rem;color:var(--muted);margin:4px 0 0">זה מודל פשטני בכוונה: הוא מניח שהקצב והעלות עד היום יימשכו. המטרה היא להשוות חלופות, לא לנבא את העתיד.</p>';
  if (A || B || C) done('tool-sim'); }


/* ---------- auto charts (part 4) ---------- */
function renderAuto(){ $$('.autochart').forEach(box => { const key = box.dataset.key, sql = D.charts4[key]; let rows;
  if (state.engine){ try { rows = q(sql).values; } catch(e){ rows = D.expected[key].values; } } else rows = D.expected[key].values;
  const unit = box.dataset.unit || '', mx = unit === '%' ? 100 : Math.max.apply(null, rows.map(r => +r[1]).concat([1]));
  let h = '<p style="font-weight:800;margin:4px 0 8px">' + esc(box.dataset.title || '') + '</p>';
  rows.forEach(r => { h += '<div class="hbar"><span>' + esc(r[0]) + '</span><div class="track"><i style="width:' + (100 * (+r[1]) / mx) + '%"></i></div><span class="val">' + nis(r[1]) + unit + '</span></div>'; });
  box.innerHTML = h; }); }
/* ---------- fun widgets ---------- */
const EX_A = [`זה לא באיחור,`, `טכנית זה גמור,`, `ה-90% האלה יציבים מאוד,`, `הקוד מושלם,`, `אצלי במחשב זה עובד,`, `אני לא מבינה מה הלחץ,`];
const EX_B = [`רק מחכים לאישור של חברת הסליקה`, `נשאר רק ליטוש קטן של כמה שבועות`, `פשוט הדרישות השתנו מאז שלא קראתי אותן`, `ה-Wi-Fi של המסעדה מקנא בנו`, `המלצרים עוד לא בשלים לגדולה`, `זה תלוי בצוות אחר, שבמקרה הוא גם אני`, `מיסטר אולאף ביקש עוד כפתור אחד קטן`];
const EX_C = [`וחוץ מזה, 90% זה כמעט 100%.`, `נסגור את זה עד השבוע הבא. או זה שאחריו.`, `מי שמבין בטכנולוגיה יודע שככה זה.`, `אני מציעה שנדבר על זה אחרי החגים.`, `ובכל מקרה, זה באחריות הנהלת החשבונות.`];
// ---------- v6: gradual reveal, jokes, small celebrations ----------
const JOKES = [
  ['כמה מנהלי פרויקטים צריך כדי להחליף נורה?','אף אחד. זה לא היה בתכולה. נכניס את זה לגרסה הבאה.'],
  ['מה ההבדל בין מנהל פרויקט לאופטימיסט?','האופטימיסט יודע שהוא אופטימיסט.'],
  ['לקוח: ״זה רק שינוי קטן, נכון?״','המפתחת: ״בטח. קטן. כמו להזיז את המטבח לקומה השנייה.״'],
  ['שאילתה נכנסת לבר, ניגשת לשתי טבלאות ושואלת:','״אפשר להצטרף?״ (JOIN)'],
  ['למה מסד הנתונים נפרד מהאקסל?','לא היו ביניהם קשרים. רק תאים ממוזגים.'],
  ['הפרויקט גמור ב-90%. כמה זמן נשאר?','עוד 90%.'],
  ['מה שלושת המשפטים הכי נפוצים בפרויקט?','״זה כמעט גמור.״ ״אצלי זה עובד.״ ״נתעד את זה אחר כך.״'],
  ['מה ההבדל בין סיכון לבעיה?','סיכון הוא בעיה שעוד לא הגיעה לישיבת הסטטוס.'],
  ['איך קוראים ללוח זמנים שאף אחד לא מאמין בו?','״לוח זמנים מאושר.״'],
  ['ביקשתי מהבינה המלאכותית דוח סטטוס אופטימי.','היא כתבה: ״הפרויקט מתקדם מצוין.״ על פרויקט אחר.'],
  ['כמה התראות צריך כדי שמישהו יגיב?','אחת. בתנאי שהיא היחידה.'],
  ['מה ההגדרה של ישיבה מוצלחת?','ישיבה שנגמרת עם פחות ישיבות המשך ממה שהתחילה.'],
  ['שאלו את ד״ר קונדילה מתי המערכת תהיה מוכנה.','״טכנית, היא כבר מוכנה. מעשית, תשאלו שוב בשבוע הבא.״'],
  ['למה השף אוהב את המערכת החדשה?','סוף סוף הוא לא צריך לפענח כתב יד של מלצר בשעת לחץ.'],
  ['מה המשפט הכי מסוכן בפרויקט?','״תמיד עשינו את זה ככה.״']
];
function fxPop(id){ try {
  const e = $('[data-act="' + id + '"]'); if (!e) return; const r = e.getBoundingClientRect();
  const p = document.createElement('div'); p.className = 'fxpop'; p.textContent = ['🎉','✨','👏','💪','🥳'][Math.floor(Math.random() * 5)];
  p.style.top = Math.max(50, Math.min(innerHeight - 90, r.top + 10)) + 'px'; p.style.left = Math.max(10, r.left + 24) + 'px';
  document.body.appendChild(p); setTimeout(() => p.remove(), 1200);
  const mine = ACTS[PAGE] || []; if (mine.length && mine.every(i => store.acts[i])) fxConfetti();
} catch (_) {} }
function fxConfetti(){ try { const em = ['🎉','🎊','⭐','🍽️','👑','✨'];
  for (let i = 0; i < 36; i++){ const c = document.createElement('div'); c.className = 'fxc'; c.textContent = em[i % em.length];
    c.style.left = (Math.random() * 96) + 'vw'; c.style.animationDuration = (2.2 + Math.random() * 2) + 's'; c.style.animationDelay = (Math.random() * .8) + 's';
    document.body.appendChild(c); setTimeout(() => c.remove(), 5200); } } catch (_) {} }
function initFx(){ try {
  // "what does it have to do with us" opens on click
  $$('.news .link').forEach(l => { const b = document.createElement('button'); b.className = 'btn lite newsbtn'; b.textContent = '🤔 מה הקשר אלינו? נחשו, ואז לחצו';
    l.style.display = 'none'; l.parentNode.insertBefore(b, l); b.onclick = () => { l.style.display = ''; l.classList.add('pop'); b.remove(); }; });
  // a joke before every station except the first
  const start = [0, 0, 5, 9, 12][PAGE] || 0;
  $$('section.sec').forEach((s, i) => { if (!i) return; const jk = JOKES[(start + i - 1) % JOKES.length]; const d = document.createElement('div'); d.className = 'joke';
    d.innerHTML = '<span class="jq">😄 הפסקת חיוך: ' + jk[0] + '</span><button class="btn lite">🥁 לפאנץ׳</button><span class="ja" style="display:none">' + jk[1] + '</span>';
    $('button', d).onclick = function(){ const a = $('.ja', d); a.style.display = ''; a.classList.add('pop'); this.remove(); };
    s.parentNode.insertBefore(d, s); });
  // gradual reveal on scroll
  if (!('IntersectionObserver' in window) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  const io = new IntersectionObserver(es => { es.forEach(en => { if (!en.isIntersecting) return; const t = en.target; io.unobserve(t); t.classList.add('in');
    if (t.classList.contains('rv')) setTimeout(() => t.classList.remove('rv', 'in'), 900); }); }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
  $$('.pipe, .vflow, .flow, table.route, .defs').forEach(g => { const kids = g.matches('table') ? $$('tr', g) : Array.from(g.children); if (!kids.length) return;
    kids.forEach((k, i) => { k.classList.add('rvc'); k.style.setProperty('--i', Math.min(i, 14)); }); g.classList.add('rvg'); io.observe(g); });
  $$('.why, .rem, .def, .world, .news, .tip, .hand, .yev, .kondila, .fun, .joke, .credo, .chat, .scene').forEach(e => { if (e.closest('.rvg')) return; e.classList.add('rv'); io.observe(e); });
} catch (_) {} }

function initFun(){
  $$('.excuse').forEach(box => { const out = $('.excuse-out', box), btn = $('button', box); let n = 0;
    btn.addEventListener('click', () => { n++; const pick = a => a[Math.floor(Math.random() * a.length)];
      out.textContent = '״' + pick(EX_A) + ' ' + pick(EX_B) + '. ' + pick(EX_C) + '״'; btn.textContent = n >= 3 ? '🎲 עוד אחד, אני לא מאמין' : '🎲 עוד תירוץ'; }); });
  $$('.bingo').forEach(box => { const cells = $$('.bc', box), msg = $('.bingo-msg', box), L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    cells.forEach(c => c.addEventListener('click', () => { c.classList.toggle('on');
      const win = L.some(l => l.every(i => cells[i].classList.contains('on')));
      msg.textContent = win ? '🎉 בינגו! ועדת ההיגוי מודה לכם ומתכנסת שוב בשבוע הבא.' : 'סימנתם ' + cells.filter(x=>x.classList.contains('on')).length + ' מתוך 9. שלושה בשורה, וניצחתם.'; })); });
}

/* ---------- csv ---------- */
function downloadCSV(name){ const rows = tbl(name); if (!rows.length) return; const cols = Object.keys(rows[0]);
  const cell = v => { const s = v === null || v === undefined ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s; };
  const csv = '﻿' + [cols.join(',')].concat(rows.map(r => cols.map(c => cell(r[c])).join(','))).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'})); a.download = name + '.csv'; document.body.appendChild(a); a.click(); a.remove(); }

/* ---------- refresh + init ---------- */
function refreshAll(){ [renderBoard, renderChart, renderPrompt, renderRiskTable, ()=>renderThree(false), renderGantt, renderScurve, renderForecast, renderHeat, renderSim, renderAuto].forEach(f => { try { f(); } catch(e){ if (window.console) console.warn(e); } }); }
function on(sel, ev, fn){ const e = $(sel); if (e) e.addEventListener(ev, fn); }
function initStatic(){
  $$('.flip').forEach(c => c.addEventListener('click', () => c.classList.toggle('on')));
  initPipes(); initSteps(); initMatch(); initPick(); initQuiz(); initDQ(); initFun(); initFx();
  // audit
  $$('#audit .sent').forEach(s => s.addEventListener('click', () => { if (!s.classList.contains('shown')) s.classList.toggle('sel'); }));
  on('#auditCheck', 'click', () => { let hit = 0, wrong = 0;
    $$('#audit .sent').forEach(s => { const bad = s.dataset.bad === '1', sel = s.classList.contains('sel'); s.classList.remove('sel'); s.classList.add('shown');
      if (bad && sel){ s.classList.add('right'); hit++; } else if (bad){ s.classList.add('missed'); } else if (sel){ s.classList.add('missed'); wrong++; } else s.classList.add('right'); });
    $('#auditFb').textContent = 'תפסתם ' + hit + ' מתוך 5 משפטים בעייתיים' + (wrong ? ', וסימנתם ' + wrong + ' משפטים תקינים' : '') + '. ההסברים מופיעים מתחת לכל משפט.'; done('tool-audit'); });
  // prompt
  ['pCtx','pTask','pCons','pFmt'].forEach(id => on('#'+id, 'input', renderPrompt));
  on('#consShow', 'click', () => { $('#pCons').value = 'השתמש אך ורק במספרים ובעובדות שמופיעים בנתונים למטה. אל תמציא סיבות או הסברים. אם חסר מידע, כתוב במפורש "לא מופיע בנתונים". אל תרכך: אם הפרויקט באיחור או בחריגה, אמור זאת בשורה הראשונה.'; renderPrompt(); });
  on('#pCopy', 'click', () => { const ok = $('#pCons').value.trim().length >= 8; copyText($('#pOut').textContent, $('#pMsg'), ok ? 'הועתק ✓ עכשיו הדביקו בצ׳אט AI' : 'הועתק, אבל בלי אילוצים. כדאי להוסיף לפחות אחד.'); if (ok) done('tool-prompt'); });
  $$('#checks input').forEach(c => c.addEventListener('change', () => { if ($$('#checks input').every(x => x.checked)) done('tool-checks'); }));
  on('#devilCopy', 'click', () => { copyText($('#devilOut').textContent, $('#devilMsg')); done('tool-devil'); });
  on('#rAdd', 'click', addRisk);
  // board
  ['yGap','rGap','yLate','rLate','yRisk','rRisk'].forEach(id => on('#'+id, 'input', () => { renderBoard(); done('tool-board'); }));
  on('#cDim', 'change', () => { renderChart(); done('tool-chart'); }); on('#cMet', 'change', () => { renderChart(); done('tool-chart'); });
  $$('[data-csv]').forEach(b => b.addEventListener('click', () => downloadCSV(b.dataset.csv)));
  // forecast
  ['fcSpeed','fcSave'].forEach(id => on('#'+id, 'input', () => { renderForecast(); done('tool-forecast'); }));
  // alerts
  on('#alRun', 'click', evalAlerts); on('#alNext', 'click', nextWeek); on('#alReset', 'click', resetWeek);
  // sim
  ['simA','simB','simC'].forEach(id => on('#'+id, 'change', renderSim));
  // status
  on('#stCopy', 'click', () => { const t = ['st1','st2','st3'].map(id => $('#'+id).value.trim());
    if (t.join('').length < 20){ $('#stMsg').textContent = 'כתבו קודם את שלושת המשפטים.'; return; }
    copyText('מצב: ' + t[0] + '\nסיכון: ' + t[1] + '\nהחלטה: ' + t[2], $('#stMsg'), 'הועתק ✓ הדביקו בצ׳אט של זום'); done('tool-status'); });
  on('#stShow', 'click', () => { $('#stExample').style.display = 'block'; });
  on('#resetAll', 'click', () => { if (confirm('לאפס את כל ההתקדמות והנתונים ולהתחיל מחדש?')){ try { localStorage.removeItem(KEY); } catch(e){} location.href = 'lecture14.html'; } });
  // station pills
  const pills = $('#pills'), secs = $$('section.sec');
  if (pills){ pills.innerHTML = secs.map(s => '<a href="#' + s.id + '">' + esc(s.dataset.t || '') + '</a>').join('');
    const links = $$('a', pills); const onScroll = () => { let cur = 0; secs.forEach((s,i) => { if (s.getBoundingClientRect().top < 170) cur = i; }); links.forEach((a,i) => a.classList.toggle('on', i === cur)); };
    document.addEventListener('scroll', onScroll, {passive:true}); onScroll(); }
  $$('.parts a').forEach((a,i) => a.classList.toggle('on', i + 1 === PAGE));
  if (document.body.classList.contains('teacher')) $$('a[href^="lecture14"]').forEach(a => { a.setAttribute('href', a.getAttribute('href') + '?teacher=1'); });
  Object.keys(store.acts).forEach(markDone);
}

buildLabs(); initStatic(); renderProgress();
Object.keys(store.acts).forEach(id => { if (id.indexOf('lab-') === 0){ const b = labBox(id.slice(4)); if (b) b.classList.add('done'); } markDone(id); });
refreshAll(); startEngine();
window.__lesson = {state:state, store:()=>store, run:runLab, show:showLab, metrics:metrics, q:(s)=>q(s), next:nextWeek, alerts:evalAlerts, acts:ACTS, week:week};
})();
