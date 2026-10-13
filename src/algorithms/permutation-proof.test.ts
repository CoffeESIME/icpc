import { it, expect } from "vitest";
/** These algebra checks validate the concrete identities used in the R proof. */
const cycle = (n: number, ids: number[]) => {
  const p = Array.from({ length: n }, (_, i) => i);
  ids.forEach((v, i) => (p[v] = ids[(i + 1) % ids.length]));
  return p;
};
const compose = (a: number[], b: number[]) => b.map((x) => a[x]);
const inverse = (a: number[]) => {
  const b = [...a];
  a.forEach((x, i) => (b[x] = i));
  return b;
};
it("R: commutator of cycles with one shared vertex is the stated 3-cycle", () => {
  for (let p = 2; p <= 8; p++)
    for (let q = 2; q <= 8; q++) {
      const n = 1 + p + q,
        A = cycle(n, [0, ...Array.from({ length: p }, (_, i) => i + 1)]),
        B = cycle(n, [0, ...Array.from({ length: q }, (_, i) => p + i + 1)]);
      expect(compose(A, compose(B, compose(inverse(A), inverse(B))))).toEqual(
        cycle(n, [0, 1, p + 1]),
      );
    }
});
it("R: theta rotation identity gives an adjacent transposition, including a shared single edge", () => {
  for (let r = 2; r <= 5; r++)
    for (let p = 1; p <= 5; p++)
      for (let q = 1; q <= 5; q++) {
        const n = r + p + q,
          b = Array.from({ length: r }, (_, i) => i),
          a = Array.from({ length: p }, (_, i) => r + i),
          c = Array.from({ length: q }, (_, i) => r + p + i),
          left = cycle(n, [...b, ...a.toReversed()]),
          right = cycle(n, [b[0], ...c, ...b.slice(1).toReversed()]),
          outer = cycle(n, [b[0], ...c, b.at(-1)!, ...a.toReversed()]);
        expect(compose(right, compose(left, inverse(outer)))).toEqual(
          cycle(n, [b[0], c[0]]),
        );
      }
});
