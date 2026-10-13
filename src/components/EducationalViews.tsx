import type { TrackState } from "@/algorithms/trains";
export function StateTable({
  caption,
  columns,
  rows,
  active = [],
}: {
  caption: string;
  columns: string[];
  rows: (string | number)[][];
  active?: number[];
}) {
  return (
    <div className="education-table">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={active.includes(i) ? "highlight" : ""}>
              {r.map((v, j) => (
                <td key={j}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function FenwickView({
  tree,
  visited,
}: {
  tree: number[];
  visited: number[];
}) {
  return (
    <StateTable
      caption="Fenwick · intervalos almacenados (índices desde 1)"
      columns={["j", "Intervalo", "Conteo", "Consulta"]}
      rows={tree.map((v, i) => {
        const j = i + 1;
        return [
          j,
          `${j - (j & -j) + 1}…${j}`,
          v,
          visited.includes(j) ? "visitado" : "—",
        ];
      })}
      active={visited.map((j) => j - 1)}
    />
  );
}
export function GraphView({
  labels,
  edges,
  active = [],
}: {
  labels: string[];
  edges: number[][];
  active?: number[];
}) {
  const pts = labels.map((_, i) => [
    160 + 112 * Math.cos(-Math.PI / 2 + (i * 2 * Math.PI) / labels.length),
    145 + 108 * Math.sin(-Math.PI / 2 + (i * 2 * Math.PI) / labels.length),
  ]);
  return (
    <svg
      className="education-graph"
      viewBox="0 0 320 290"
      role="img"
      aria-label={`Grafo: ${labels.join(", ")}. Aristas: ${edges.map(([a, b]) => `${a}–${b}`).join(", ")}`}
    >
      <title>Vértices, aristas y estado actual</title>
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={pts[a][0]}
          y1={pts[a][1]}
          x2={pts[b][0]}
          y2={pts[b][1]}
        />
      ))}
      {labels.map((s, i) => (
        <g key={i} className={active.includes(i) ? "highlight" : ""}>
          <circle cx={pts[i][0]} cy={pts[i][1]} r="22" />
          <text x={pts[i][0]} y={pts[i][1] + 5} textAnchor="middle">
            {s}
          </text>
          <text
            className="vertex-index"
            x={pts[i][0]}
            y={pts[i][1] + 37}
            textAnchor="middle"
          >
            v{i}
          </text>
        </g>
      ))}
    </svg>
  );
}
export function ModularView({
  a,
  b,
  modulus = 3,
}: {
  a: number;
  b: number;
  modulus?: number;
}) {
  const result = (((a + b) % modulus) + modulus) % modulus;
  return (
    <div
      className="modular-view"
      aria-label={`${a} más ${b} módulo ${modulus} igual a ${result}`}
    >
      <span>{a}</span> + <span>{b}</span> ≡ <strong>{result}</strong> (mod{" "}
      {modulus})
      <div className="residues">
        {Array.from({ length: modulus }, (_, i) => (
          <span key={i} className={i === result ? "highlight" : ""}>
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}
export function MatchingView({
  left,
  right,
  edges,
  matching,
}: {
  left: string[];
  right: string[];
  edges: number[][];
  matching: number[];
}) {
  return (
    <div>
      <p className="small">
        Cada fila es un hueco; una carta no puede cubrir dos filas. Las líneas
        gruesas muestran asignaciones encontradas.
      </p>
      <svg
        className="matching-view"
        viewBox={`0 0 460 ${Math.max(left.length, right.length) * 45 + 25}`}
        role="img"
        aria-label={`Matching: ${left.map((s, i) => `${s}: ${matching[i] >= 0 ? right[matching[i]] : "sin asignación"}`).join("; ")}`}
      >
        <title>Huecos y cartas candidatas</title>
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1="135"
            x2="310"
            y1={30 + a * 45}
            y2={30 + b * 45}
            className={matching[a] === b ? "matched" : ""}
          />
        ))}
        {left.map((s, i) => (
          <text key={i} x="5" y={35 + i * 45}>
            {s}
          </text>
        ))}
        {right.map((s, i) => (
          <text key={i} x="325" y={35 + i * 45}>
            {s}
          </text>
        ))}
      </svg>
    </div>
  );
}
export function TrackView({ state }: { state: TrackState }) {
  const points = [...state.cells, { x: state.x, y: state.y }],
    xs = points.map((p) => p.x),
    ys = points.map((p) => p.y),
    x = Math.min(...xs) - 1,
    y = Math.min(...ys) - 1,
    w = Math.max(...xs) - x + 2,
    h = Math.max(...ys) - y + 2;
  const dirs = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];
  return (
    <svg
      className="track-view"
      viewBox={`${x * 30} ${y * 30} ${w * 30} ${h * 30}`}
      role="img"
      aria-label={`Circuito: ${state.cells.length} piezas. Extremo (${state.x},${state.y}), orientación ${state.d}.`}
    >
      <title>Celdas y conexiones entre puntos medios</title>
      {state.cells.map((c, i) => {
        const v = dirs[c.d],
          out =
            dirs[(c.d + (c.piece === "L" ? 3 : c.piece === "R" ? 1 : 0)) % 4],
          cx = c.x * 30,
          cy = c.y * 30;
        return (
          <g key={i}>
            <rect x={cx - 15} y={cy - 15} width="30" height="30" />
            <path
              d={`M ${cx - v[0] * 15} ${cy - v[1] * 15} Q ${cx} ${cy} ${cx + out[0] * 15} ${cy + out[1] * 15}`}
            />
            <text x={cx + 4} y={cy + 10}>
              {i + 1}
            </text>
          </g>
        );
      })}
      <circle cx={state.x * 30} cy={state.y * 30} r="4" />
    </svg>
  );
}
