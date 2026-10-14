"use client";
import { useId, useMemo, useState } from "react";
import { implementationLessons } from "@/data/implementation-lessons";
import { deepDives } from "@/data/deep-dives";
import { compressionDirectTrace } from "@/algorithms/compression-direct-trace";
import TracePlayer from "./TracePlayer";
import { StateTable } from "./EducationalViews";
import { SourceCode, sourceLine, sources } from "./SourceCode";
import TurningRedLab from "./TurningRedLab";
import { LiarLab, TrainLab, QueueLab } from "./ExtendedLabs";
import GuidedLab from "./GuidedLabs";
import PythonCode from "./PythonCode";

const views = [
  "Pseudocódigo",
  "Código completo",
  "Completar código",
  "Ejecución",
];
const normalize = (s: string) =>
  s.replace(/\s/g, "").replaceAll("'", '"').replace(/;$/, "");
function CompressionExecution() {
  const [input, setInput] = useState("0010100");
  const valid = /^[01]{1,40}$/.test(input);
  const events = useMemo(
    () => (valid ? compressionDirectTrace(input) : []),
    [input, valid],
  );
  return (
    <>
      <label className="guided-question">
        Cadena para la ejecución directa
        <input
          value={input}
          maxLength={40}
          onChange={(e) => setInput(e.target.value)}
        />
      </label>
      <p className="small">
        Prueba 0000, 0011 y 0010100 para recorrer los tres casos. Máximo 40 bits
        en esta vista.
      </p>
      {!valid ? (
        <p role="alert">Escribe entre 1 y 40 bits.</p>
      ) : (
        <TracePlayer
          events={events}
          code={[]}
          render={(s) => (
            <StateTable
              caption="Variables del cálculo directo"
              columns={["Variable", "Valor"]}
              rows={[
                ["s (sin modificar)", input],
                ["first", s.first || "—"],
                ["last", s.last || "—"],
                ["i", s.line ? s.i : "sin inicializar"],
                ["different", s.line ? String(s.different) : "sin inicializar"],
                ["result", s.line ? s.result || "vacío" : "sin inicializar"],
              ]}
            />
          )}
        />
      )}
    </>
  );
}
export default function CodeLesson({
  id,
  answers,
  onChange,
}: {
  id: string;
  answers: Record<string, string>;
  onChange: (answers: Record<string, string>) => void;
}) {
  const uid = useId();
  const lesson = implementationLessons[id],
    d = deepDives[id];
  const [view, setView] = useState(0),
    [revealed, setRevealed] = useState<number[]>([]),
    [checked, setChecked] = useState<number[]>([]),
    [solutions, setSolutions] = useState<number[]>([]);
  const entry = sources[lesson.file].declarations.find(
    (x) => x.name === lesson.entry,
  )!;
  const visible = view === 2 || revealed.includes(view);
  const language =
    answers["code:language"] === "python" ? "python" : "typescript";
  return (
    <section className="code-lesson" aria-label="De la idea al código">
      <span className="eyebrow">IMPLEMENTAR Y RECONSTRUIR</span>
      <h3>De la idea al código</h3>
      <p>{lesson.contract}</p>
      <p className="small">
        <strong>{d.status}.</strong> Implementación probada en este proyecto; no
        se afirma aceptación por un juez externo.
      </p>
      <div
        className="code-tabs"
        role="group"
        aria-label="Vistas de implementación"
      >
        {views.map((v, i) => (
          <button key={v} aria-pressed={view === i} onClick={() => setView(i)}>
            {v}
          </button>
        ))}
      </div>
      {view === 1 && (
        <div
          className="code-tabs"
          role="group"
          aria-label="Lenguaje del código"
        >
          <button
            aria-pressed={language === "typescript"}
            onClick={() =>
              onChange({ ...answers, "code:language": "typescript" })
            }
          >
            TypeScript
          </button>
          <button
            aria-pressed={language === "python"}
            onClick={() => onChange({ ...answers, "code:language": "python" })}
          >
            Python
          </button>
        </div>
      )}
      {!visible && (
        <div className="code-attempt">
          <p>
            Antes de consultar, intenta describir las variables, el ciclo
            principal y el retorno. Puedes terminar el intento aunque no hayas
            encontrado la respuesta.
          </p>
          <label className="guided-question">
            Mi intento de implementación
            <textarea
              value={answers["code:attempt"] || ""}
              onChange={(e) =>
                onChange({ ...answers, "code:attempt": e.target.value })
              }
            />
          </label>
          <button onClick={() => setRevealed([...revealed, view])}>
            Terminar intento y ver {views[view].toLowerCase()}
          </button>
        </div>
      )}
      {visible && view === 0 && (
        <ol className="implementation-steps">
          {lesson.steps.map((s, i) => (
            <li key={i}>
              <pre>{s.pseudo}</pre>
              <p>{s.why}</p>
              <details>
                <summary>
                  Ver la instrucción real · línea{" "}
                  {sourceLine(lesson.file, s.anchor)}
                </summary>
                <SourceCode
                  file={lesson.file}
                  start={Math.max(1, sourceLine(lesson.file, s.anchor) - 1)}
                  end={sourceLine(lesson.file, s.anchor) + 5}
                />
              </details>
            </li>
          ))}
        </ol>
      )}
      {visible && view === 1 && language === "python" && <PythonCode id={id} />}
      {visible && view === 1 && language === "typescript" && (
        <>
          <p>
            Función de entrada: <code>{lesson.entry}</code>. Los argumentos son
            datos ya leídos; los ejemplos de llamada muestran cómo usar el
            módulo. La instrumentación opcional guarda estados educativos.
          </p>
          <pre className="call-example">{lesson.call}</pre>
          <SourceCode file={lesson.file} start={entry.start} end={entry.end} />
          <h4>Cómo leer cada fragmento</h4>
          <ol className="implementation-steps">
            {lesson.steps.map((s, i) => (
              <li key={i}>
                <code>
                  L{sourceLine(lesson.file, s.anchor)} · {s.anchor}
                </code>
                <p>{s.why}</p>
              </li>
            ))}
          </ol>
          <details>
            <summary>
              Módulo completo: tipos, auxiliares, comentarios e importaciones
            </summary>
            <p className="small">
              Archivo íntegro del repositorio. Algunos módulos agrupan varios
              problemas; arriba se muestra la función de este problema.
            </p>
            <SourceCode file={lesson.file} />
          </details>
          {sources[lesson.file].code.includes('"./trace"') && (
            <details>
              <summary>Dependencia local completa: trace.ts</summary>
              <SourceCode file="trace" />
            </details>
          )}
          <p>
            <a
              href={`/reference/${lesson.file}.ts.txt`}
              download={`${lesson.file}.ts`}
            >
              Descargar {sources[lesson.file].path}
            </a>
            {sources[lesson.file].code.includes('"./trace"') && (
              <>
                {" "}
                ·{" "}
                <a href="/reference/trace.ts.txt" download="trace.ts">
                  Descargar src/algorithms/trace.ts
                </a>
              </>
            )}
          </p>
          <p className="small">
            Copias generadas de los archivos reales al iniciar o compilar.
            Guarda la dependencia en el mismo directorio y usa TypeScript con
            bibliotecas ES2023 o posteriores (toSorted/at). El proyecto ya
            proporciona ese entorno.
          </p>
        </>
      )}
      {view === 2 && (
        <>
          <p>
            Completa cada hueco con una expresión TypeScript. La comprobación
            compara texto normalizado con la respuesta de referencia; no ejecuta
            código y puede no reconocer expresiones equivalentes.
          </p>
          {lesson.exercises.map((ex, i) => {
            const key = `code:${i}`,
              value = answers[key] || "",
              show = solutions.includes(i),
              done = checked.includes(i);
            return (
              <article className="code-exercise" key={i}>
                <h4>
                  {i + 1}. {ex.prompt}
                </h4>
                <pre>{ex.template}</pre>
                <label htmlFor={`${uid}-${i}`}>
                  Expresión para el hueco {i + 1}
                </label>
                <textarea
                  id={`${uid}-${i}`}
                  value={value}
                  onChange={(e) => {
                    onChange({ ...answers, [key]: e.target.value });
                    setChecked(checked.filter((x) => x !== i));
                  }}
                  spellCheck={false}
                />
                <details>
                  <summary>Pista</summary>
                  <p>{ex.hint}</p>
                </details>
                <div className="button-group">
                  <button
                    disabled={!value.trim()}
                    onClick={() => setChecked([...checked, i])}
                  >
                    Comprobar hueco {i + 1}
                  </button>
                  <button
                    onClick={() => {
                      setChecked([...checked, i]);
                      setSolutions(
                        show
                          ? solutions.filter((x) => x !== i)
                          : [...solutions, i],
                      );
                    }}
                  >
                    {show
                      ? "Ocultar solución"
                      : "Terminar intento y revelar solución"}
                  </button>
                </div>
                {done && (
                  <p role="status">
                    {normalize(value) === normalize(ex.answer)
                      ? "Coincide con la referencia."
                      : "Compara tu expresión con la referencia y justifica si hace lo mismo."}
                  </p>
                )}
                {show && (
                  <div className="feedback">
                    <pre>{ex.template.replace("___", ex.answer)}</pre>
                    <p>{ex.why}</p>
                  </div>
                )}
              </article>
            );
          })}
        </>
      )}
      {visible && view === 3 && (
        <>
          <p className="notice">{lesson.execution}</p>
          {id === "Y" ? (
            <CompressionExecution />
          ) : id === "P" ? (
            <TurningRedLab />
          ) : id === "W" ? (
            <LiarLab />
          ) : id === "U" ? (
            <TrainLab />
          ) : id === "Q" ? (
            <QueueLab />
          ) : (
            <GuidedLab id={id} />
          )}
        </>
      )}
      <details className="code-references">
        <summary>Fuente del código y referencias de la solución</summary>
        <p>
          <a
            href={`/reference/${lesson.file}.ts.txt`}
            target="_blank"
            rel="noreferrer"
          >
            {sources[lesson.file].path}
          </a>{" "}
          · función {lesson.entry}
        </p>
        {d.sources.map((s) => (
          <p key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.title}
            </a>
          </p>
        ))}
        <p>{d.evidence}</p>
        {d.limitations.map((s) => (
          <p key={s}>{s}</p>
        ))}
      </details>
    </section>
  );
}
