# Lesson 1 kit, frozen as taught (commit 6a249cf, 23.11.2026)

Lesson 1 was taught from this version of `content_a.py`, `act.js` and `deck.css`. `build_deck.py 1` and `build_summary.py 1` read these copies, so later changes to the shared kit (made for lesson 2 and on) never change the taught deck.
Check after any kit change: `python3 build_deck.py 1 && git diff 6a249cf -- ../lectures/lecture-1/presentation.html` must print nothing.
