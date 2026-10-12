import { describe, it, expect } from "vitest";
import { compress, compressionTrace, reduce, reductions } from "./compression";
import { solveRed, parseLights, mod, type Lights } from "./turning-red";
import { problems } from "../data/problems";
function bruteCompression(s: string, memo = new Map<string, string>()): string {
  if (memo.has(s)) return memo.get(s)!;
  let best = s;
  for (const r of reductions(s)) {
    const candidate = bruteCompression(reduce(s, r), memo);
    if (candidate.length < best.length) best = candidate;
  }
  memo.set(s, best);
  return best;
}
function bruteRed(input: Lights) {
  let best = Infinity;
  for (let code = 0; code < 3 ** input.buttons.length; code++) {
    let x = code;
    const colors = [...input.colors];
    let cost = 0;
    for (const b of input.buttons) {
      const v = x % 3;
      x = Math.floor(x / 3);
      cost += v;
      b.forEach((l) => (colors[l] = mod(colors[l] + v)));
    }
    if (colors.every((c) => c === 0)) best = Math.min(best, cost);
  }
  return best === Infinity ? null : best;
}
describe("Compression", () => {
  it("coincide con todos los ejemplos oficiales", () => {
    for (const e of problems.find((p) => p.id === "Y")!.examples)
      expect(compress(e.input)).toBe(e.output);
  });
  it("coincide con búsqueda completa para todas las cadenas de longitud ≤ 9", () => {
    const memo = new Map<string, string>();
    for (let n = 1; n <= 9; n++)
      for (let k = 0; k < 2 ** n; k++) {
        const s = k.toString(2).padStart(n, "0");
        expect(compress(s)).toBe(bruteCompression(s, memo));
      }
  });
  it("cada transición de la traza es legal, conserva invariantes y alcanza el resultado", () => {
    for (let n = 1; n <= 8; n++)
      for (let k = 0; k < 2 ** n; k++) {
        const s = k.toString(2).padStart(n, "0"),
          trace = compressionTrace(s);
        trace.forEach((e, i) => {
          if (i) expect(e.before).toBe(trace[i - 1].after);
          if (e.before !== e.after)
            expect(
              reductions(e.before).some((r) => reduce(e.before, r) === e.after),
            ).toBe(true);
          expect(e.after[0]).toBe(s[0]);
          expect(e.after.at(-1)).toBe(s.at(-1));
          expect([...new Set(e.after)].sort()).toEqual([...new Set(s)].sort());
        });
        expect(trace.at(-1)!.after).toBe(compress(s));
      }
  });
  it("rechaza reducciones inventadas y entradas no binarias", () => {
    expect(() => reduce("101", { start: 0, length: 1 })).toThrow();
    expect(() => compress("")).toThrow();
    expect(() => compress("102")).toThrow();
  });
});
describe("Turning Red", () => {
  it("coincide con los cuatro ejemplos oficiales", () => {
    for (const e of problems.find((p) => p.id === "P")!.examples)
      expect(solveRed(parseLights(e.input)).cost).toBe(
        e.output === "impossible" ? null : Number(e.output),
      );
  });
  it("compara todos los colores de dos luces y todas las incidencias en hasta tres botones", () => {
    for (let b = 0; b <= 3; b++) {
      const options: number[][] = [[]];
      for (let i = 0; i < b; i++) {
        options.push([i]);
        for (let j = i + 1; j < b; j++) options.push([i, j]);
      }
      for (const a of options)
        for (const z of options) {
          const buttons = Array.from({ length: b }, (_, i) => [
            ...(a.includes(i) ? [0] : []),
            ...(z.includes(i) ? [1] : []),
          ]);
          if (buttons.some((x) => x.length === 0)) continue;
          for (let c = 0; c < 9; c++) {
            const input = { colors: [c % 3, Math.floor(c / 3)], buttons };
            expect(solveRed(input).cost).toBe(bruteRed(input));
          }
        }
    }
  });
  it("compara 400 grafos deterministas y comprueba instantáneas y resultado", () => {
    let seed = 31337;
    const rnd = (max: number) => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed % max;
    };
    for (let test = 0; test < 400; test++) {
      const b = 1 + rnd(6),
        l = b + rnd(5),
        input: Lights = {
          colors: Array.from({ length: l }, () => rnd(3)),
          buttons: Array.from({ length: b }, (_, i) => [i]),
        };
      for (let j = 0; j < l; j++) {
        if (j >= b && rnd(3)) input.buttons[rnd(b)].push(j);
        const linked = input.buttons
          .map((x, i) => (x.includes(j) ? i : -1))
          .filter((x) => x >= 0);
        if (linked.length < 2 && rnd(2)) {
          const candidates = Array.from({ length: b }, (_, i) => i).filter(
            (x) => !linked.includes(x),
          );
          if (candidates.length)
            input.buttons[candidates[rnd(candidates.length)]].push(j);
        }
      }
      const r = solveRed(input, true);
      expect(r.cost).toBe(bruteRed(input));
      expect(solveRed(input).cost).toBe(r.cost);
      r.trace.forEach((e, i) => {
        if (i) expect(e.before).toEqual(r.trace[i - 1].after);
      });
      expect(JSON.parse(JSON.stringify(r.trace))).toEqual(r.trace);
      if (r.presses) {
        const colors = [...input.colors];
        input.buttons.forEach((lights, i) =>
          lights.forEach((l) => (colors[l] = mod(colors[l] + r.presses![i]))),
        );
        expect(colors.every((c) => c === 0)).toBe(true);
        expect(r.presses.reduce((a, b) => a + b, 0)).toBe(r.cost);
        expect(r.trace.at(-1)!.after.values).toEqual(r.presses);
      }
    }
  });
  it("maneja luces sin botones y rechaza más de dos conexiones", () => {
    expect(solveRed({ colors: [0], buttons: [] }).cost).toBe(0);
    expect(solveRed({ colors: [2], buttons: [] }).cost).toBeNull();
    expect(() => solveRed({ colors: [0], buttons: [[0], [0], [0]] })).toThrow();
  });
});
