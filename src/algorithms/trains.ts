import { event, type TraceEvent } from "./trace";
export type TrackState = {
  cells: { x: number; y: number; d: number; piece: string }[];
  x: number;
  y: number;
  d: number;
  used: string;
};
export function checkTrack(track: string, trace = false) {
  const events: TraceEvent<TrackState>[] = [],
    seen = new Set<string>();
  let state: TrackState = { cells: [], x: 0, y: 0, d: 0, used: "" },
    valid = true;
  for (const piece of track) {
    const { x, y, d } = state,
      key = `${x},${y}`;
    if (seen.has(key) || !"SLR".includes(piece)) valid = false;
    seen.add(key);
    const nextD = (d + (piece === "L" ? 3 : piece === "R" ? 1 : 0)) % 4;
    const cells = trace ? [...state.cells] : state.cells;
    cells.push({ x, y, d, piece });
    const next: TrackState = {
      cells,
      x: x + [1, 0, -1, 0][nextD],
      y: y + [0, 1, 0, -1][nextD],
      d: nextD,
      used: trace ? state.used + piece : "",
    };
    if (trace)
      event(events, state, next, {
        operation: `Colocar ${piece}`,
        explanation: `Celda (${x}, ${y}). Orientación ${["este", "sur", "oeste", "norte"][d]} → ${["este", "sur", "oeste", "norte"][nextD]}. ${seen.size === next.cells.length ? "La celda estaba libre." : "Hay una celda repetida."}`,
        active: [state.cells.length],
        pseudocode: 3,
        variables: {
          x: next.x,
          y: next.y,
          dirección: nextD,
          piezas: next.used.length,
        },
        invariant:
          "Cada pieza ocupa una celda distinta; el extremo avanza a la celda vecina.",
        partial: next.used,
      });
    state = next;
  }
  return {
    valid:
      valid &&
      track.length >= 4 &&
      state.x === 0 &&
      state.y === 0 &&
      state.d === 0,
    state,
    events,
  };
}
export const trainCode = [
  "s ← mayor par ≤ inventario de rectas",
  "elegir cantidad máxima de curvas y base según s y c mod 4",
  "insertar ampliaciones en las dos separaciones indicadas",
  "emitir cada pieza; comprobar celda, posición y orientación",
];
export function solveTrain(s: number, c: number) {
  if (
    !Number.isInteger(s) ||
    !Number.isInteger(c) ||
    s < 0 ||
    c < 4 ||
    s > 100000 ||
    c > 100000
  )
    throw Error("0 ≤ s ≤ 100000 y 4 ≤ c ≤ 100000.");
  s -= s % 2;
  c -= c % 2;
  if (!s) {
    c -= c % 4;
    if (c === 8) c = 4;
  }
  let track: string,
    base: string,
    k = 0,
    t = 0,
    gaps: number[];
  if (c === 4) {
    base = "LLLL";
    gaps = [0, 2];
    t = s / 2;
    track = [...base]
      .map((p, i) => (gaps.includes(i) ? "S".repeat(t) : "") + p)
      .join("");
  } else {
    base = !s ? "LRRLRRLRRLRR" : c % 4 === 0 ? "LSLLSL" : "LSLSLLRL";
    gaps = !s ? [0, 6] : [0, 3];
    k = (c - [...base].filter((x) => x !== "S").length) / 4;
    t = !s ? 0 : (s - 2) / 2;
    const word = !s ? "LR" : "RL";
    track = [...base]
      .map(
        (p, i) => (gaps.includes(i) ? word.repeat(k) + "S".repeat(t) : "") + p,
      )
      .join("");
  }
  return { track, s, c, base, k, t, gaps };
}
