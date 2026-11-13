// PokerChip Time Killer — poker engine (no DOM; also runs inside the hint Web Worker)
// Card encoding: 0..51 = rank*4 + suit (rank 0..12 = 2..A, suit 0..3 = ♠♥♦♣); 52 = Joker.
var JOKER = 52;
var C = { NRF:0, FOUR_DEUCES:1, WRF:2, FIVE:3, SF:4, A4K:5, L4K:6, A4:7, L4:8, K4:9,
          FH:10, FL:11, ST:12, T3:13, TP:14, PAIR:15, NONE:16 };
var NCODES = 17;
var ROYAL_MASK = 0x1F00, WHEEL_MASK = 0x100F;
var _cnt = new Int8Array(13);

function makeDeck(joker) { var d = []; for (var i = 0; i < 52; i++) d.push(i); if (joker) d.push(JOKER); return d; }

function randInt(n) {
  var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n;
  do { crypto.getRandomValues(a); } while (a[0] >= lim);
  return a[0] % n;
}
function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = randInt(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

// mode: 0 = no wilds, 1 = deuces wild, 2 = joker wild. minPair: rank index of lowest paying pair.
function evaluate(h, mode, minPair) {
  var cnt = _cnt; cnt.fill(0);
  var w = 0, suit = -1, flush = true, mask = 0, hi = -1, i, r, c;
  for (i = 0; i < 5; i++) {
    c = h[i];
    if ((mode === 2 && c === JOKER) || (mode === 1 && c < 4)) { w++; continue; }
    r = c >> 2; var s = c & 3;
    cnt[r]++; mask |= 1 << r;
    if (suit < 0) suit = s; else if (s !== suit) flush = false;
    if (r > hi) hi = r;
  }
  if (mode === 1 && w === 4) return C.FOUR_DEUCES;
  var m1 = 0, m2 = 0, r1 = -1;
  for (r = 0; r < 13; r++) { var k = cnt[r]; if (!k) continue; if (k > m1) { m2 = m1; m1 = k; r1 = r; } else if (k > m2) m2 = k; }
  var straight = false, royal = false;
  if (m1 === 1) {
    if ((mask & ~ROYAL_MASK) === 0) { royal = true; straight = true; }
    else if ((mask & ~WHEEL_MASK) === 0) straight = true;
    else for (var lo = 0; lo <= 8; lo++) if ((mask & ~(0x1F << lo)) === 0) { straight = true; break; }
  }
  if (royal && flush) return w === 0 ? C.NRF : C.WRF;
  if (m1 + w >= 5) return C.FIVE;
  if (straight && flush) return C.SF;
  if (m1 + w >= 4) {
    if (mode !== 0) return C.K4;
    var kick = -1; for (r = 0; r < 13; r++) if (cnt[r] === 1) { kick = r; break; }
    if (r1 === 12) return kick <= 2 ? C.A4K : C.A4;
    if (r1 <= 2) return (kick === 12 || kick <= 2) ? C.L4K : C.L4;
    return C.K4;
  }
  if ((m1 === 3 && m2 === 2) || (w === 1 && m1 === 2 && m2 === 2)) return C.FH;
  if (flush) return C.FL;
  if (straight) return C.ST;
  if (m1 + w >= 3) return C.T3;
  if (m1 === 2 && m2 === 2) return C.TP;
  if (m1 === 2) return r1 >= minPair ? C.PAIR : C.NONE;
  if (w === 1) return hi >= minPair ? C.PAIR : C.NONE;
  return C.NONE;
}

// Exact expected value (per coin) of all 32 hold choices, by enumerating every possible draw.
// pay[code] = payout per coin. Bit i of the index = card i held.
function enumerateEV(hand, deck, mode, minPair, pay) {
  var out = new Float64Array(32), h = hand.slice(), n = deck.length, free = [0,0,0,0,0];
  var sum, cnt, k;
  function rec(start, d) {
    if (d === k) { sum += pay[evaluate(h, mode, minPair)]; cnt++; return; }
    var slot = free[d], end = n - (k - d);
    for (var i = start; i <= end; i++) { h[slot] = deck[i]; rec(i + 1, d + 1); }
  }
  for (var m = 0; m < 32; m++) {
    k = 0;
    for (var i = 0; i < 5; i++) { if (m & (1 << i)) h[i] = hand[i]; else free[k++] = i; }
    sum = 0; cnt = 0; rec(0, 0);
    out[m] = sum / cnt;
  }
  return out;
}

if (typeof module !== 'undefined') module.exports = { JOKER:JOKER, C:C, NCODES:NCODES, makeDeck:makeDeck, shuffle:shuffle, evaluate:evaluate, enumerateEV:enumerateEV };
