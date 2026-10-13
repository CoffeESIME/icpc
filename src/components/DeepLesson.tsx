"use client";
import { useState } from "react";
import { deepDives } from "@/data/deep-dives";
import CodeLesson from "./CodeLesson";
import { Verification } from "./Verification";
export function DeepLesson({
  id,
  answers,
  onChange,
}: {
  id: string;
  answers: Record<string, string>;
  onChange: (answers: Record<string, string>) => void;
}) {
  const d = deepDives[id];
  return (
    <>
      <Verification id={id} />
      <h3>Un ejemplo que puedes reproducir</h3>
      <p className="lede">{d.example}</p>
      <ol className="worked-example">
        {d.walk.map((s) => (
          <li key={s.title}>
            <h4>{s.title}</h4>
            <p className="state-text">{s.state}</p>
            <p>{s.why}</p>
          </li>
        ))}
      </ol>
      <CodeLesson key={id} id={id} answers={answers} onChange={onChange} />
      <h3>Resumen del algoritmo</h3>
      <ol className="explained-code">
        {d.code.map((c) => (
          <li key={c.line}>
            <code>{c.line}</code>
            <p>{c.why}</p>
          </li>
        ))}
      </ol>
      <h3>Correctitud: qué hay que demostrar</h3>
      <ol className="algorithm-steps">
        {d.proof.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ol>
      <h3>Derivación del coste</h3>
      {d.costs.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </>
  );
}
export function Checkpoints({
  id,
  answers,
  onChange,
}: {
  id: string;
  answers: Record<string, string>;
  onChange: (answers: Record<string, string>) => void;
}) {
  const d = deepDives[id];
  const [revealed, setRevealed] = useState<number[]>([]);
  return (
    <section className="oral-checkpoints">
      <h3>Defensa sin consultar el guion</h3>
      <p>
        Escribe primero una respuesta. Después contrástala con los criterios y
        registra qué puedes defender. Es una autoevaluación, no una calificación
        automática.
      </p>
      {d.checkpoints.map((q, i) => {
        const key = `oral:${i}`,
          mark = `oral-check:${i}`,
          show = revealed.includes(i);
        return (
          <article key={key}>
            <span className="eyebrow">{q.kind}</span>
            <label className="guided-question">
              <span>{q.question}</span>
              <textarea
                aria-label={`Respuesta de ${q.kind.toLowerCase()}`}
                value={answers[key] || ""}
                onChange={(e) =>
                  onChange({ ...answers, [key]: e.target.value })
                }
              />
            </label>
            <button
              disabled={!answers[key]?.trim()}
              onClick={() =>
                setRevealed(
                  show ? revealed.filter((x) => x !== i) : [...revealed, i],
                )
              }
            >
              {show ? "Ocultar criterios" : "Contrastar mi respuesta"}
            </button>
            {show && (
              <div className="feedback">
                <p>{q.rubric}</p>
                <label>
                  <input
                    type="checkbox"
                    checked={answers[mark] === "sí"}
                    onChange={(e) =>
                      onChange({
                        ...answers,
                        [mark]: e.target.checked ? "sí" : "no",
                      })
                    }
                  />{" "}
                  Pude justificarlo sin leer la solución
                </label>
              </div>
            )}
          </article>
        );
      })}
      <p className="small">
        Autoevaluación guardada:{" "}
        {
          d.checkpoints.filter((_, i) => answers[`oral-check:${i}`] === "sí")
            .length
        }
        /4 criterios.
      </p>
    </section>
  );
}
