import { it, expect } from "vitest";
import { solvePyramids, solveDice, dicePoints } from "./geometry";
import { unfoldedReference } from "./unfolding-reference";
it("V: exact ties keep input orientation without floating-point reversal", () => {
  const points = dicePoints([1, 4, 3, 4], [4, 1, 2, 3, 8]);
  expect(points.find((p) => p.v === 2)).toEqual({ v: 2, x: 0.25, y: 0.3 });
  expect(solveDice([1, 4, 3, 4], [4, 1, 2, 3, 8]).minimum).toBeCloseTo(0.4, 12);
});
it("T: official answer, symmetric analytic solution, touching bases and order symmetry", () => {
  expect(
    solvePyramids([0, 0, 10, 0, 4], [9, 18, 34, 26, 42]).answer,
  ).toBeCloseTo(60.866649532, 7);
  expect(solvePyramids([0, 0, 2, 0, 1], [4, 0, 6, 0, 1]).answer).toBeCloseTo(
    2 + 2 * Math.sqrt(2),
    9,
  );
  expect(solvePyramids([0, 0, 2, 0, 1], [2, 0, 4, 0, 1]).answer).toBeCloseTo(
    2 * Math.sqrt(2),
    9,
  );
  expect(
    solvePyramids([9, 18, 34, 26, 42], [0, 0, 10, 0, 4]).answer,
  ).toBeCloseTo(60.866649532, 7);
});
it("T: convex solver agrees with an independent finite unfolding/endpoints oracle", () => {
  let seed = 234;
  const rand = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  for (let i = 0; i < 80; i++) {
    const dx = 1 + Math.floor(rand() * 300),
      dy = Math.floor(rand() * 300),
      h = 1 + Math.floor(rand() * 100000),
      ex = 1 + Math.floor(rand() * 300),
      ey = Math.floor(rand() * 300),
      g = 1 + Math.floor(rand() * 100000),
      offset = 1000 + Math.floor(rand() * 90000);
    const a: [number, number, number, number, number] = [0, 0, dx, dy, h],
      b: [number, number, number, number, number] = [
        offset,
        0,
        offset + ex,
        ey,
        g,
      ];
    expect(
      Math.abs(solvePyramids(a, b).answer - unfoldedReference(a, b)),
    ).toBeLessThan(1e-6);
  }
});
it("V: official answers and hull optimization against every pair of face classes", () => {
  const r = solveDice([1, 1, 6, 6, 8, 8], [2, 4, 9]);
  expect(r.minimum).toBeCloseTo(7 / 24, 10);
  expect(r.maximum).toBeCloseTo(3 / 4, 10);
  const s = solveDice([9, 3, 7, 5], [4, 2, 3]);
  expect(s.minimum).toBeCloseTo(0.5, 10);
  expect(s.maximum).toBeCloseTo(0.5, 10);
  for (let seed = 0; seed < 100; seed++) {
    const a = Array.from({ length: 3 }, (_, i) => 1 + ((seed * 3 + i * i) % 8)),
      b = Array.from({ length: 4 }, (_, i) => 1 + ((seed + i * 3) % 8)),
      p = dicePoints(a, b);
    let min = Infinity,
      max = -Infinity;
    const consider = (x: number, y: number) => {
      if (x >= 0.5 - 1e-12) min = Math.min(min, y);
      if (y <= 0.5 + 1e-12) max = Math.max(max, x);
    };
    for (const u of p)
      for (const v of p) {
        consider(u.x, u.y);
        for (const axis of ["x", "y"] as const)
          if (u[axis] !== v[axis]) {
            const t = (0.5 - u[axis]) / (v[axis] - u[axis]);
            if (t >= 0 && t <= 1)
              consider(u.x + t * (v.x - u.x), u.y + t * (v.y - u.y));
          }
      }
    const ans = solveDice(a, b);
    expect(ans.minimum).toBeCloseTo(min, 10);
    expect(ans.maximum).toBeCloseTo(max, 10);
  }
});
