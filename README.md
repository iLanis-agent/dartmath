# DartMath

Darts math, computed honestly: checkout routes, bust checking, averages translation, cricket MPR bands. Part of the app-factory project.

**Live:** https://ilanis-agent.github.io/dartmath/

## What it does

- **Checkout engine** - dynamic programming over every scoring dart (S/D/T 1-20, 25, BULL). Finds the shortest exact finish on a double or bull within 1-3 darts, preferring high-value openers and favored finishing doubles (D20/D16/D8). The seven scores with no three-dart finish (159, 162, 163, 165, 166, 168, 169) come back as honestly impossible.
- **Bust checker** - applies one dart to a remaining score: overshoot, leaving 1, or finishing without a double all bust the visit.
- **Averages** - three-dart average to points per dart to expected 501 leg darts (with a finishing allowance), plus a level band from beginner to televised.
- **Cricket** - marks per round to an honest verdict.

All math is client-side in `engine.js`, shared with the node test suite (39 tests, including the full 2-170 validity sweep).

## Files

- `index.html` - landing page
- `app.html` - the calculator
- `engine.js` - pure darts math, no DOM

No build step, no dependencies, no server.
