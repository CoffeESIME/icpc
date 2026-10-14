import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import catalog from "../data/python-catalog.json";
import { problems } from "../data/problems";
import { compress } from "./compression";
import { solveRed, parseLights } from "./turning-red";
import {
  solveQueue,
  solveLiar,
  questions,
  solveBridge,
  leverDistribution,
} from "./extended";
import { solveTrain, checkTrack } from "./trains";
import { rotationClass } from "./rotations";
import { checkQuartets, type Action } from "./quartets";
import { solveDice } from "./geometry";
import { unfoldedReference } from "./unfolding-reference";

type Case = { id: string; args: unknown[]; expected: unknown };
function execute(cases: Case[]) {
  const result = spawnSync(
    process.env.PYTHON || "python",
    ["-B", "scripts/python-reference-runner.py"],
    {
      input: JSON.stringify(cases),
      encoding: "utf8",
      timeout: 60000,
      maxBuffer: 16 * 1024 * 1024,
    },
  );
  expect(
    result.error,
    "Instala Python 3.10+ o configura PYTHON con la ruta del ejecutable.",
  ).toBeUndefined();
  expect(result.status, result.stderr).toBe(0);
  return JSON.parse(result.stdout) as { value: unknown; error?: string }[];
}
function compare(cases: Case[]) {
  const results = execute(cases);
  expect(results).toHaveLength(cases.length);
  results.forEach((r, i) => {
    const c = cases[i],
      context = `${c.id}: ${JSON.stringify(c.args)}`;
    expect(r.error, context).toBeUndefined();
    if (c.id === "T")
      expect(
        Math.abs(Number(r.value) - Number(c.expected)),
        context,
      ).toBeLessThan(1e-6);
    else if (c.id === "V") {
      const actual = r.value as { minimum: number; maximum: number },
        expected = c.expected as typeof actual;
      expect(actual.minimum, context).toBeCloseTo(expected.minimum, 8);
      expect(actual.maximum, context).toBeCloseTo(expected.maximum, 8);
    } else expect(r.value, context).toEqual(c.expected);
  });
}

it("Python sources and downloads are complete exact copies for all eleven problems", () => {
  expect(Object.keys(catalog).sort()).toEqual(problems.map((p) => p.id).sort());
  for (const source of Object.values(catalog)) {
    expect(source.code).toBe(
      readFileSync(source.path, "utf8").replaceAll("\r\n", "\n"),
    );
    expect(
      readFileSync(`public/reference/python/${source.name}.py.txt`, "utf8"),
    ).toBe(source.code);
    expect(source.code).toContain('if __name__ == "__main__":');
  }
});

it("Python executes the official non-interactive fixtures and reconstructs valid outputs", () => {
  const cases: Case[] = [];
  for (const p of problems)
    for (const ex of p.examples) {
      const tokens = ex.input.trim().split(/\s+/);
      let i = 0;
      const num = () => Number(tokens[i++]);
      if (p.id === "Y")
        cases.push({ id: p.id, args: [ex.input], expected: ex.output });
      if (p.id === "Q") {
        const n = num();
        cases.push({
          id: p.id,
          args: [Array.from({ length: n }, num)],
          expected: Number(ex.output),
        });
      }
      if (p.id === "S") {
        const n = num(),
          c = num();
        cases.push({
          id: p.id,
          args: [Array.from({ length: n }, num), c],
          expected: Number(ex.output),
        });
      }
      if (p.id === "P") {
        const a = parseLights(ex.input),
          r = solveRed(a);
        expect(r.cost).toBe(
          ex.output === "impossible" ? null : Number(ex.output),
        );
        cases.push({
          id: p.id,
          args: [a.colors, a.buttons],
          expected: { cost: r.cost, presses: r.presses },
        });
      }
      if (p.id === "U") {
        const s = num(),
          c = num(),
          track = solveTrain(s, c).track;
        expect(checkTrack(track).valid).toBe(true);
        expect(track.length).toBe(ex.output.length);
        cases.push({ id: p.id, args: [s, c], expected: track });
      }
      if (p.id === "T")
        cases.push({
          id: p.id,
          args: [
            Array.from({ length: 5 }, num),
            Array.from({ length: 5 }, num),
          ],
          expected: Number(ex.output),
        });
      if (p.id === "V") {
        const a = Array.from({ length: num() }, num),
          b = Array.from({ length: num() }, num),
          [minimum, maximum] = ex.output.split(/\s+/).map(Number);
        cases.push({ id: p.id, args: [a, b], expected: { minimum, maximum } });
      }
      if (p.id === "R") {
        const n = num(),
          m = num(),
          start: number[] = [],
          target: number[] = [];
        for (let j = 0; j < n; j++) {
          start.push(num());
          target.push(num());
        }
        cases.push({
          id: p.id,
          args: [
            n,
            Array.from({ length: m }, () => [num() - 1, num() - 1]),
            start,
            target,
          ],
          expected: ex.output === "possible",
        });
      }
      if (p.id === "X") {
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
        cases.push({
          id: p.id,
          args: [actions],
          expected: {
            possible: ex.output === "yes",
            firstFailure:
              ex.output === "yes" ? null : Number(ex.output.split(/\s+/)[1]),
          },
        });
      }
      if (p.id === "Z") {
        num();
        const k = num(),
          t = num(),
          counts = Array(3 ** k).fill(0);
        for (let j = 0; j < t; j++) {
          const state = tokens[i++],
            index = [...state].reduceRight(
              (s, c) => s * 3 + "AEI".indexOf(c),
              0,
            );
          counts[index] = num();
        }
        cases.push({ id: p.id, args: [counts, k], expected: counts });
      }
    }
  compare(cases);
}, 60000);

it("Python agrees with tested solvers on exhaustive and seeded small cases, with an independent geometric oracle", () => {
  const cases: Case[] = [];
  let seed = 20261013;
  const rand = (n: number) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % n;
  };
  for (let n = 1; n <= 9; n++)
    for (let mask = 0; mask < 2 ** n; mask++) {
      const s = mask.toString(2).padStart(n, "0");
      cases.push({ id: "Y", args: [s], expected: compress(s) });
    }
  for (let s = 0; s <= 20; s++)
    for (let c = 4; c <= 30; c++)
      cases.push({ id: "U", args: [s, c], expected: solveTrain(s, c).track });
  for (let a = 0; a < 4; a++)
    for (let b = 0; b < 4; b++)
      for (let c = 0; c < 4; c++)
        for (let lie = -1; lie < 5; lie++) {
          const truth = [a, b, c],
            replies = questions.map((q) =>
              q.reduce((sum, v, j) => sum + v * truth[j], 0),
            );
          if (lie >= 0) replies[lie] = 999;
          expect(solveLiar(replies).answer).toEqual(truth);
          cases.push({ id: "W", args: [replies], expected: truth });
        }
  for (let i = 0; i < 150; i++) {
    const colors = Array.from({ length: 1 + rand(5) }, () => rand(3)),
      buttons: number[][] = [[], [], []];
    colors.forEach((_, l) => {
      const b = rand(3);
      buttons[b].push(l);
      if (rand(2)) buttons[(b + 1) % 3].push(l);
    });
    const input = { colors, buttons: buttons.filter((b) => b.length) },
      red = solveRed(input);
    cases.push({
      id: "P",
      args: [input.colors, input.buttons],
      expected: { cost: red.cost, presses: red.presses },
    });
    const order = Array.from({ length: 1 + rand(8) }, (_, j) => j + 1);
    for (let j = order.length - 1; j > 0; j--) {
      const k = rand(j + 1);
      [order[k], order[j]] = [order[j], order[k]];
    }
    cases.push({ id: "Q", args: [order], expected: solveQueue(order).answer });
    const times = Array.from({ length: 2 + rand(7) }, () => 1 + rand(30)),
      capacity = 2 + rand(8);
    cases.push({
      id: "S",
      args: [times, capacity],
      expected: solveBridge(times, capacity).answer,
    });
    const a = Array.from({ length: 1 + rand(6) }, () => 1 + rand(10)),
      b = Array.from({ length: 1 + rand(6) }, () => 1 + rand(10)),
      dice = solveDice(a, b);
    cases.push({
      id: "V",
      args: [a, b],
      expected: { minimum: dice.minimum, maximum: dice.maximum },
    });
    const k = 1 + rand(3),
      levers = Array.from({ length: rand(7) }, () =>
        Array.from({ length: k }, () => rand(3)),
      ),
      counts = leverDistribution(levers, k).counts;
    cases.push({ id: "Z", args: [counts, k], expected: counts });
    const n = 1 + rand(8),
      edges: number[][] = [];
    for (let u = 0; u < n; u++)
      for (let v = u + 1; v < n; v++) if (rand(3) === 0) edges.push([u, v]);
    const start = Array.from({ length: n }, (_, j) => (i % 2 ? j : rand(3))),
      target = [...start];
    for (let j = n - 1; j > 0; j--) {
      const k = rand(j + 1);
      [target[k], target[j]] = [target[j], target[k]];
    }
    cases.push({
      id: "R",
      args: [n, edges, start, target],
      expected: rotationClass(n, edges, start, target).possible,
    });
    const deck = { players: 2, suits: 2, perSuit: 2, hand: 2 },
      actions: Action[] = Array.from({ length: 1 + rand(8) }, () => {
        const player = rand(2);
        return rand(4)
          ? {
              kind: "ask",
              player,
              from: 1 - player,
              card: rand(4),
              yes: !!rand(2),
            }
          : { kind: "quartet", player, suit: rand(2) };
      }),
      x = checkQuartets(actions, deck, false);
    cases.push({
      id: "X",
      args: [actions, deck],
      expected: { possible: x.possible, firstFailure: x.firstFailure },
    });
  }
  const first: [number, number, number, number, number] = [0, 0, 2, 0, 1];
  for (const second of [
    [2, 0, 4, 0, 1],
    [4, 0, 6, 0, 1],
    [20, 3, 25, 4, 9],
  ] as (typeof first)[])
    cases.push({
      id: "T",
      args: [first, second],
      expected: unfoldedReference(first, second),
    });
  cases.push({
    id: "Z",
    args: [[2 ** 40, 0, 0], 1],
    expected: [2 ** 40, 0, 0],
  });
  compare(cases);
}, 60000);

it("Python rejects malformed inputs in the validated reference functions", () => {
  const cases: Case[] = [
    { id: "Y", args: ["012"], expected: null },
    { id: "Q", args: [[1, 1]], expected: null },
    { id: "S", args: [[1, 2], 1], expected: null },
    { id: "W", args: [[1, 2]], expected: null },
    { id: "U", args: [-1, 4], expected: null },
    { id: "P", args: [[1], [[1]]], expected: null },
    { id: "Z", args: [[1, 1, 1], 1], expected: null },
  ];
  for (const result of execute(cases)) expect(result.error).toBeTruthy();
});
