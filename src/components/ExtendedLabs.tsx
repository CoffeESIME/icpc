"use client";
import { useMemo, useState } from "react";
import TracePlayer from "./TracePlayer";
import {
  solveQueue,
  queueCode,
  queuePhysical,
  solveLiar,
  lieCode,
  questions,
} from "@/algorithms/extended";
import { solveTrain, checkTrack, trainCode } from "@/algorithms/trains";
import { FenwickView, StateTable, TrackView } from "./EducationalViews";
import { Verification } from "./Verification";
export function QueueLab() {
  const [input, setInput] = useState("4 2 5 3 1"),
    [mask, setMask] = useState(0),
    [order, setOrder] = useState([4, 2, 5, 3, 1]),
    [error, setError] = useState("");
  const result = useMemo(() => solveQueue(order, true), [order]);
  return (
    <>
      <span className="eyebrow">05 / DOS PILAS Y FENWICK</span>
      <h2>Contar una esperanza.</h2>
      <p>
        La traza ejecuta el conteo de etiquetas activas. Una realización física
        puede costar más o menos que su promedio.
      </p>
      <Verification id="Q" />
      <form
        className="lab-form"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            const p = input
              .trim()
              .split(/[\s,]+/)
              .map(Number);
            if (p.length > 9)
              throw Error("Usa como máximo9 etiquetas en la vista.");
            solveQueue(p);
            setOrder(p);
            setMask(0);
            setError("");
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      >
        <label>
          Orden de retirada
          <input value={input} onChange={(e) => setInput(e.target.value)} />
        </label>
        <button className="primary">Calcular esperanza</button>
      </form>
      {error && <p role="alert">{error}</p>}
      <p className="result-banner">
        Esperanza: <strong>{result.answer}</strong> movimientos
      </p>
      <TracePlayer
        events={result.events}
        code={queueCode}
        render={(s) => (
          <>
            <p>Retirados: {s.removed.join(" → ") || "ninguno"}</p>
            <p>
              Activos: {s.active.join(", ") || "ninguno"} · Acumulador doble:{" "}
              {s.twice}
            </p>
            <FenwickView tree={s.tree} visited={s.visited} />
          </>
        )}
      />
      <details>
        <summary>Contrastar con un reparto físico</summary>
        <label>
          Reparto inicial (máscara binaria): {mask}
          <input
            type="range"
            min="0"
            max={2 ** order.length - 1}
            value={mask}
            onChange={(e) => setMask(Number(e.target.value))}
          />
        </label>
        <StateTable
          caption="Pilas iniciales, de abajo arriba"
          columns={["Pila", "Etiquetas"]}
          rows={[0, 1].map((b) => [
            b + 1,
            Array.from({ length: order.length }, (_, i) => i + 1)
              .filter((v) => ((mask >> (v - 1)) & 1) === b)
              .join(", ") || "vacía",
          ])}
        />
        <p>
          Simulación física de este reparto:{" "}
          <strong>{queuePhysical(order, mask)}</strong> movimientos. La
          esperanza anterior promedia todos los repartos equiprobables.
        </p>
      </details>
    </>
  );
}
export function LiarLab() {
  const [secret, setSecret] = useState([2, 3, 1]),
    [lie, setLie] = useState(1),
    [bad, setBad] = useState(8);
  const replies = useMemo(
    () =>
      questions.map((r, i) =>
        i === lie ? bad : r.reduce((s, v, j) => s + v * secret[j], 0),
      ),
    [secret, lie, bad],
  );
  const result = useMemo(() => solveLiar(replies, true), [replies]);
  return (
    <>
      <span className="eyebrow">05 / UN ERROR ENTRE CINCO RESPUESTAS</span>
      <h2>La esfinge puede mentir una vez.</h2>
      <Verification id="W" />
      <p>
        Configuras la verdad para el simulador. El algoritmo recibe únicamente
        las cinco respuestas y no conoce qué posición está alterada.
      </p>
      <div className="lab-form">
        {["x", "y", "z"].map((s, i) => (
          <label key={s}>
            Cantidad {s}
            <input
              type="number"
              min="0"
              max="100"
              value={secret[i]}
              onChange={(e) =>
                setSecret(
                  secret.map((x, j) =>
                    j === i
                      ? Math.max(
                          0,
                          Math.min(100, Math.floor(Number(e.target.value))),
                        )
                      : x,
                  ),
                )
              }
            />
          </label>
        ))}
        <label>
          Respuesta alterada
          <select value={lie} onChange={(e) => setLie(Number(e.target.value))}>
            <option value="-1">Ninguna</option>
            {questions.map((_, i) => (
              <option key={i} value={i}>
                Consulta {i + 1}
              </option>
            ))}
          </select>
        </label>
        {lie >= 0 && (
          <label>
            Valor falso
            <input
              type="number"
              min="0"
              max="100000"
              value={bad}
              onChange={(e) =>
                setBad(
                  Math.max(
                    0,
                    Math.min(100000, Math.floor(Number(e.target.value))),
                  ),
                )
              }
            />
          </label>
        )}
      </div>
      <p className="result-banner">
        Recuperado:{" "}
        <strong>{result.answer?.join(", ") || "Sin candidato"}</strong>
      </p>
      <TracePlayer
        events={result.events}
        code={lieCode}
        render={(s) => (
          <>
            <StateTable
              caption="Mediciones recibidas"
              columns={["Consulta", "x", "y", "z", "Respuesta"]}
              rows={s.rows.map((r, i) => [i + 1, ...r])}
              active={s.selected}
            />
            <p>
              Candidato:{" "}
              {s.candidate.length
                ? s.candidate.map((v) => Number(v.toFixed(3))).join(", ")
                : "todavía ninguno"}
            </p>
            <p>
              Coincide con: {s.agreements.map((i) => i + 1).join(", ") || "—"}{" "}
              {s.accepted ? "· aceptado" : ""}
            </p>
          </>
        )}
      />
    </>
  );
}
export function TrainLab() {
  const [s, setS] = useState(2),
    [c, setC] = useState(8);
  const solution = useMemo(() => solveTrain(s, c), [s, c]),
    result = useMemo(() => checkTrack(solution.track, true), [solution]);
  return (
    <>
      <span className="eyebrow">05 / CONSTRUIR Y VERIFICAR</span>
      <h2>Un circuito, celda a celda.</h2>
      <Verification id="U" />
      <div className="lab-form">
        <label>
          Rectas disponibles
          <input
            type="number"
            min="0"
            max="60"
            value={s}
            onChange={(e) =>
              setS(
                Math.max(0, Math.min(60, Math.floor(Number(e.target.value)))),
              )
            }
          />
        </label>
        <label>
          Curvas disponibles
          <input
            type="number"
            min="4"
            max="60"
            value={c}
            onChange={(e) =>
              setC(
                Math.max(4, Math.min(60, Math.floor(Number(e.target.value)))),
              )
            }
          />
        </label>
      </div>
      <p className="result-banner">
        <strong>{solution.track.length} piezas</strong> · {solution.s} rectas y{" "}
        {solution.c} curvas ·{" "}
        {result.valid ? "Cierre y celdas verificados" : "Fallo de validación"}
      </p>
      <p>
        Base <code>{solution.base}</code>. Ampliaciones en cortes{" "}
        {solution.gaps.join(" y ")} de la base original, índices desde0. k=
        {solution.k}, t={solution.t}.
      </p>
      <pre className="track-output">{solution.track}</pre>
      <TracePlayer
        events={result.events}
        code={trainCode}
        render={(state) => <TrackView state={state} />}
      />
    </>
  );
}
