"use client";
import { useMemo, useState } from "react";
import {
  owners,
  parseLights,
  press,
  solveRed,
  mod,
  redPseudocode,
  type Lights,
  type RedState,
} from "@/algorithms/turning-red";
import { problems } from "@/data/problems";
import TracePlayer from "./TracePlayer";
const labels = ["R", "G", "B"];
const demo = "4 3\nGBRB\n2 1 2\n2 2 3\n2 3 4";
export function LightDiagram({
  input,
  colors = input.colors,
  values,
  active = [],
  onPress,
  graph = false,
}: {
  input: Lights;
  colors?: number[];
  values?: (number | null)[];
  active?: number[];
  onPress?: (b: number) => void;
  graph?: boolean;
}) {
  const own = owners(input),
    w = Math.max(420, input.colors.length * 66, input.buttons.length * 85);
  const bx = (i: number) => ((i + 1) * w) / (input.buttons.length + 1),
    lx = (i: number) => ((i + 0.5) * w) / input.colors.length;
  return (
    <div className="diagram-scroll">
      <svg
        role="img"
        aria-label={
          graph
            ? "Grafo de restricciones entre botones"
            : "Luces y conexiones a botones"
        }
        viewBox={`0 0 ${w} 220`}
        style={{ minWidth: Math.min(w, 420) }}
      >
        {graph
          ? own.map((buttons, l) =>
              buttons.length === 2 ? (
                <g key={l}>
                  <path
                    d={`M ${bx(buttons[0])} 140 Q ${(bx(buttons[0]) + bx(buttons[1])) / 2} ${20 + (l % 3) * 22} ${bx(buttons[1])} 140`}
                    className="wire"
                  />
                  <text
                    x={(bx(buttons[0]) + bx(buttons[1])) / 2}
                    y={70 + (l % 3) * 11}
                    className="svg-label"
                  >
                    L{l + 1}: suma ≡ {mod(-input.colors[l])}
                  </text>
                </g>
              ) : null,
            )
          : input.buttons.flatMap((list, b) =>
              list.map((l) => (
                <line
                  key={`${b}-${l}`}
                  x1={bx(b)}
                  y1={155}
                  x2={lx(l)}
                  y2={55}
                  className={`wire ${active.includes(b) ? "lit" : ""}`}
                />
              )),
            )}
        {!graph &&
          colors.map((c, l) => (
            <g key={l}>
              <circle
                cx={lx(l)}
                cy={48}
                r={21}
                className={`light light-${c}`}
              />
              <text x={lx(l)} y={53} className="light-letter">
                {labels[c]}
              </text>
              <text x={lx(l)} y={90} className="svg-label">
                L{l + 1}
              </text>
            </g>
          ))}
        {input.buttons.map((_, b) => (
          <g key={b}>
            <rect
              x={bx(b) - 23}
              y={145}
              width={46}
              height={38}
              rx={7}
              className={`svg-button ${active.includes(b) ? "active" : ""}`}
            />
            <text x={bx(b)} y={169} className="svg-label">
              B{b + 1}
            </text>
            <text x={bx(b)} y={207} className="svg-label">
              {values ? `x = ${values[b] ?? "?"}` : ""}
            </text>
          </g>
        ))}
      </svg>
      {onPress && (
        <div className="button-group manual-buttons">
          {input.buttons.map((_, b) => (
            <button key={b} onClick={() => onPress(b)}>
              Pulsar B{b + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export default function TurningRedLab() {
  const [raw, setRaw] = useState(demo),
    [input, setInput] = useState<Lights>(() => parseLights(demo)),
    [manual, setManual] = useState<number[][]>([parseLights(demo).colors]),
    [manualIndex, setManualIndex] = useState(0),
    [error, setError] = useState(""),
    [view, setView] = useState("Físico"),
    [traceShown, setTraceShown] = useState(false);
  const result = useMemo(() => solveRed(input, true), [input]),
    own = useMemo(() => owners(input), [input]);
  function load(text: string) {
    try {
      const parsed = parseLights(text);
      if (parsed.colors.length > 10 || parsed.buttons.length > 8)
        throw new Error(
          "El laboratorio admite hasta 10 luces y 8 botones para mantener legible la traza.",
        );
      setInput(parsed);
      setRaw(text);
      setManual([parsed.colors]);
      setManualIndex(0);
      setError("");
      setTraceShown(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function serialize(next: Lights) {
    return `${next.colors.length} ${next.buttons.length}\n${next.colors.map((c) => labels[c]).join("")}\n${next.buttons.map((b) => `${b.length} ${b.map((l) => l + 1).join(" ")}`).join("\n")}`;
  }
  const snapshot = (s: RedState, active: number[]) => {
    const colors = input.colors.map((c, l) =>
      mod(c + own[l].reduce((sum, b) => sum + (s.values[b] ?? 0), 0)),
    );
    return (
      <>
        <LightDiagram
          input={input}
          colors={colors}
          values={s.values}
          active={active}
        />
        <small>
          {s.values.some((v) => v === null)
            ? "Las variables ? aún no están asignadas; se muestran como cero solo para calcular este dibujo provisional."
            : "Colores al aplicar esta asignación al estado inicial."}
        </small>
      </>
    );
  };
  return (
    <div>
      <div className="lab-header">
        <div>
          <span className="eyebrow">Experimento 02</span>
          <h2>Conecta. Pulsa. Propaga.</h2>
        </div>
        <span className="badge">ℤ / 3ℤ</span>
      </div>
      <p>
        R → G → B → R. Cada luz puede estar conectada a cero, uno o dos botones.
        Intenta dejar todo en rojo.
      </p>
      <div className="input-row">
        <label>
          Casos de estudio
          <select
            aria-label="Caso de Turning Red"
            value=""
            onChange={(e) => load(e.target.value)}
          >
            <option value="" disabled>
              Elegir un caso…
            </option>
            <option value={demo}>Pequeño conectado</option>
            {problems
              .find((p) => p.id === "P")!
              .examples.map((e, i) => (
                <option key={i} value={e.input}>
                  Oficial {i + 1} · {e.output}
                </option>
              ))}
            <option value={"1 0\nG"}>Imposible: sin botones</option>
            <option value={"1 0\nR"}>Roja sin botones</option>
            <option value={"2 2\nRG\n2 1 2\n2 1 2"}>
              Restricciones contradictorias
            </option>
          </select>
        </label>
      </div>
      <details>
        <summary>Editar colores y conexiones</summary>
        <p>
          Haz clic en un color para cambiarlo. Cada casilla conecta un botón y
          una luz; aplicar una edición inválida muestra un aviso.
        </p>
        <div className="button-group">
          {input.colors.map((c, l) => (
            <button
              key={l}
              onClick={() =>
                load(
                  serialize({
                    ...input,
                    colors: input.colors.map((v, j) =>
                      j === l ? mod(v + 1) : v,
                    ),
                  }),
                )
              }
            >
              L{l + 1}: {labels[c]}
            </button>
          ))}
        </div>
        <div className="table-scroll">
          <table className="connection-table">
            <thead>
              <tr>
                <th>Botón</th>
                {input.colors.map((_, l) => (
                  <th key={l}>L{l + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {input.buttons.map((list, b) => (
                <tr key={b}>
                  <th>B{b + 1}</th>
                  {input.colors.map((_, l) => (
                    <td key={l}>
                      <input
                        type="checkbox"
                        aria-label={`Conectar B${b + 1} con L${l + 1}`}
                        checked={list.includes(l)}
                        onChange={() => {
                          const buttons = input.buttons.map((ls, i) =>
                            i !== b
                              ? ls
                              : ls.includes(l)
                                ? ls.filter((v) => v !== l)
                                : [...ls, l],
                          );
                          load(serialize({ ...input, buttons }));
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <label>
          Entrada completa (permite añadir o quitar luces y botones)
          <textarea
            aria-label="Entrada de Turning Red"
            className="mono"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={7}
          />
        </label>
        <button onClick={() => load(raw)}>Aplicar entrada</button>
        <p className="small">
          Formato: l b; cadena de colores; para cada botón, cantidad de luces e
          índices desde 1. Cada botón debe controlar al menos una luz.
        </p>
      </details>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="segmented" aria-label="Vistas de Turning Red">
        {["Físico", "Grafo", "Ecuaciones", "Algoritmo"].map((v) => (
          <button
            key={v}
            aria-pressed={view === v}
            className={view === v ? "active" : ""}
            onClick={() => setView(v)}
          >
            {v}
          </button>
        ))}
      </div>
      {view === "Físico" && (
        <>
          <div className="experiment-stage">
            <LightDiagram
              input={input}
              colors={manual[manualIndex]}
              onPress={(b) => {
                setManual((h) => [
                  ...h.slice(0, manualIndex + 1),
                  press(input, b, manual[manualIndex]),
                ]);
                setManualIndex((i) => i + 1);
              }}
            />
          </div>
          <div className="button-group">
            <button
              disabled={!manualIndex}
              onClick={() => setManualIndex((i) => i - 1)}
            >
              ← Deshacer
            </button>
            <button
              disabled={manualIndex === manual.length - 1}
              onClick={() => setManualIndex((i) => i + 1)}
            >
              Rehacer →
            </button>
            <button
              onClick={() => {
                setManual([input.colors]);
                setManualIndex(0);
              }}
            >
              Reiniciar pulsaciones
            </button>
            <span>
              {manualIndex} pulsaciones ·{" "}
              {manual[manualIndex].every((c) => c === 0)
                ? "¡Todas rojas!"
                : "Sigue experimentando"}
            </span>
          </div>
        </>
      )}
      {view === "Grafo" && (
        <>
          <LightDiagram input={input} graph />
          <p>
            Los vértices son botones. Una luz compartida añade una arista,
            incluso si ya hay otra entre esos botones.
          </p>
          <ul>
            {own.map(
              (o, l) =>
                o.length < 2 && (
                  <li key={l}>
                    L{l + 1}:{" "}
                    {o.length === 1
                      ? `condición individual x${o[0] + 1} ≡ ${mod(-input.colors[l])}`
                      : `sin botones: ${input.colors[l] === 0 ? "ya satisfecha" : "imposible"}`}
                  </li>
                ),
            )}
          </ul>
        </>
      )}
      {view === "Ecuaciones" && (
        <div className="equations">
          {own.map((o, l) => (
            <div key={l}>
              <span>L{l + 1}</span>
              <code>
                {input.colors[l]}
                {o.map((b) => ` + x${b + 1}`).join("")} ≡ 0 (mod 3)
              </code>
              <small>{o.length} botones</small>
            </div>
          ))}
        </div>
      )}
      {view === "Algoritmo" && (
        <>
          <p>
            Para cada componente, fija un valor de raíz, propaga y comprueba
            contradicciones. Compara los tres intentos antes de elegir el
            mínimo.
          </p>
          {!traceShown ? (
            <button className="primary" onClick={() => setTraceShown(true)}>
              Calcular y abrir la traza
            </button>
          ) : (
            <>
              <p className="notice">
                Resultado:{" "}
                <strong>
                  {result.cost === null
                    ? "impossible"
                    : `${result.cost} pulsaciones mínimas`}
                </strong>
                . Las pulsaciones manuales no modifican el caso inicial del
                algoritmo.
              </p>
              <TracePlayer
                events={result.trace}
                code={redPseudocode}
                render={snapshot}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
