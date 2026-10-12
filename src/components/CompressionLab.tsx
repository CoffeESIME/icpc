"use client";
import { useMemo, useState } from "react";
import {
  compress,
  reduce,
  reductions,
  compressionTrace,
  compressionPseudocode,
} from "@/algorithms/compression";
import TracePlayer from "./TracePlayer";
export function Bits({
  value,
  active = [],
}: {
  value: string;
  active?: number[];
}) {
  return (
    <div className="bits" aria-label={`Cadena ${value}`}>
      {[...value].map((c, i) => (
        <span
          key={i}
          className={`${c === "1" ? "one" : "zero"} ${active.includes(i) ? "selected" : ""}`}
        >
          {c}
          <small>{i + 1}</small>
        </span>
      ))}
    </div>
  );
}
export default function CompressionLab() {
  const [input, setInput] = useState("10110"),
    [history, setHistory] = useState(["10110"]),
    [index, setIndex] = useState(0),
    [error, setError] = useState(""),
    [showTrace, setShowTrace] = useState(false),
    [attempts, setAttempts] = useState<string[]>([]);
  const current = history[index],
    ops = useMemo(() => reductions(current), [current]),
    trace = useMemo(() => compressionTrace(history[0]), [history[0]]);
  function load(value: string) {
    if (!/^[01]{1,24}$/.test(value)) {
      setError(
        "Usa entre 1 y 24 bits (0 o 1). El límite pequeño permite enumerar todas las operaciones.",
      );
      return;
    }
    setError("");
    setInput(value);
    setHistory([value]);
    setIndex(0);
    setShowTrace(false);
  }
  function apply(start: number, length: number) {
    setHistory((h) => [
      ...h.slice(0, index + 1),
      reduce(current, { start, length }),
    ]);
    setIndex((i) => i + 1);
  }
  return (
    <div>
      <div className="lab-header">
        <div>
          <span className="eyebrow">Experimento 01</span>
          <h2>Menos bits. Las mismas pistas.</h2>
        </div>
        <span className="badge">XX → X</span>
      </div>
      <p>
        Elige dos bloques consecutivos iguales y conserva una copia. Prueba tu
        propia secuencia antes de reproducir la construcción.
      </p>
      <form
        className="input-row"
        onSubmit={(e) => {
          e.preventDefault();
          load(input);
        }}
      >
        <label>
          Cadena binaria
          <input
            aria-label="Cadena binaria"
            value={input}
            maxLength={24}
            onChange={(e) => setInput(e.target.value)}
          />
        </label>
        <button className="primary" type="submit">
          Cargar cadena
        </button>
        <label>
          Ejemplo
          <select
            aria-label="Ejemplo de Compression"
            defaultValue=""
            onChange={(e) => load(e.target.value)}
          >
            <option value="" disabled>
              Elegir…
            </option>
            {["1111", "101", "10110", "01010101", "01110"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="experiment-stage">
        <Bits value={current} />
        <div className="stage-caption">
          {current.length} bits · primer bit {current[0]} · último bit{" "}
          {current.at(-1)} · símbolos {[...new Set(current)].sort().join(", ")}
        </div>
      </div>
      <div className="button-group">
        <button disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          ← Deshacer
        </button>
        <button
          disabled={index === history.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          Rehacer →
        </button>
        <button
          onClick={() => {
            setIndex(0);
            setHistory([history[0]]);
          }}
        >
          Reiniciar intento
        </button>
        <button
          onClick={() =>
            setAttempts((a) => [
              ...a.slice(-4),
              history.slice(0, index + 1).join(" → "),
            ])
          }
        >
          Guardar intento
        </button>
      </div>
      <h3>
        Operaciones válidas <span className="muted">({ops.length})</span>
      </h3>
      {ops.length ? (
        <div className="operations">
          {ops.map((r) => (
            <button
              key={`${r.start}-${r.length}`}
              onClick={() => apply(r.start, r.length)}
              title={`Bloques en posiciones ${r.start + 1} a ${r.start + 2 * r.length}`}
            >
              <span className="mono">
                {current.slice(r.start, r.start + r.length)} ·{" "}
                {current.slice(r.start, r.start + r.length)}
              </span>
              <small>
                desde posición {r.start + 1} · quitar {r.length}
              </small>
            </button>
          ))}
        </div>
      ) : (
        <p className="notice">
          Ya no hay bloques consecutivos iguales. Tu resultado es mínimo para
          esta cadena binaria.
        </p>
      )}
      {attempts.length > 0 && (
        <details open>
          <summary>Comparar intentos guardados en esta sesión</summary>
          {attempts.map((a, i) => (
            <p className="mono wrap" key={i}>
              {i + 1}. {a}
            </p>
          ))}
        </details>
      )}
      <div className="reveal">
        <h3>De la experimentación a la prueba</h3>
        <p>
          ¿Qué se conservó en todos tus pasos? Formula una cota de longitud
          antes de ver la construcción.
        </p>
        <button className="primary" onClick={() => setShowTrace((v) => !v)}>
          {showTrace ? "Ocultar construcción" : "Ver construcción paso a paso"}
        </button>
      </div>
      {showTrace && (
        <>
          <p className="notice">
            El algoritmo de invariantes devuelve{" "}
            <strong>{compress(history[0])}</strong>. Esta traza muestra una
            secuencia real que alcanza esa respuesta. Las copias de strings de
            la traza no son la implementación lineal del solucionador.
          </p>
          <TracePlayer
            events={trace}
            code={compressionPseudocode}
            render={(s, a) => <Bits value={s} active={a} />}
          />
        </>
      )}
    </div>
  );
}
