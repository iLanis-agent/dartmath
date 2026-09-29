/* DartMath engine - darts scoring and checkout math, no DOM. */
(function (root) {
  'use strict';

  // Every scoring dart: singles, doubles, trebles 1-20, outer 25, bull 50 (a double).
  function allDarts() {
    var d = [];
    for (var n = 1; n <= 20; n++) {
      d.push({ label: 'S' + n, value: n, mult: 1, num: n, finisher: false });
      d.push({ label: 'D' + n, value: 2 * n, mult: 2, num: n, finisher: true });
      d.push({ label: 'T' + n, value: 3 * n, mult: 3, num: n, finisher: false });
    }
    d.push({ label: '25', value: 25, mult: 1, num: 25, finisher: false });
    d.push({ label: 'BULL', value: 50, mult: 2, num: 25, finisher: true });
    return d;
  }
  var DARTS = allDarts();

  // Preferred finishing doubles, classic order: big board doubles people actually practice.
  var FINISH_PREF = { D20: 4, D16: 4, D8: 3, D12: 2, D18: 1, BULL: 1 };

  function parseDart(s) {
    var g = String(s).trim().toUpperCase().replace(/\s+/g, '');
    if (!g) return null;
    if (g === 'BULL' || g === '50' || g === 'DB' || g === 'DBULL') return { label: 'BULL', value: 50, mult: 2, finisher: true };
    if (g === '25') return { label: '25', value: 25, mult: 1, finisher: false };
    var m = g.match(/^([SDT]?)(\d{1,2})$/);
    if (!m) return null;
    var num = parseInt(m[2], 10);
    if (num < 1 || num > 20) return null;
    var mult = m[1] === 'T' ? 3 : m[1] === 'D' ? 2 : 1;
    var label = (m[1] || 'S') + num;
    return { label: label, value: mult * num, mult: mult, finisher: mult === 2 };
  }

  // Compute a checkout route: exact finish on a double or bull, within maxDarts.
  // Preference: fewest darts, then highest first-dart value, then a favored finishing double.
  var memo = {};
  function solve(score, darts) {
    if (score < 2) return null;
    var key = score + ',' + darts;
    if (memo[key] !== undefined) return memo[key];
    var best = null;
    for (var i = 0; i < DARTS.length; i++) {
      var d = DARTS[i];
      if (d.value > score) continue;
      var rest = score - d.value;
      if (rest === 0) {
        if (!d.finisher) continue;
        var solo = [d.label];
        if (!best || rankLess(rank(solo), rank(best))) best = solo;
        continue;
      }
      if (darts < 2) continue;
      var sub = solve(rest, darts - 1);
      if (!sub) continue;
      var route = [d.label].concat(sub);
      if (!best || rankLess(rank(route), rank(best))) best = route;
    }
    memo[key] = best;
    return best;
  }
  function rank(route) {
    // lower is better: length, then negative value of first dart, then negative finish preference
    var first = parseDart(route[0]);
    var last = route[route.length - 1];
    var openPenalty = (route.length > 1 && first.mult === 2) ? 1 : 0;
    return [route.length, -(FINISH_PREF[last] || 0), openPenalty, -first.value];
  }
  function rankLess(a, b) {
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return a[i] < b[i];
    }
    return false;
  }
  function checkout(score, maxDarts) {
    maxDarts = maxDarts || 3;
    return solve(score, maxDarts);
  }

  // Apply one dart to a remaining score. Bust if it overshoots, leaves 1, or finishes without a double.
  function applyDart(remaining, dartStr) {
    var d = parseDart(dartStr);
    if (!d) return null;
    var rest = remaining - d.value;
    if (rest < 0 || rest === 1) return { remaining: remaining, bust: true, finished: false, label: d.label };
    if (rest === 0) {
      if (!d.finisher) return { remaining: remaining, bust: true, finished: false, label: d.label };
      return { remaining: 0, bust: false, finished: true, label: d.label };
    }
    return { remaining: rest, bust: false, finished: false, label: d.label };
  }

  function pointsPerDart(threeDartAvg) { return threeDartAvg / 3; }

  // Expected darts for a 501 leg at a scoring clip, plus a finishing allowance (doubles are hard).
  function expectedLegDarts(threeDartAvg) {
    var ppd = pointsPerDart(threeDartAvg);
    if (ppd <= 0) return null;
    return Math.ceil(501 / ppd) + 3;
  }

  function avgBand(avg) {
    if (avg < 30) return 'beginner - the board is still winning';
    if (avg < 40) return 'casual - trebles happen, sometimes on purpose';
    if (avg < 50) return 'solid pub player';
    if (avg < 60) return 'league standard';
    if (avg < 70) return 'county level';
    if (avg < 80) return 'serious amateur';
    if (avg < 95) return 'tour-card territory';
    return 'televised, probably';
  }

  function cricketBand(mpr) {
    if (mpr < 1) return 'still finding the wedges';
    if (mpr < 2) return 'casual';
    if (mpr < 2.5) return 'league standard';
    if (mpr < 3) return 'strong league player';
    if (mpr < 4) return 'advanced';
    return 'elite - close out or get buried';
  }

  var api = {
    parseDart: parseDart,
    checkout: checkout,
    applyDart: applyDart,
    pointsPerDart: pointsPerDart,
    expectedLegDarts: expectedLegDarts,
    avgBand: avgBand,
    cricketBand: cricketBand
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.DartMath = api;
})(typeof window !== 'undefined' ? window : globalThis);
