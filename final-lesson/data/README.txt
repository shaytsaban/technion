מסעדת יבגני: חבילת הנתונים של המפגש המסכם
=========================================

הקבצים
- yevgeni-postgres.sql : סכמה ונתונים ל-PostgreSQL (Supabase, Neon). מדביקים בעורך ה-SQL ומריצים.
- yevgeni-sqlite.sql : אותה סכמה ל-SQLite.
- customers.csv, dishes.csv, couriers.csv, orders.csv, order_items.csv, app_events.csv : הטבלאות כקובצי CSV (קידוד UTF-8).
- fact_sales.csv : קובץ שטוח אחד, שורה לכל פריט בהזמנה, עם עמודת line_revenue. מתאים ל-Looker Studio ול-Tableau Public.
- project_tasks.csv : משימות הפרויקט של חלק 6.

הערות
- כל הנתונים בדויים.
- בנתונים יש תקלות מכוונות: לקוח בלי עיר, לקוח כפול (שני מספרים לאותו אדם), הזמנה שמצביעה ללקוח שאינו קיים (customer_id 99) ותשר שלילי. הן חלק מהתרגיל.
- בקובץ ה-PostgreSQL אין מפתח זר על orders.customer_id. הוא מושמט במכוון: ניסיון להוסיף אותו ייכשל בגלל ההזמנה היתומה, וזו שאלת מחשבה בחלק 4.
- ב-BigQuery מעלים את קובצי ה-CSV כטבלאות (Autodetect schema). שימו לב: שדה order_ts יזוהה כטקסט, ואפשר להמיר אותו ב-PARSE_TIMESTAMP.
