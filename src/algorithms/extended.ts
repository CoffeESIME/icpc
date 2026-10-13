import { event, type TraceEvent } from "./trace";

/** A Fenwick tree over 1-based labels. Counts, never probabilities, are stored. */
export class Fenwick {
  tree: number[];
  constructor(public n: number) {
    this.tree = Array(n + 1).fill(0);
  }
  add(i: number, delta: number) {
    for (; i <= this.n; i += i & -i) this.tree[i] += delta;
  }
  sum(i: number) {
    let s = 0;
    for (; i > 0; i -= i & -i) s += this.tree[i];
    return s;
  }
}
export type QueueState = {
  active: number[];
  tree: number[];
  removed: number[];
  twice: number;
  visited: number[];
};
export const queueCode = [
  "BIT ← una unidad por etiqueta; doble ← 2n",
  "retirar a[0]; doble += n − a[0]",
  "retirar a[i]; h ← min(a[i−1], a[i])",
  "c ← restantes − BIT.prefijo(h); doble += c",
  "devolver doble / 2",
];
export function solveQueue(order: number[], trace = false) {
  const n = order.length;
  if (
    !n ||
    new Set(order).size !== n ||
    order.some((x) => !Number.isInteger(x) || x < 1 || x > n)
  )
    throw Error("Escribe una permutación de 1 a n.");
  const bit = new Fenwick(n),
    active = Array.from({ length: n }, (_, i) => i + 1),
    removed: number[] = [],
    events: TraceEvent<QueueState>[] = [];
  active.forEach((x) => bit.add(x, 1));
  let twice = 2 * n;
  const state = (visited: number[] = []): QueueState => ({
    active: [...active],
    tree: bit.tree.slice(1),
    removed: [...removed],
    twice,
    visited,
  });
  for (let i = 0; i < n; i++) {
    const before = trace ? state() : null,
      q = order[i];
    bit.add(q, -1);
    if (trace) {
      active.splice(active.indexOf(q), 1);
      removed.push(q);
    }
    const h = i ? Math.min(order[i - 1], q) : q,
      visited: number[] = [];
    for (let j = h; j > 0; j -= j & -j) visited.push(j);
    const count = i ? n - i - 1 - bit.sum(h) : n - q;
    twice += count;
    if (before)
      event(events, before, state(visited), {
        operation: `Retirar ${q}`,
        explanation: i
          ? `Entre ${order[i - 1]} y ${q}, cada etiqueta restante mayor que ${h} aporta 1/2 movimiento esperado: ${count}/2.`
          : `Los ${n - q} objetos que llegaron después de ${q} lo tapan con probabilidad 1/2. Las n retiradas ya están contadas.`,
        active: visited,
        pseudocode: i ? 3 : 1,
        variables: { umbral: h, elegibles: count, esperanza: twice / 2 },
        invariant: "BIT cuenta exactamente las etiquetas aún no retiradas.",
        partial: String(twice / 2),
      });
  }
  return { answer: twice / 2, events };
}
/** Independent physical simulation: bit i selects the initial stack of label i+1. */
export function queuePhysical(order: number[], mask: number) {
  const stacks: number[][] = [[], []];
  order.forEach((_, i) => stacks[(mask >>> i) & 1].push(i + 1));
  let cost = 0;
  for (const q of order) {
    const s = stacks[0].includes(q) ? 0 : 1;
    while (stacks[s].at(-1) !== q) {
      stacks[1 - s].push(stacks[s].pop()!);
      cost++;
    }
    stacks[s].pop();
    cost++;
  }
  return cost;
}

export const questions = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 1],
  [1, 2, 3],
];
export const det = (a: number[][]) =>
  a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) -
  a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) +
  a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
export type LieState = {
  rows: number[][];
  candidate: number[];
  agreements: number[];
  selected: number[];
  accepted: boolean;
};
export const lieCode = [
  "hacer las cinco consultas fijas",
  "enumerar las diez ternas de respuestas",
  "resolver con determinantes enteros",
  "descartar fracciones o cantidades negativas",
  "aceptar si coincide con al menos cuatro respuestas",
];
export function solveLiar(replies: number[], trace = false) {
  if (
    replies.length !== 5 ||
    replies.some((x) => !Number.isSafeInteger(x) || x < 0 || x > 100000)
  )
    throw Error("Se necesitan cinco respuestas enteras entre 0 y 100000.");
  const events: TraceEvent<LieState>[] = [];
  let state: LieState = {
    rows: questions.map((q, i) => [...q, replies[i]]),
    candidate: [],
    agreements: [],
    selected: [],
    accepted: false,
  };
  let answer: number[] | null = null;
  triples: for (let i = 0; i < 3; i++)
    for (let j = i + 1; j < 4; j++)
      for (let k = j + 1; k < 5; k++) {
        const ids = [i, j, k],
          a = ids.map((x) => questions[x]),
          d = det(a),
          nums = [0, 1, 2].map((c) =>
            det(
              a.map((r, t) =>
                r.map((v, col) => (col === c ? replies[ids[t]] : v)),
              ),
            ),
          );
        const candidate = nums.map((x) => x / d || 0),
          integral =
            nums.every((x) => x % d === 0) && candidate.every((x) => x >= 0);
        const agreements = integral
          ? questions.flatMap((r, t) =>
              r.reduce((s, v, c) => s + v * candidate[c], 0) === replies[t]
                ? [t]
                : [],
            )
          : [];
        const next = {
          ...state,
          candidate,
          agreements,
          selected: ids,
          accepted: agreements.length >= 4,
        };
        if (trace)
          event(events, state, next, {
            operation: `Probar consultas ${ids.map((x) => x + 1).join(", ")}`,
            explanation: !integral
              ? "La solución no representa tres cantidades enteras no negativas."
              : `Candidato (${candidate.join(", ")}): satisface ${agreements.length} de 5 respuestas. ${next.accepted ? "Supera la comprobación." : "Se descarta."}`,
            active: ids,
            pseudocode: next.accepted ? 4 : integral ? 4 : 3,
            variables: { determinante: d, coincidencias: agreements.length },
            invariant:
              "La terna verdadera concuerda con al menos cuatro respuestas.",
            partial: next.accepted ? candidate.join(", ") : "sin aceptar",
          });
        state = next;
        if (next.accepted) {
          answer = candidate;
          break triples;
        }
      }
  // Multiple valid triples may be visited; uniqueness follows from any three rows being independent.
  return { answer, events };
}

export type BridgeCell = { n: number; e: number; value: number; i: number };
/** Backhouse–Truong capacity-C recurrence (section 4.5). Values are prepaid bag costs. */
export function solveBridge(times: number[], capacity: number, trace = false) {
  if (
    times.length < 2 ||
    !Number.isInteger(capacity) ||
    capacity < 2 ||
    times.some((t) => !Number.isFinite(t) || t <= 0)
  )
    throw Error("Al menos dos tiempos positivos y capacidad ≥2.");
  const t = [0, ...times.toSorted((a, b) => a - b)],
    N = times.length,
    C = Math.min(capacity, N),
    prefix = [0];
  for (let i = 1; i <= N; i++) prefix[i] = prefix[i - 1] + t[i];
  const dp: number[][] = Array.from({ length: N + 1 }, () => []),
    cells: BridgeCell[] = [];
  for (let n = 2; n <= N; n++)
    for (let e = 0; e <= Math.floor((N - n) / C); e++) {
      if (n <= C && e === 0) {
        dp[n][e] = t[n];
        if (trace) cells.push({ n, e, value: t[n], i: -1 });
        continue;
      }
      let best = Infinity,
        choice = -1;
      const lo = n <= C ? 2 : Math.max(0, C + 2 - n),
        hi = n <= C ? Math.min(n, e + 1) : Math.min(C - 1, e + 1);
      for (let i = lo; i <= hi; i++) {
        const nextN = n <= C ? i : n - C + i,
          candidate = t[n] + prefix[i] + dp[nextN][e + 1 - i];
        if (candidate < best) {
          best = candidate;
          choice = i;
        }
      }
      dp[n][e] = best;
      if (trace) cells.push({ n, e, value: best, i: choice });
    }
  return { answer: dp[N][0], dp, cells, times: t.slice(1) };
}

export function ternaryVectors(k: number) {
  return Array.from({ length: 3 ** k }, (_, s) =>
    Array.from({ length: k }, () => {
      const d = s % 3;
      s = Math.floor(s / 3);
      return d;
    }),
  );
}
export function encode(v: number[]) {
  return v.reduceRight((s, d) => s * 3 + d, 0);
}
export function vectorAdd(a: number[], b: number[], sign = 1) {
  return a.map((x, i) => (x + sign * b[i] + 3) % 3);
}
export function leverDistribution(levers: number[][], k: number) {
  const vectors = ternaryVectors(k),
    m = vectors.length;
  let counts = Array(m).fill(0);
  counts[0] = 1;
  const layers = [counts];
  for (const u of levers) {
    const next = [...counts];
    vectors.forEach((v, s) => (next[encode(vectorAdd(v, u))] += counts[s]));
    counts = next;
    layers.push(counts);
  }
  return { counts, layers };
}
/** Exact integer counts stay <= 2^40, below Number's 2^53 limit. No 32-bit count operations. */
export function solveLevers(counts: number[], k: number) {
  if (
    !Number.isInteger(k) ||
    k < 1 ||
    k > 5 ||
    counts.length !== 3 ** k ||
    counts.some((x) => !Number.isSafeInteger(x) || x < 0)
  )
    throw Error("Distribución inválida.");
  const total = counts.reduce((a, b) => a + b, 0),
    n = Math.log2(total);
  if (!Number.isInteger(n) || n > 40)
    throw Error("La suma debe ser 2^n, n ≤40.");
  const vectors = ternaryVectors(k),
    dot = (a: number[], b: number[]) =>
      a.reduce((s, x, i) => s + x * b[i], 0) % 3;
  const projections = vectors.map((x) => {
    const row = [0, 0, 0];
    vectors.forEach((s, i) => (row[dot(x, s)] += counts[i]));
    let f = Infinity;
    for (let v of row)
      if (v) {
        let z = 0;
        while (v % 2 === 0) {
          v /= 2;
          z++;
        }
        f = Math.min(f, z);
      }
    return { x, row, f };
  });
  const mass = (generators: number[][]) => {
    const h = projections.filter((p) =>
      generators.every((g) => dot(p.x, g) === 0),
    );
    return ((3 * h.reduce((s, p) => s + p.f, 0)) / h.length - n) / 2;
  };
  const zeros = mass([]),
    levers: number[][] = [],
    lines: { u: number[]; count: number }[] = [];
  if (!Number.isInteger(zeros) || zeros < 0)
    throw Error("Conteos incompatibles.");
  for (let i = 0; i < zeros; i++) levers.push(Array(k).fill(0));
  for (let s = 1; s < vectors.length; s++) {
    const u = vectors[s],
      neg = encode(u.map((x) => (3 - x) % 3));
    if (s > neg) continue;
    const count = mass([u]) - zeros;
    if (!Number.isInteger(count) || count < 0)
      throw Error("Conteos incompatibles.");
    lines.push({ u, count });
    for (let j = 0; j < count; j++) levers.push(u);
  }
  if (levers.length !== n) throw Error("Conteos incompatibles.");
  const { counts: initial, layers } = leverDistribution(levers, k);
  const shift = vectors.findIndex(
    (v, i) =>
      initial[i] > 0 &&
      vectors.every((s, j) => counts[j] === initial[encode(vectorAdd(s, v))]),
  );
  if (shift < 0) throw Error("No existe una orientación consistente.");
  let v = vectors[shift];
  const flipped: number[] = [];
  const answer = levers.map((u) => [...u]);
  for (let i = n; i > 0; i--)
    if (!layers[i - 1][encode(v)]) {
      flipped.push(i - 1);
      v = vectorAdd(v, levers[i - 1], -1);
      answer[i - 1] = levers[i - 1].map((x) => (3 - x) % 3);
    }
  return {
    answer,
    projections,
    zeros,
    lines,
    layers,
    shift: vectors[shift],
    flipped,
  };
}
