import { it, expect } from "vitest";
import { problems } from "../data/problems";
import { deepDives } from "../data/deep-dives";
import {
  solveQueue,
  solveBridge,
  solveLevers,
  leverDistribution,
} from "./extended";
import { checkQuartets, type Action } from "./quartets";
import { rotationClass } from "./rotations";
it("all eleven lessons expose a manual example, explained code, proof, costs and four oral rubrics", () => {
  expect(Object.keys(deepDives).sort()).toEqual(
    problems.map((p) => p.id).sort(),
  );
  for (const p of problems) {
    const d = deepDives[p.id];
    expect(d.walk.length).toBeGreaterThanOrEqual(4);
    expect(d.code.every((c) => c.line && c.why)).toBe(true);
    expect(d.proof.length).toBeGreaterThanOrEqual(3);
    expect(d.costs.length).toBeGreaterThanOrEqual(2);
    expect(d.oral).toHaveLength(5);
    expect(d.checkpoints.map((c) => c.kind)).toEqual([
      "Razonamiento",
      "Estructuras",
      "Complejidad",
      "Correctitud",
    ]);
    expect(p.proof).toBe(d.proof.join(" "));
  }
});
it("Q, S, R, X and Z reproduce all official fixtures", () => {
  for (const id of ["Q", "S", "R", "X", "Z"])
    for (const example of problems.find((p) => p.id === id)!.examples) {
      const tokens = example.input.trim().split(/\s+/);
      let i = 0;
      const num = () => Number(tokens[i++]);
      if (id === "Q") {
        const n = num(),
          a = Array.from({ length: n }, num);
        expect(solveQueue(a).answer).toBe(Number(example.output));
      }
      if (id === "S") {
        const n = num(),
          c = num(),
          t = Array.from({ length: n }, num);
        expect(solveBridge(t, c).answer).toBe(Number(example.output));
      }
      if (id === "R") {
        const n = num(),
          m = num(),
          start: number[] = [],
          target: number[] = [];
        for (let j = 0; j < n; j++) {
          start.push(num());
          target.push(num());
        }
        const edges = Array.from({ length: m }, () => [num() - 1, num() - 1]);
        expect(rotationClass(n, edges, start, target).possible).toBe(
          example.output === "possible",
        );
      }
      if (id === "X") {
        const n = num(),
          actions: Action[] = [];
        for (let j = 0; j < n; j++) {
          const player = num() - 1,
            kind = tokens[i++];
          if (kind === "Q")
            actions.push({ kind: "quartet", player, suit: num() - 1 });
          else {
            const from = num() - 1,
              card = tokens[i++],
              yes = tokens[i++] === "yes";
            actions.push({
              kind: "ask",
              player,
              from,
              card: (Number(card[0]) - 1) * 4 + "ABCD".indexOf(card[1]),
              yes,
            });
          }
        }
        const r = checkQuartets(actions);
        expect(r.possible ? "yes" : `no\n${r.firstFailure}`).toBe(
          example.output,
        );
      }
      if (id === "Z") {
        num();
        const k = num(),
          t = num(),
          counts = Array(3 ** k).fill(0);
        for (let j = 0; j < t; j++) {
          const state = tokens[i++];
          const index = [...state].reduceRight(
            (s, c) => s * 3 + "AEI".indexOf(c),
            0,
          );
          counts[index] = num();
        }
        const r = solveLevers(counts, k);
        expect(leverDistribution(r.answer, k).counts).toEqual(counts);
      }
    }
});
