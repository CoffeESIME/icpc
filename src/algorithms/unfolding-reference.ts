import type { Point, Pyramid } from "./geometry";
const sub = (a: Point, b: Point): Point => [a[0] - b[0], a[1] - b[1]];
const cross = (a: Point, b: Point) => a[0] * b[1] - a[1] * b[0];
const lerp = (a: Point, b: Point, t: number): Point => [
  a[0] + t * (b[0] - a[0]),
  a[1] + t * (b[1] - a[1]),
];
const distance = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function faces(p: Pyramid) {
  const [x, y, u, v, h] = p,
    dx = u - x,
    dy = v - y,
    base: Point[] = [
      [x, y],
      [u, v],
      [u - dy, v + dx],
      [x - dy, y + dx],
    ],
    length = Math.hypot(dx, dy),
    slant = Math.hypot(length / 2, h);
  return base.map((a, i) => {
    const b = base[(i + 1) % 4],
      mid = lerp(a, b, 0.5),
      normal: Point = [-(b[1] - a[1]) / length, (b[0] - a[0]) / length];
    return {
      a,
      b,
      images: [-1, 1].map(
        (sign) =>
          [
            mid[0] + sign * normal[0] * slant,
            mid[1] + sign * normal[1] * slant,
          ] as Point,
      ),
    };
  });
}
function intersection(a: Point, b: Point, c: Point, d: Point) {
  const ab = sub(b, a),
    cd = sub(d, c),
    denom = cross(ab, cd);
  if (denom === 0) return null;
  const t = cross(sub(c, a), cd) / denom,
    u = cross(sub(c, a), ab) / denom;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return { point: lerp(c, d, u), t };
}
/** Independent finite-candidate oracle: unfold both signs, then explicitly handle gate endpoints.
 * It uses no optimization loops or numerical derivatives from the production solver.
 */
export function unfoldedReference(a: Pyramid, b: Pyramid) {
  let best = Infinity;
  for (const f of faces(a))
    for (const g of faces(b)) {
      const cost = (p: Point, q: Point) =>
        distance(f.images[0], p) + distance(p, q) + distance(q, g.images[0]);
      const consider = (p: Point, q: Point) => {
        best = Math.min(best, cost(p, q));
      };
      for (const A of f.images)
        for (const B of g.images) {
          const p = intersection(A, B, f.a, f.b),
            q = intersection(A, B, g.a, g.b);
          if (p && q && p.t <= q.t) consider(p.point, q.point);
        }
      for (const p of [f.a, f.b]) {
        for (const B of g.images) {
          const q = intersection(p, B, g.a, g.b);
          if (q) consider(p, q.point);
        }
        for (const q of [g.a, g.b]) consider(p, q);
      }
      for (const q of [g.a, g.b])
        for (const A of f.images) {
          const p = intersection(A, q, f.a, f.b);
          if (p) consider(p.point, q);
        }
    }
  return best;
}
