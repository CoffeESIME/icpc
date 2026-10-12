"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Play, Pause, SkipBack, ChevronLeft, ChevronRight } from "lucide-react";
import type { TraceEvent } from "@/algorithms/trace";
export default function TracePlayer<S>({
  events,
  code,
  render,
}: {
  events: TraceEvent<S>[];
  code: string[];
  render: (state: S, active: number[]) => ReactNode;
}) {
  const [index, setIndex] = useState(0),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(1000);
  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [events]);
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
      <label className="sr-only" htmlFor="trace-range">
        Paso de ejecución
      </label>
      <input
        id="trace-range"
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
          {render(e.after, e.active)}
        </div>
      </div>
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
    </div>
  );
}
