export type Point = [number, number];
export type Pyramid = [number, number, number, number, number];
function pyramid(p: Pyramid) {
  const [x, y, u, v, h] = p,
    dx = u - x,
    dy = v - y;
  return {
    base: [
      [x, y],
      [u, v],
      [u - dy, v + dx],
      [x - dy, y + dx],
    ] as Point[],
    apex: [(x + u - dy) / 2, (y + v + dx) / 2, h],
  };
}
const interpolate = (a: Point, b: Point, t: number): Point => [
  a[0] + t * (b[0] - a[0]),
  a[1] + t * (b[1] - a[1]),
];
function minimize(f: (x: number) => number, iterations: number) {
  let lo = 0,
    hi = 1;
  for (let i = 0; i < iterations; i++) {
    const a = lo + (hi - lo) / 3,
      b = hi - (hi - lo) / 3;
    // Por convexidad basta conservar dos tercios; comparar no exige derivadas.
    if (f(a) <= f(b)) hi = b;
    else lo = a;
  }
  // Los extremos también pueden ser óptimos (esquinas o bases en contacto).
  const candidates = [0, 1, (lo + hi) / 2];
  let x = candidates[0],
    value = f(x);
  for (const c of candidates) {
    const v = f(c);
    if (v < value) {
      x = c;
      value = v;
    }
  }
  return { x, value };
}
/** Convex minimization on closed base segments. Includes endpoints and touching bases. */
export function solvePyramids(
  first: Pyramid,
  second: Pyramid,
  iterations = 90,
) {
  const a = pyramid(first),
    b = pyramid(second),
    candidates: {
      i: number;
      j: number;
      t: number;
      u: number;
      distance: number;
      p: Point;
      q: Point;
    }[] = [];
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      const point = (t: number) =>
          interpolate(a.base[i], a.base[(i + 1) % 4], t),
        other = (u: number) => interpolate(b.base[j], b.base[(j + 1) % 4], u);
      const f = (t: number, u: number) => {
        const p = point(t),
          q = other(u);
        return (
          Math.hypot(p[0] - a.apex[0], p[1] - a.apex[1], a.apex[2]) +
          Math.hypot(p[0] - q[0], p[1] - q[1]) +
          Math.hypot(q[0] - b.apex[0], q[1] - b.apex[1], b.apex[2])
        );
      };
      const outer = minimize(
          (t) => minimize((u) => f(t, u), iterations).value,
          iterations,
        ),
        inner = minimize((u) => f(outer.x, u), iterations);
      candidates.push({
        i,
        j,
        t: outer.x,
        u: inner.x,
        distance: inner.value,
        p: point(outer.x),
        q: other(inner.x),
      });
    }
  candidates.sort((x, y) => x.distance - y.distance);
  return { answer: candidates[0].distance, best: candidates[0], candidates };
}
const lower = (a: number[], x: number, upper = false) => {
  let l = 0,
    r = a.length;
  while (l < r) {
    const m = Math.floor((l + r) / 2);
    if (a[m] < x || (upper && a[m] === x)) l = m + 1;
    else r = m;
  }
  return l;
};
export function dicePoints(d1: number[], d2: number[]) {
  let a = d1.toSorted((x, y) => x - y),
    b = d2.toSorted((x, y) => x - y);
  // Menores cuentan dos veces; iguales una: victoria=1 y empate=1/2.
  const score = (v: number, d: number[]) =>
    (lower(d, v) + lower(d, v, true)) / (2 * d.length);
  // Comparar el numerador entero evita invertir dados empatados por redondeo.
  const winsTwice = a.reduce((s, v) => s + lower(b, v) + lower(b, v, true), 0);
  if (winsTwice < a.length * b.length) [a, b] = [b, a];
  const values = [
    ...new Set([1, ...a, ...b, ...a.map((x) => x + 1), ...b.map((x) => x + 1)]),
  ].sort((x, y) => x - y);
  return values.map((v) => ({ v, x: score(v, a), y: score(v, b) }));
}
export function solveDice(d1: number[], d2: number[]) {
  const points = dicePoints(d1, d2),
    unique = points.filter(
      (p, i) => !i || p.x !== points[i - 1].x || p.y !== points[i - 1].y,
    ),
    cross = (
      a: (typeof points)[0],
      b: (typeof points)[0],
      c: (typeof points)[0],
    ) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  const half = (arr: typeof points) => {
    const h: typeof points = [];
    for (const p of arr) {
      // Cada punto se apila y desapila a lo sumo una vez: envolvente lineal.
      while (h.length > 1 && cross(h.at(-2)!, h.at(-1)!, p) <= 0) h.pop();
      h.push(p);
    }
    return h;
  };
  const bottom = half(unique),
    top = half(unique.toReversed()),
    hull = [...bottom.slice(0, -1), ...top.slice(0, -1)];
  if (!hull.length) hull.push(unique[0]);
  let minimum = Infinity,
    maximum = -Infinity;
  const consider = (x: number, y: number) => {
    if (x >= 0.5 - 1e-12) minimum = Math.min(minimum, y);
    if (y <= 0.5 + 1e-12) maximum = Math.max(maximum, x);
  };
  for (let i = 0; i < hull.length; i++) {
    const p = hull[i],
      q = hull[(i + 1) % hull.length];
    consider(p.x, p.y);
    if (p.x !== q.x) {
      const t = (0.5 - p.x) / (q.x - p.x);
      if (t >= 0 && t <= 1) consider(0.5, p.y + t * (q.y - p.y));
    }
    if (p.y !== q.y) {
      const t = (0.5 - p.y) / (q.y - p.y);
      if (t >= 0 && t <= 1) consider(p.x + t * (q.x - p.x), 0.5);
    }
  }
  return { minimum, maximum, points, hull };
}
