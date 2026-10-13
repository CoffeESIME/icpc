"use client";
import { useEffect, useState, useId, type ReactNode } from "react";
import { Play, Pause, SkipBack, ChevronLeft, ChevronRight } from "lucide-react";
import type { TraceEvent } from "@/algorithms/trace";
export default function TracePlayer<S>({
  events,
  code,
  render,
  predict,
}: {
  events: TraceEvent<S>[];
  code: string[];
  render: (state: S, active: number[]) => ReactNode;
  predict?: (event: TraceEvent<S>) => { question: string; answer: string };
}) {
  const rangeId = useId();
  const [prediction, setPrediction] = useState(""),
    [checked, setChecked] = useState(false),
    [challenge, setChallenge] = useState(false);
  const [index, setIndex] = useState(0),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(1000);
  useEffect(() => {
    setIndex(0);
    setPlaying(false);
    setPrediction("");
    setChecked(false);
  }, [events]);
  useEffect(() => {
    setPrediction("");
    setChecked(false);
  }, [index]);
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(
      () =>
        setIndex((i) => {
          if (i >= events.length - 1) {
            setPlaying(false);
            return i;
          }
          return i + 1;
        }),
      speed,
    );
    return () => clearInterval(t);
  }, [playing, speed, events.length]);
  const e = events[Math.min(index, events.length - 1)];
  if (!e) return null;
  const quiz = predict?.(e),
    hide = challenge && !!quiz && !checked;
  return (
    <div className="trace-player">
      <div className="player-bar">
        <div className="button-group">
          <button
            aria-label="Reiniciar traza"
            onClick={() => {
              setIndex(0);
              setPlaying(false);
            }}
          >
            <SkipBack size={17} />
          </button>
          <button
            aria-label="Paso anterior"
            disabled={index === 0}
            onClick={() => {
              setPlaying(false);
              setIndex((i) => i - 1);
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="primary"
            aria-label={playing ? "Pausar traza" : "Reproducir traza"}
            disabled={challenge}
            onClick={() => {
              if (index === events.length - 1) setIndex(0);
              setPlaying((p) => !p);
            }}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}{" "}
            {playing ? "Pausar" : "Iniciar"}
          </button>
          <button
            aria-label="Paso siguiente"
            disabled={index === events.length - 1}
            onClick={() => {
              setPlaying(false);
              setIndex((i) => i + 1);
            }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <label>
          Velocidad{" "}
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            <option value={1800}>Lenta</option>
            <option value={1000}>Normal</option>
            <option value={400}>Rápida</option>
          </select>
        </label>
        <span className="mono">
          {index + 1} / {events.length}
        </span>
      </div>
      {quiz && (
        <div className="prediction">
          <label className="toggle">
            <input
              type="checkbox"
              checked={challenge}
              onChange={(e) => {
                setChallenge(e.target.checked);
                setPlaying(false);
                setChecked(false);
              }}
            />{" "}
            Anticipar el siguiente estado
          </label>
          {challenge && (
            <>
              <p>{quiz.question}</p>
              <label>
                Mi predicción
                <input
                  value={prediction}
                  onChange={(e) => {
                    setPrediction(e.target.value);
                    setChecked(false);
                  }}
                />
              </label>
              <button
                disabled={!prediction.trim()}
                onClick={() => setChecked(true)}
              >
                Comprobar predicción
              </button>
              {checked && (
                <p role="status">
                  {prediction.replace(/\s/g, "").toLowerCase() ===
                  quiz.answer.replace(/\s/g, "").toLowerCase()
                    ? "Correcto. "
                    : "Compara tu predicción: "}
                  El resultado de esta transición es{" "}
                  <strong>{quiz.answer}</strong>. {e.explanation}
                </p>
              )}
            </>
          )}
        </div>
      )}
      <label className="sr-only" htmlFor={rangeId}>
        Paso de ejecución
      </label>
      <input
        id={rangeId}
        type="range"
        min="0"
        max={events.length - 1}
        value={index}
        onChange={(e) => {
          setPlaying(false);
          setIndex(Number(e.target.value));
        }}
      />
      <div className="state-pair">
        <div>
          <span className="eyebrow">Antes</span>
          {render(e.before, [])}
        </div>
        <div>
          <span className="eyebrow">Después</span>
          {hide ? (
            <p className="notice">
              Estado oculto hasta comprobar tu predicción.
            </p>
          ) : (
            render(e.after, e.active)
          )}
        </div>
      </div>
      {!hide && (
        <>
          <div className="trace-explanation" aria-live="polite">
            <span className="step-number">{index + 1}</span>
            <div>
              <h3>{e.operation}</h3>
              <p>{e.explanation}</p>
            </div>
          </div>
          <dl className="variables">
            {Object.entries(e.variables).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="invariant">
            <strong>Condición que observamos</strong> · {e.invariant}
          </p>
          <ol className="pseudocode">
            {code.map((line, i) => (
              <li key={i} className={e.pseudocode === i ? "active" : ""}>
                <code>{line}</code>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
