import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import ts from "typescript";
import catalog from "../data/code-catalog.json";
import { implementationLessons } from "../data/implementation-lessons";
import { deepDives } from "../data/deep-dives";
import { compress } from "./compression";
import { compressionDirectTrace } from "./compression-direct-trace";
import { solveQueue, solveLiar, solveBridge, solveLevers } from "./extended";
import { solveRed } from "./turning-red";
import { solveTrain, checkTrack } from "./trains";
import { solveDice, solvePyramids } from "./geometry";
import { rotationClass } from "./rotations";
import { checkQuartets } from "./quartets";

const sources: Record<string, typeof catalog.compression> = catalog;
const compact = (s: string) => s.replace(/\s/g, "");
it("all eleven implementation lessons point to actual declarations and tested expressions", () => {
  expect(Object.keys(implementationLessons).sort()).toEqual(
    Object.keys(deepDives).sort(),
  );
  for (const lesson of Object.values(implementationLessons)) {
    const source = sources[lesson.file];
    expect(source.declarations.some((d) => d.name === lesson.entry)).toBe(true);
    for (const step of lesson.steps) {
      expect(source.code.includes(step.anchor), step.anchor).toBe(true);
      expect(step.why).not.toContain("PLACEHOLDER");
    }
    for (const ex of lesson.exercises) {
      expect(ex.template.match(/___/g)).toHaveLength(1);
      expect(compact(source.code).includes(compact(ex.answer)), ex.answer).toBe(
        true,
      );
    }
  }
});
it("the displayed modules and downloadable dependencies equal the real repository files", () => {
  for (const [name, source] of Object.entries(sources)) {
    const actual = readFileSync(source.path, "utf8").replaceAll("\r\n", "\n");
    expect(source.code).toBe(actual);
    expect(readFileSync(`public/reference/${name}.ts.txt`, "utf8")).toBe(
      actual,
    );
  }
});
it("downloaded modules form executable TypeScript modules, including their trace dependency", () => {
  const cache: Record<
    string,
    Record<string, (...args: never[]) => unknown>
  > = {};
  const load = (
    name: string,
  ): Record<string, (...args: never[]) => unknown> => {
    if (cache[name]) return cache[name];
    const exports = (cache[name] = {});
    const js = ts.transpileModule(sources[name].code, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
      },
    }).outputText;
    // Only trusted repository text; never student input. Dependencies are whitelisted.
    new Function("exports", "require", js)(exports, (id: string) => {
      if (id !== "./trace") throw Error(`Unexpected dependency: ${id}`);
      return load("trace");
    });
    return exports;
  };
  for (const lesson of Object.values(implementationLessons))
    expect(typeof load(lesson.file)[lesson.entry]).toBe("function");
  const copied = load("compression").compress as unknown as typeof compress;
  expect(copied("0010100")).toBe("010");
});
it("Compression direct snapshots observe the real scan and all three branches for every word up to eight bits", () => {
  const branches = new Set<string>();
  for (let n = 1; n <= 8; n++)
    for (let mask = 0; mask < 2 ** n; mask++) {
      const input = mask.toString(2).padStart(n, "0"),
        events = compressionDirectTrace(input);
      expect(events.at(-1)!.after.result).toBe(compress(input));
      expect(events.filter((e) => e.after.line.startsWith("if (")).length).toBe(
        n - 1,
      );
      for (const [i, e] of events.entries()) {
        if (i) expect(e.before).toEqual(events[i - 1].after);
        expect(e.after.first).toBe(input[0]);
        expect(e.after.last).toBe(input.at(-1));
        expect(
          sources.compression.code
            .split("\n")
            .some((l) => l.trim() === e.source!.anchor),
        ).toBe(true);
        if (e.after.line.startsWith("if ("))
          expect(e.after.different).toBe(
            [...input.slice(0, e.after.i + 1)].some((c) => c !== input[0]),
          );
        if (e.after.line.startsWith("result =")) branches.add(e.after.line);
      }
    }
  expect(branches.size).toBe(3);
  expect(() => compressionDirectTrace("")).toThrow();
  expect(() => compressionDirectTrace("012")).toThrow();
});
it("the eleven published invocation examples reproduce their stated results", () => {
  expect(compress("0010100")).toBe("010");
  expect(solveRed({ colors: [1], buttons: [[0]] }).presses).toEqual([2]);
  expect(solveQueue([4, 2, 5, 3, 1]).answer).toBe(7);
  expect(solveLiar([2, 3, 1, 6, 999]).answer).toEqual([2, 3, 1]);
  expect(solveTrain(2, 8).track).toBe("RLLSLRLLSL");
  expect(solveBridge([1, 2, 5, 10], 2).answer).toBe(17);
  expect(
    rotationClass(
      3,
      [
        [0, 1],
        [1, 2],
        [2, 0],
      ],
      [1, 2, 3],
      [2, 3, 1],
    ).possible,
  ).toBe(true);
  expect(checkQuartets([], undefined, false).possible).toBe(true);
  expect(solvePyramids([0, 0, 10, 0, 5], [20, 0, 30, 0, 5]).answer).toBeCloseTo(
    24.142135624,
    7,
  );
  expect(solveDice([1], [1])).toMatchObject({ minimum: 0.5, maximum: 0.5 });
  expect(solveLevers([1, 1, 0], 1).answer).toEqual([[1]]);
});
it("executable trace source references resolve to real source and tracing preserves answers", () => {
  const red = { colors: [1, 0], buttons: [[0, 1], [1]] };
  expect(solveRed(red, true).cost).toBe(solveRed(red).cost);
  const events = [
    ...solveRed(red, true).trace,
    ...solveQueue([4, 2, 5, 3, 1], true).events,
    ...solveLiar([2, 3, 1, 6, 999], true).events,
    ...checkTrack(solveTrain(2, 8).track, true).events,
  ];
  for (const event of events) {
    expect(event.source).toBeDefined();
    expect(
      sources[event.source!.file].code.includes(event.source!.anchor),
      event.operation,
    ).toBe(true);
  }
});
