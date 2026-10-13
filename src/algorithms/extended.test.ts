import { describe, it, expect } from "vitest";
import {
  solveQueue,
  queuePhysical,
  solveLiar,
  questions,
  det,
  solveBridge,
  leverDistribution,
  solveLevers,
} from "./extended";
import { solveTrain, checkTrack } from "./trains";
import { rotationClass } from "./rotations";
import { checkQuartets, type Action, type Deck } from "./quartets";
function permutations(a: number[]): number[][] {
  return a.length
    ? a.flatMap((x, i) =>
        permutations(a.filter((_, j) => j !== i)).map((p) => [x, ...p]),
      )
    : [[]];
}
function bridgeOracle(t: number[], c: number) {
  const all = 2 ** t.length - 1,
    dist = Array(2 ** (t.length + 1)).fill(Infinity),
    seen = new Set<number>();
  dist[0] = 0;
  for (;;) {
    let state = -1;
    for (let s = 0; s < dist.length; s++)
      if (!seen.has(s) && (state < 0 || dist[s] < dist[state])) state = s;
    if (state < 0 || !Number.isFinite(dist[state])) return Infinity;
    if (state === 2 * all + 1) return dist[state];
    seen.add(state);
    const side = state % 2,
      mask = Math.floor(state / 2),
      available = side ? mask : all ^ mask;
    for (let sub = available; sub; sub = (sub - 1) & available) {
      const group = t.filter((_, i) => (sub >> i) & 1);
      if (group.length > c) continue;
      const next = 2 * (mask ^ sub) + 1 - side;
      dist[next] = Math.min(dist[next], dist[state] + Math.max(...group));
    }
  }
}
describe("Second iteration: independent algorithm checks", () => {
  it("Q agrees with every stack assignment for every permutation through n=6", () => {
    for (let n = 1; n <= 6; n++)
      for (const p of permutations(
        Array.from({ length: n }, (_, i) => i + 1),
      )) {
        let total = 0;
        for (let mask = 0; mask < 2 ** n; mask++)
          total += queuePhysical(p, mask);
        expect(solveQueue(p).answer).toBe(total / 2 ** n);
      }
    expect(solveQueue([4, 2, 5, 3, 1], true).answer).toBe(7);
  });
  it("W: all triples independent; corrects zero or one corrupted reply", () => {
    for (let i = 0; i < 3; i++)
      for (let j = i + 1; j < 4; j++)
        for (let k = j + 1; k < 5; k++)
          expect(det([questions[i], questions[j], questions[k]])).not.toBe(0);
    for (let a = 0; a < 4; a++)
      for (let b = 0; b < 4; b++)
        for (let c = 0; c < 4; c++) {
          const actual = [a, b, c],
            r = questions.map((q) =>
              q.reduce((s, v, i) => s + v * actual[i], 0),
            );
          expect(solveLiar(r).answer).toEqual(actual);
          for (let i = 0; i < 5; i++)
            for (const bad of [0, 1, 97, 100000]) {
              const copy = [...r];
              copy[i] = bad;
              expect(solveLiar(copy).answer).toEqual(actual);
            }
        }
  });
  it("S: full-state shortest paths independently verify the compressed recurrence", () => {
    for (let n = 2; n <= 7; n++)
      for (let c = 2; c <= n + 1; c++)
        for (let seed = 0; seed < 7; seed++) {
          const t = Array.from(
            { length: n },
            (_, i) => 1 + ((i * i + seed * 7 + i * seed) % 13),
          );
          expect(solveBridge(t, c).answer).toBe(bridgeOracle(t, c));
        }
    expect(solveBridge([1, 2, 5, 10], 2).answer).toBe(17);
  });
  it("U: templates close without collisions and attain the inventory bound", () => {
    for (let s = 0; s <= 30; s++)
      for (let c = 4; c <= 100; c++) {
        const r = solveTrain(s, c);
        expect(checkTrack(r.track).valid, `${s},${c}: ${r.track}`).toBe(true);
        expect(r.track.match(/S/g)?.length || 0).toBe(r.s);
        expect(r.track.length - r.s).toBe(r.c);
        expect(r.s).toBeLessThanOrEqual(s);
        expect(r.c).toBeLessThanOrEqual(c);
      }
    expect(solveTrain(0, 8).track.length).toBe(4);
    for (let bits = 0; bits < 256; bits++)
      expect(
        checkTrack(
          Array.from({ length: 8 }, (_, i) =>
            (bits >> i) & 1 ? "L" : "R",
          ).join(""),
        ).valid,
      ).toBe(false);
  });
  it("Z: reconstructs generated distributions including 40 zero levers", () => {
    for (let k = 1; k <= 3; k++)
      for (let n = 1; n <= 7; n++)
        for (let seed = 0; seed < 12; seed++) {
          const levers = Array.from({ length: n }, (_, i) =>
              Array.from(
                { length: k },
                (_, j) => (seed * (i + 3) + i * i + j * 7 + i * j) % 3,
              ),
            ),
            { counts } = leverDistribution(levers, k),
            r = solveLevers(counts, k);
          expect(leverDistribution(r.answer, k).counts).toEqual(counts);
        }
    expect(solveLevers([2 ** 40, 0, 0], 1).answer).toHaveLength(40);
    expect(
      leverDistribution(solveLevers([4, 0, 4, 0, 0, 0, 0, 0, 0], 2).answer, 2)
        .counts,
    ).toEqual([4, 0, 4, 0, 0, 0, 0, 0, 0]);
  });
  it("R: classification matches explicit rotations on all simple graphs through 4 vertices", () => {
    for (let n = 1; n <= 4; n++) {
      const pairs: number[][] = [];
      for (let a = 0; a < n; a++)
        for (let b = a + 1; b < n; b++) pairs.push([a, b]);
      for (let mask = 0; mask < 2 ** pairs.length; mask++) {
        const edges = pairs.filter((_, i) => (mask >> i) & 1),
          has = (a: number, b: number) =>
            edges.some(
              ([u, v]) => (u === a && v === b) || (u === b && v === a),
            ),
          cycles: number[][] = [];
        function visit(path: number[]) {
          if (path.length >= 3 && has(path.at(-1)!, path[0])) cycles.push(path);
          for (let v = path[0] + 1; v < n; v++)
            if (!path.includes(v) && has(path.at(-1)!, v)) visit([...path, v]);
        }
        for (let s = 0; s < n; s++) visit([s]);
        for (const start of [
          Array.from({ length: n }, (_, i) => i),
          Array.from({ length: n }, (_, i) => i % 2),
        ]) {
          const seen = new Set([start.join(",")]),
            queue = [start];
          for (let i = 0; i < queue.length; i++)
            for (const cy of cycles) {
              const next = [...queue[i]];
              cy.forEach(
                (v, j) => (next[cy[(j + 1) % cy.length]] = queue[i][v]),
              );
              const key = next.join(",");
              if (!seen.has(key)) {
                seen.add(key);
                queue.push(next);
              }
            }
          for (const target of permutations(start))
            expect(rotationClass(n, edges, start, target).possible).toBe(
              seen.has(target.join(",")),
            );
        }
      }
    }
    const cactus = [
      [0, 1],
      [1, 2],
      [2, 0],
      [0, 3],
      [3, 4],
      [4, 0],
    ];
    expect(
      rotationClass(5, cactus, [0, 1, 2, 3, 4], [1, 0, 2, 3, 4]).possible,
    ).toBe(false);
    expect(
      rotationClass(5, cactus, [0, 1, 2, 3, 4], [1, 2, 0, 3, 4]).possible,
    ).toBe(true);
  });
  it("X: official Hall obstruction occurs on action 4", () => {
    const actions: Action[] = [
      { kind: "ask", player: 0, from: 1, card: 10, yes: false },
      { kind: "ask", player: 1, from: 2, card: 8, yes: true },
      { kind: "ask", player: 1, from: 3, card: 11, yes: true },
      { kind: "ask", player: 1, from: 0, card: 10, yes: false },
    ];
    expect(checkQuartets(actions).firstFailure).toBe(4);
  });
  it("X: compare every balanced initial hand on small decks with deterministic action logs", () => {
    const deck: Deck = { players: 2, suits: 2, perSuit: 2, hand: 2 },
      initial: number[][] = [];
    for (let m = 0; m < 16; m++) {
      const a = Array.from({ length: 4 }, (_, i) => (m >> i) & 1);
      if (a.reduce((s, x) => s + x, 0) === 2) initial.push(a);
    }
    function oracle(actions: Action[]) {
      return initial.some((hand) => {
        const owner = [...hand];
        for (const a of actions)
          if (a.kind === "ask") {
            if (
              !owner.some(
                (p, c) =>
                  p === a.player &&
                  Math.floor(c / 2) === Math.floor(a.card / 2),
              ) ||
              (owner[a.card] === a.from) !== a.yes
            )
              return false;
            if (a.yes) owner[a.card] = a.player;
          } else {
            for (let c = a.suit * 2; c < a.suit * 2 + 2; c++) {
              if (owner[c] !== a.player) return false;
              owner[c] = -2;
            }
          }
        return true;
      });
    }
    let seed = 17;
    const rand = (n: number) => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return (seed >>> 8) % n;
    };
    for (let t = 0; t < 500; t++) {
      const actions: Action[] = [];
      for (let i = 0; i < 6; i++) {
        const player = rand(2);
        actions.push(
          rand(4)
            ? {
                kind: "ask",
                player,
                from: 1 - player,
                card: rand(4),
                yes: !!rand(2),
              }
            : { kind: "quartet", player, suit: rand(2) },
        );
        expect(checkQuartets(actions, deck).possible).toBe(oracle(actions));
      }
    }
  });
  it("large Q/U inputs do not accidentally allocate educational histories", () => {
    const n = 100000,
      order = Array.from({ length: n }, (_, i) => i + 1),
      q = solveQueue(order);
    expect(q.answer).toBe(n + (n * (n - 1)) / 4);
    expect(q.events).toHaveLength(0);
    const track = solveTrain(100000, 100000).track;
    expect(track).toHaveLength(200000);
    expect(checkTrack(track).valid).toBe(true);
    expect(solveBridge([1, 2, 5, 10], 2).cells).toHaveLength(0);
    expect(checkQuartets([], undefined, false).history).toHaveLength(0);
  });
});
