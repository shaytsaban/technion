# Lesson 2 review checklist (Shay, 24.11.2026)

Each line: his remark, what is done about it, status. Slide numbers refer to the first draft (commit a525679).

| # | Remark | Action | Status |
|---|---|---|---|
| 1 | No "boom" opening; too much text in the first slides; too few beautiful, animated, non-linear flows | New opening slide: an animated map of the whole meeting, from the paper note to the manager's answer, closing as a loop. It also serves as the road map. The text slides s-what and s-road are removed || done: s-big |
| 2 | Slide 7 (system page recap) is dry | Replaced by "where a table comes from": the process runs, and every event creates or changes a row before your eyes || done: a-born |
| 3 | Slide 8 (what to remember on every order) is detached; focus on management | Replaced by the manager's dashboard: four questions Olaf manages by, and what must be recorded for each || done: a-mgr |
| 4 | The charity case needs pictures, a real press quote, a gradual managerial overview of its activities | New charity introduction: an animated activity map, its numbers, its management questions, and a verified press quote || done: a-case, a-press, a-mgr2 |
| 5 | Slide 10: why know entity, attribute, action? Feels like memorising | Replaced by a flow: from an interview sentence to tables, columns and system actions; the sorter asks "where does each word go" || done: a-listen, a-sortw |
| 6 | Slide 11 ("what four words do not say") is unclear; use professional IS language, pictures, systemic structure | Replaced by the tech lead's handover note: seven concrete questions, each answered by one part of the meeting || done: a-kond |
| 7 | Slide 12 (data model) is strange: where is it in the process and the project? | Replaced by two slides: the project life cycle with "you are here", and the three levels of a model (conceptual, logical, physical) on the architect metaphor of meeting 1 || done: a-sdlc, a-layers |
| 8 | Slide 13 (interim stop) feels artificial | All HAVE interim stops removed; each part opens with a bridge slide instead || done: all v-N removed |
| 9 | Slide 14 title "why one sheet breaks" is unclear | Part renamed in business language: "Etti's sheet: when the same detail is written again and again" || done: p-2 |
| 10 | Back and forth between bistro and charity is confusing | Rule stated on slide 2 and kept: the bistro is the one thread for teaching; the charity appears only in practice blocks at the end of a part, each tagged with a visible badge || done: s-how, badge on 22 slides |
| 11 | A companion slide for each anomaly, with animation, a clear table and something nice | Update, insert and delete each get a companion slide: a three panel animated strip, a before and after table, a definition and the business cost || done: b-upd2, b-ins2, b-del2 |
| 12 | Normalization must be built intuitively, step by step, before the rule | Three new steps before the rule: the phone contacts analogy, painting the sheet's columns by subject, the coloured columns moving to their tables || done: n-phone, n-paint, n-move, b-rule |
| 13 | Slide 28 (a supplier for each dish) only in words | Rebuilt as a table walk: the supplier columns, the repetition, the two failures, then the fix as two tables and its SQL || done: b-sup1, b-sup2, h-alter |
| 14 | Data types without SQL syntax; show a full statement and the table it creates | A database tool mock: CREATE TABLE with the types, the table that appears, a row inserted, the sort that now works || done: c-anat, c-sqlt, c-sqlt2 |
| 15 | Constraints must be shown as a diagram and animation before the technical form | New "gatekeeper at the table's door" animation, then four rules as pictures, then the SQL || done: c-gate, c-rules, c-create |
| 16 | Breaking a rule: show the SQL, step by step | INSERT attempts in the database tool, with the real SQLite messages (checked by the build) || done: c-viol, d-pkdb, d-orph, d-del, f-sql |
| 17 | Before keys: link back, beside mock ups of the related tables | Bridge slide: the three tables so far, each fine alone, and the question that crosses between them || done: d-bridge |
| 18 | Same link back before relationships and every main topic | A bridge slide opens parts 3 to 8 || done: c-bridge, d-bridge, e-bridge, f-bridge |
| 19 | Show how a relationship is actually created: in SQL, or in another tool | New slide: drawing the line in a modelling tool, the FOREIGN KEY line it produces, and the database that enforces it || done: e-how |
| 20 | The junction table is too hard; break it down | Rebuilt in small steps: the receipt, header and lines, the two questions on real rows, a table built column by column, reading one line across three tables, then the name, the SQL and the receipt rebuilt by a query || done: f-two to f-join (8 steps) |
| 21 | Drop the AI assistant part; expand SQL commands where relevant and end with a real product | Part 8 is now SQL: two families of commands, the creation order, the note as INSERT commands, business events as commands, a change request, and the final product: diagram, data dictionary, SQL script (bistro.sql, runs as is) and assumptions || done: part 8: h-fam to h-product |
| 22 | Think about the spirit, also for later lessons | Principles written to STRATEGY.md and to memory || done: STRATEGY.md, memory |

## Round 3 (24.11.2026, evening): proofread, queries, real world, summary, take-home

| # | Request | Action | Status |
|---|---|---|---|
| 23 | Proofread again | Full text of the deck, worksheet and glossary proofread by a second reader; story conflicts fixed (the new waiter got two ids; an order "opened by mistake" that had a dish) | done |
| 24 | Gradual build and illustration of queries | Every new command read part by part in the order the database executes it, lines revealed in that order: b-anat (UPDATE), c-ins (INSERT, values coloured to their columns), d-delall (DELETE), f-join (FROM, JOIN, WHERE, SELECT with the source tables reacting) | done |
| 25 | Common mistakes in SQL | b-nowhere (UPDATE without WHERE), d-delall (DELETE without WHERE), f-swap (values in the wrong order: accepted silently) | done |
| 26 | Real world and the managerial side | g-priv (permissions table, Amendment 13 of the Privacy Protection Law, in force 14.8.2025), h-migr (cleaning Etti's sheet before migration), h-pm (work plan derived from the model), NASA units example in h-dict, delivery-app example in f-junc | done |
| 27 | Visual pass | Gate stamps fixed (a kit rule forced left to right), cheat-sheet chips, class-name collisions with the original kit removed | done |
| 28 | How the summary is built | Final table state after every walk, pictures of five key slides, practice in its own section without answers, compact answer key at the end, lesson glossary | done |
| 29 | Homework / take-home | Online worksheet in seven parts with rubric (homework.html, homework.pdf), starter SQL with six blanks (amuta_starter.sql), private solution outside the repo | done |
| 30 | Taught lesson untouched | Lesson 1 builds from `frozen/l1/`, byte-identical to the deck taught on 23.11 (commit 6a249cf) | done |
