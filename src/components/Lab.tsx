"use client";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  Clock,
  FlaskConical,
  LayoutDashboard,
  Menu,
  Moon,
  Sun,
  NotebookPen,
  Mic,
  Search,
  Download,
} from "lucide-react";
import {
  problems,
  referencePDF,
  solutionURL,
  statementURL,
  type Problem,
} from "@/data/problems";
import CompressionLab, { Bits } from "./CompressionLab";
import TurningRedLab from "./TurningRedLab";
import { deepDives } from "@/data/deep-dives";
import { DeepLesson, Checkpoints } from "./DeepLesson";
import { QueueLab, LiarLab, TrainLab } from "./ExtendedLabs";
import GuidedLab from "./GuidedLabs";
const statusNames = [
  "No estudiado",
  "Comprendiendo",
  "Puedo explicarlo",
  "Necesito repasar",
];
const levels = [
  "",
  "Fundamentos",
  "Intermedio",
  "Desafiante",
  "Avanzado",
  "Profundización",
];
const stages = [
  "Comprender",
  "Pensar",
  "Comparar",
  "Construir",
  "Laboratorio",
  "Complejidad",
  "Comprobar",
  "Exponer",
];
type Progress = {
  status: number;
  seconds: number;
  notes: string;
  answers: Record<string, string>;
  quiz: boolean;
};
type Saved = { theme: "light" | "dark"; problems: Record<string, Progress> };
const emptyProgress = (): Progress => ({
  status: 0,
  seconds: 0,
  notes: "",
  answers: {},
  quiz: false,
});
const initial: Saved = { theme: "light", problems: {} };
const key = "icpc-lab-v1";
export default function Lab() {
  const [saved, setSaved] = useState<Saved>(initial),
    [ready, setReady] = useState(false),
    [storageError, setStorageError] = useState(""),
    [id, setId] = useState<string | null>(null),
    [stage, setStage] = useState(0),
    [sort, setSort] = useState("Ruta sugerida"),
    [query, setQuery] = useState(""),
    [mobile, setMobile] = useState(false),
    [page, setPage] = useState("dashboard");
  useEffect(() => {
    try {
      const text = localStorage.getItem(key);
      if (text) {
        const data = JSON.parse(text);
        if (
          !data ||
          typeof data.problems !== "object" ||
          !data.problems ||
          Array.isArray(data.problems)
        )
          throw Error();
        const clean: Saved = {
          theme: data.theme === "dark" ? "dark" : "light",
          problems: {},
        };
        for (const p of problems) {
          const x = data.problems[p.id];
          if (x && typeof x === "object")
            clean.problems[p.id] = {
              status:
                Number.isInteger(x.status) && x.status >= 0 && x.status <= 3
                  ? x.status
                  : 0,
              seconds:
                Number.isFinite(x.seconds) && x.seconds >= 0 ? x.seconds : 0,
              notes: typeof x.notes === "string" ? x.notes : "",
              answers: Object.fromEntries(
                Object.entries(x.answers || {}).filter(
                  ([, v]) => typeof v === "string",
                ),
              ) as Record<string, string>,
              quiz: x.quiz === true,
            };
        }
        setSaved(clean);
      }
    } catch {
      setStorageError(
        "No se pudieron recuperar los datos locales. Puedes seguir estudiando y exportar tus apuntes.",
      );
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = saved.theme;
    try {
      localStorage.setItem(key, JSON.stringify(saved));
    } catch {
      setStorageError(
        "El navegador no permite guardar el progreso. Exporta tus apuntes antes de cerrar.",
      );
    }
  }, [saved, ready]);
  useEffect(() => {
    if (!id || !ready) return;
    let last = Date.now();
    const timer = setInterval(() => {
      const now = Date.now(),
        delta = Math.min(5, (now - last) / 1000);
      last = now;
      if (document.visibilityState === "visible" && document.hasFocus())
        setSaved((s) => {
          const p = s.problems[id] || emptyProgress();
          return {
            ...s,
            problems: {
              ...s.problems,
              [id]: { ...p, seconds: p.seconds + delta },
            },
          };
        });
    }, 5000);
    return () => clearInterval(timer);
  }, [id, ready]);
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".journey"),
      active = nav?.querySelector<HTMLElement>('[aria-current="step"]');
    if (nav && active) nav.scrollLeft = active.offsetLeft - nav.offsetLeft - 16;
  }, [id, stage]);
  function update(pid: string, patch: Partial<Progress>) {
    setSaved((s) => ({
      ...s,
      problems: {
        ...s.problems,
        [pid]: { ...(s.problems[pid] || emptyProgress()), ...patch },
      },
    }));
  }
  function open(pid: string, section = 0) {
    setId(pid);
    setStage(section);
    setPage("module");
    setMobile(false);
    window.scrollTo({ top: 0 });
  }
  function nav(next: string) {
    setPage(next);
    setId(null);
    setMobile(false);
  }
  function exportNotes() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(saved, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "icpc-mis-apuntes.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  const current = problems.find((p) => p.id === id),
    progress = current
      ? saved.problems[current.id] || emptyProgress()
      : emptyProgress();
  const explained = problems.filter(
      (p) => saved.problems[p.id]?.status === 2,
    ).length,
    studied = problems.filter(
      (p) => (saved.problems[p.id]?.seconds || 0) > 0,
    ).length;
  let ordered = problems.filter((p) =>
    `${p.id} ${p.name} ${p.tags.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  if (sort === "Dificultad")
    ordered = [...ordered].sort((a, b) => a.level - b.level);
  if (sort === "Tema")
    ordered = [...ordered].sort((a, b) => a.topic.localeCompare(b.topic));
  if (sort === "Progreso")
    ordered = [...ordered].sort(
      (a, b) =>
        (saved.problems[b.id]?.status || 0) -
        (saved.problems[a.id]?.status || 0),
    );
  return (
    <div className="app-shell" inert={!ready} data-ready={ready}>
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <button
          className="brand"
          onClick={() => nav("dashboard")}
          aria-label="Inicio de Algorithm Lab"
        >
          <span className="brand-mark">
            a<span>l</span>
          </span>
          <span>
            Algorithm<span className="brand-light">Lab</span>
            <small>ICPC · WORLD FINALS 2022</small>
          </span>
        </button>
        <div className="sidebar-label">TU ESPACIO DE ESTUDIO</div>
        <nav className="main-nav">
          <button
            className={page === "dashboard" ? "active" : ""}
            onClick={() => nav("dashboard")}
          >
            <LayoutDashboard size={18} />
            Vista general
          </button>
          <button
            className={page === "plan" ? "active" : ""}
            onClick={() => nav("plan")}
          >
            <BookOpen size={18} />
            Plan de seis días
          </button>
          <button
            className={page === "notes" ? "active" : ""}
            onClick={() => nav("notes")}
          >
            <NotebookPen size={18} />
            Mis apuntes{" "}
            <span>
              {problems.filter((p) => saved.problems[p.id]?.notes).length}
            </span>
          </button>
        </nav>
        <div className="sidebar-label">LOS 11 PROBLEMAS</div>
        <nav className="problem-nav">
          {problems.map((p) => (
            <button
              key={p.id}
              onClick={() => open(p.id)}
              className={id === p.id ? "active" : ""}
            >
              <span
                className={`mini-id ${["Y", "P", "W", "U", "Q"].includes(p.id) ? "available" : ""}`}
              >
                {p.id}
              </span>
              <span>{p.name}</span>
              {saved.problems[p.id]?.status === 2 ? (
                <Check size={14} />
              ) : (
                <i
                  className={`status-dot status-${saved.problems[p.id]?.status || 0}`}
                />
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="exam-label">
            <Mic size={17} />
            <strong>Una idea. Cinco minutos.</strong>
          </div>
          <p>
            Entender es poder explicarlo
            <br />
            con tus propias palabras.
          </p>
          <button onClick={() => nav("sources")}>
            Fuentes y verificación <ArrowUpRight size={14} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div>
            <button
              className="mobile-toggle icon-button"
              aria-label="Abrir navegación"
              onClick={() => setMobile((v) => !v)}
            >
              <Menu size={21} />
            </button>
            <span className="breadcrumb">
              Tu laboratorio <span>/</span>{" "}
              {current
                ? current.name
                : page === "plan"
                  ? "Plan de estudio"
                  : page === "notes"
                    ? "Apuntes"
                    : page === "sources"
                      ? "Fuentes"
                      : "Vista general"}
            </span>
          </div>
          <div className="top-actions">
            <span className="local-indicator">
              <i />{" "}
              {storageError
                ? "Guardado local no disponible"
                : ready
                  ? "Guardado en este dispositivo"
                  : "Cargando datos…"}
            </span>
            <button
              className="icon-button"
              aria-label={
                saved.theme === "light"
                  ? "Activar modo oscuro"
                  : "Activar modo claro"
              }
              onClick={() =>
                setSaved((s) => ({
                  ...s,
                  theme: s.theme === "light" ? "dark" : "light",
                }))
              }
            >
              {saved.theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>
        {storageError && (
          <p role="alert" className="error storage-warning">
            {storageError}
          </p>
        )}
        <main id="main-content">
          {page === "dashboard" && (
            <>
              <div className="page-kicker">
                <span className="tiny-line" /> DEL ENUNCIADO A LA INTUICIÓN
              </div>
              <div className="dashboard-heading">
                <div>
                  <h1>
                    No memorices la solución.
                    <br />
                    <em>Aprende a encontrarla.</em>
                  </h1>
                  <p>
                    Once problemas. Un espacio para experimentar, entender
                    <br className="desktop-break" /> y llegar a tu exposición
                    con algo más que una respuesta.
                  </p>
                </div>
                <div className="edition-stamp">
                  <span>46th</span>
                  <small>ICPC WORLD FINALS</small>
                  <strong>2022</strong>
                </div>
              </div>
              <div className="study-strip">
                <div>
                  <span className="strip-dot" />
                  <strong>{explained} de 11</strong>
                  <span>listos para explicar</span>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${(explained / 11) * 100}%` }} />
                </div>
                <div>
                  <Clock size={16} />
                  <strong>
                    {Math.floor(
                      Object.values(saved.problems).reduce(
                        (s, p) => s + p.seconds,
                        0,
                      ) / 60,
                    )}{" "}
                    min
                  </strong>
                  <span>de estudio</span>
                </div>
                <button onClick={() => nav("plan")}>
                  Tu ruta de 6 días <ArrowRight size={15} />
                </button>
              </div>
              <section className="featured">
                <div className="featured-copy">
                  <span className="eyebrow">
                    EMPIEZA POR UNA BUENA PREGUNTA
                  </span>
                  <div className="featured-title">
                    <span>Y</span>
                    <h2>
                      ¿Cuánto puedes quitar
                      <br />
                      sin perder lo esencial?
                    </h2>
                  </div>
                  <p>
                    Explora Compression. Reduce una cadena binaria
                    <br />y descubre las propiedades que nunca cambian.
                  </p>
                  <button className="primary" onClick={() => open("Y", 4)}>
                    Entrar al laboratorio <ArrowRight size={16} />
                  </button>
                  <small>35 min sugeridos · Invariantes y cadenas</small>
                </div>
                <div
                  className="featured-diagram"
                  aria-label="Ejemplo legal: 10110 se reduce a 1010 y luego a 10"
                >
                  <span className="diagram-note">
                    Un paso pequeño. Una propiedad grande.
                  </span>
                  <Bits value="10110" active={[2, 3]} />
                  <div className="reduction-arrow">
                    ↓ <span>11 → 1</span>
                  </div>
                  <Bits value="1010" />
                  <div className="reduction-arrow">
                    ↓ <span>10 · 10 → 10</span>
                  </div>
                  <Bits value="10" />
                  <span className="invariant-caption">
                    El primer y el último bit siguen ahí.
                  </span>
                </div>
              </section>
              <section className="catalog">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">TU MAPA DE APRENDIZAJE</span>
                    <h2>Once maneras de pensar.</h2>
                  </div>
                  <div className="catalog-tools">
                    <label className="search">
                      <Search size={15} />
                      <input
                        aria-label="Buscar problemas"
                        placeholder="Buscar problema o tema"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                    <label>
                      <span className="sr-only">Ordenar problemas</span>
                      <select
                        aria-label="Ordenar problemas"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                      >
                        {[
                          "Ruta sugerida",
                          "Dificultad",
                          "Tema",
                          "Progreso",
                        ].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <div className="problem-list">
                  <div className="list-heading">
                    <span>PROBLEMA / CONCEPTOS</span>
                    <span>NIVEL</span>
                    <span>TU PROGRESO</span>
                    <span>TIEMPO</span>
                    <span />
                  </div>
                  {ordered.map((p, i) => {
                    const s = saved.problems[p.id] || emptyProgress();
                    return (
                      <article className="problem-row" key={p.id}>
                        <button
                          className="problem-name"
                          onClick={() => open(p.id)}
                        >
                          <span
                            className={`problem-letter ${p.level <= 2 ? "green" : p.level >= 4 ? "clay" : ""}`}
                          >
                            {p.id}
                          </span>
                          <span>
                            <strong>{p.name}</strong>
                            <small>{p.tags.join(" · ")}</small>
                          </span>
                        </button>
                        <div className="difficulty">
                          <span
                            aria-label={`Dificultad ${p.level} de 5`}
                            className="difficulty-bars"
                          >
                            {[1, 2, 3, 4, 5].map((n) => (
                              <i
                                key={n}
                                className={n <= p.level ? "filled" : ""}
                              />
                            ))}
                          </span>
                          <small>{levels[p.level]}</small>
                        </div>
                        <div>
                          <span className={`status-label status-${s.status}`}>
                            {statusNames[s.status]}
                          </span>
                          {s.quiz && (
                            <small className="quiz-mark">
                              Ejercicio resuelto
                            </small>
                          )}
                        </div>
                        <div className="row-time">
                          <span>{Math.floor(s.seconds / 60)} min</span>
                          <small>
                            {["Y", "P", "W", "U", "Q"].includes(p.id)
                              ? "Laboratorio activo"
                              : "Recorrido explicado"}
                          </small>
                        </div>
                        <button
                          className="row-arrow icon-button"
                          aria-label={`Estudiar ${p.name}`}
                          onClick={() => open(p.id)}
                        >
                          <ArrowUpRight size={20} />
                        </button>
                      </article>
                    );
                  })}
                  {!ordered.length && (
                    <p>No hay problemas que coincidan con tu búsqueda.</p>
                  )}
                </div>
                <p className="catalog-footnote">
                  La dificultad es una estimación pedagógica. Y, P, W, U y Q
                  tienen laboratorios; los otros seis combinan recorridos
                  explicados y resultados de algoritmos. Consulta el alcance de
                  verificación de cada módulo.
                </p>
              </section>
              <div className="bottom-note">
                <FlaskConical size={20} />
                <p>
                  <strong>Primero una hipótesis. Después una prueba.</strong>
                  <br />
                  Equivocarte con un ejemplo pequeño también es avanzar.
                </p>
                <span>{studied} problemas explorados</span>
              </div>
            </>
          )}
          {page === "module" && current && (
            <>
              <button className="back-link" onClick={() => nav("dashboard")}>
                <ChevronLeft size={15} />
                Todos los problemas
              </button>
              <div className="module-heading">
                <div className="problem-letter large">{current.id}</div>
                <div>
                  <span className="eyebrow">
                    {current.topic} · {levels[current.level]}
                  </span>
                  <h1>{current.name}</h1>
                  <p>{current.tags.join(" / ")}</p>
                </div>
                <a
                  className="source-link"
                  href={statementURL(current.id)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Enunciado original <ArrowUpRight size={15} />
                </a>
              </div>
              <div className="module-meta">
                <label>
                  Mi estado{" "}
                  <select
                    aria-label="Mi estado"
                    value={progress.status}
                    onChange={(e) =>
                      update(current.id, { status: Number(e.target.value) })
                    }
                  >
                    {statusNames.map((s, i) => (
                      <option key={s} value={i}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
                <span>
                  <Clock size={15} />
                  {Math.floor(progress.seconds / 60)} min registrados
                </span>
                <span>{deepDives[current.id].status}</span>
              </div>
              <nav className="journey" aria-label="Etapas de estudio">
                {stages.map((s, i) => (
                  <button
                    key={s}
                    aria-current={stage === i ? "step" : undefined}
                    className={stage === i ? "active" : ""}
                    onClick={() => setStage(i)}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {s}
                  </button>
                ))}
              </nav>
              <div className="learning-layout">
                <section className="lesson" key={`${current.id}-${stage}`}>
                  <Lesson
                    problem={current}
                    stage={stage}
                    progress={progress}
                    update={(patch) => update(current.id, patch)}
                  />
                  <div className="lesson-navigation">
                    <button
                      disabled={stage === 0}
                      onClick={() => setStage((s) => s - 1)}
                    >
                      ← Anterior
                    </button>
                    <span>{stage + 1} / 8</span>
                    <button
                      className="primary"
                      disabled={stage === 7}
                      onClick={() => setStage((s) => s + 1)}
                    >
                      Siguiente <ArrowRight size={14} />
                    </button>
                  </div>
                </section>
                <aside className="study-notes">
                  <span className="eyebrow">
                    <NotebookPen size={15} /> TU CUADERNO
                  </span>
                  <h3>Escríbelo a tu manera.</h3>
                  <p>Una intuición, una duda, un contraejemplo.</p>
                  <label className="sr-only" htmlFor="notes">
                    Mis apuntes
                  </label>
                  <textarea
                    id="notes"
                    placeholder="Lo que entendí es…"
                    value={progress.notes}
                    onChange={(e) =>
                      update(current.id, { notes: e.target.value })
                    }
                  />
                  <small>
                    {ready ? "Guardado local automático" : "Cargando apuntes…"}
                  </small>
                  <div className="notes-divider" />
                  <h4>Para tu exposición</h4>
                  <p>¿Podrías explicar la idea sin leer código?</p>
                  <button onClick={() => setStage(7)}>
                    <Mic size={15} /> Practicar cinco minutos
                  </button>
                  <div className="notes-divider" />
                  <a
                    href={solutionURL(current.id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Bosquejo de referencia ↗
                  </a>
                  <a href={referencePDF} target="_blank" rel="noreferrer">
                    PDF de soluciones ↗
                  </a>
                  <small>
                    El HTML puede no estar disponible. Usa el PDF como
                    alternativa.
                  </small>
                </aside>
              </div>
            </>
          )}
          {page === "plan" && (
            <>
              <span className="eyebrow">UN RECORRIDO CON INTENCIÓN</span>
              <h1>
                Seis días para
                <br />
                <em>pensar en voz alta.</em>
              </h1>
              <p className="lede">
                Una propuesta adaptable: practica la explicación desde el primer
                día. El objetivo es detectar lagunas a tiempo, no tachar once
                títulos.
              </p>
              <div className="plan-list">
                {[
                  [
                    "Encontrar lo que no cambia",
                    "Y",
                    "Experimenta, formula los invariantes y demuestra que la cota se alcanza. Graba una explicación de cinco minutos.",
                  ],
                  [
                    "Construir y propagar",
                    "U,P",
                    "Revisa paridad en U. Dedica el bloque principal a luces, ecuaciones y componentes en P.",
                  ],
                  [
                    "Hacer que la información alcance",
                    "W,Q",
                    "Diseña consultas resistentes a una mentira. Después estudia esperanza y orden conjunto; distingue lo entendido de la fórmula pendiente.",
                  ],
                  [
                    "Cambiar la representación",
                    "T,V",
                    "Dibuja desarrollos planos y puntos de puntuaciones. Explica por qué una transformación conserva el objetivo.",
                  ],
                  [
                    "Compatibilidad y estructura",
                    "X,R",
                    "Estudia reparto inicial frente a ubicación actual y luego ciclos, puentes y paridad. Escribe qué pruebas avanzadas faltan.",
                  ],
                  [
                    "Cerrar lagunas y ensayar",
                    "S,Z",
                    "Estudia el modelo de DP y la reconstrucción modular a su nivel real. Termina con tres simulacros y preguntas de seguimiento.",
                  ],
                ].map(([title, ids, body], i) => (
                  <article key={title}>
                    <div className="day-number">0{i + 1}</div>
                    <div>
                      <span className="eyebrow">DÍA {i + 1}</span>
                      <h2>{title}</h2>
                      <p>{body}</p>
                      <div className="button-group">
                        {ids.split(",").map((pid) => (
                          <button key={pid} onClick={() => open(pid)}>
                            {pid} · {problems.find((p) => p.id === pid)?.name}
                            <ArrowUpRight size={14} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
          {page === "notes" && (
            <>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">TU PROPIO RAZONAMIENTO</span>
                  <h1>El cuaderno.</h1>
                </div>
                <button onClick={exportNotes}>
                  <Download size={16} />
                  Exportar datos
                </button>
              </div>
              <p>
                Los apuntes y respuestas se guardan en este navegador. Exporta
                una copia si vas a cambiar de dispositivo.
              </p>
              {problems.filter(
                (p) =>
                  saved.problems[p.id]?.notes ||
                  Object.values(saved.problems[p.id]?.answers || {}).some(
                    Boolean,
                  ),
              ).length === 0 ? (
                <div className="empty-state">
                  <NotebookPen size={32} />
                  <h2>Todavía no hay apuntes.</h2>
                  <p>
                    Abre un problema y guarda tu primera hipótesis. No necesita
                    ser correcta.
                  </p>
                  <button className="primary" onClick={() => open("Y", 1)}>
                    Pensar sobre Compression <ArrowRight size={15} />
                  </button>
                </div>
              ) : (
                problems.map((p) => {
                  const s = saved.problems[p.id];
                  return s &&
                    (s.notes || Object.values(s.answers).some(Boolean)) ? (
                    <article className="note-entry" key={p.id}>
                      <button onClick={() => open(p.id)}>
                        <span className="mini-id">{p.id}</span>
                        <h2>{p.name}</h2>
                        <ArrowUpRight size={18} />
                      </button>
                      <p className="pre-wrap">
                        {s.notes || "Sin nota general."}
                      </p>
                      {Object.entries(s.answers)
                        .filter(([, v]) => v)
                        .map(([q, a]) => (
                          <div key={q}>
                            <strong>{p.questions[Number(q)] || q}</strong>
                            <p className="pre-wrap">{a}</p>
                          </div>
                        ))}
                    </article>
                  ) : null;
                })
              )}
            </>
          )}
          {page === "sources" && (
            <>
              <span className="eyebrow">FUENTES Y LÍMITES</span>
              <h1>
                Entender qué
                <br />
                <em>está comprobado.</em>
              </h1>
              <p className="lede">
                Material redactado a partir del PDF de enunciados proporcionado,
                el concurso 105254 y los bosquejos de la 46th World Finals. Las
                demostraciones incompletas se señalan en cada ficha.
              </p>
              <div className="source-list">
                <a
                  href="https://codeforces.com/gym/105254"
                  target="_blank"
                  rel="noreferrer"
                >
                  Codeforces Gym · problemas P–Z <ArrowUpRight />
                </a>
                <a href={referencePDF} target="_blank" rel="noreferrer">
                  PDF de bosquejos de soluciones <ArrowUpRight />
                </a>
              </div>
              <p>
                El PDF de bosquejos es un análisis no oficial de Per Austrin,
                Arnav Sastry, Paul Wild y Jakub Onufry Wojtaszczyk. No sustituye
                pruebas completas. No se incorporó código de terceros.
              </p>
              {problems.map((p) => (
                <article className="verification" key={p.id}>
                  <h3>
                    {p.id} · {p.name}
                  </h3>
                  <p>{p.verified}</p>
                  {p.pending.length > 0 && (
                    <ul>
                      {p.pending.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  )}
                  <a href={statementURL(p.id)} target="_blank" rel="noreferrer">
                    Enunciado ↗
                  </a>{" "}
                  ·{" "}
                  <a href={solutionURL(p.id)} target="_blank" rel="noreferrer">
                    Bosquejo HTML ↗
                  </a>
                  <small>PDF aportado: páginas {p.pages}.</small>
                </article>
              ))}
            </>
          )}
        </main>
        <footer>
          Algorithm Lab <span>Construido para comprender.</span>
          <span>46th ICPC World Finals · 2022</span>
        </footer>
      </div>
    </div>
  );
}
function Lesson({
  problem: p,
  stage,
  progress,
  update,
}: {
  problem: Problem;
  stage: number;
  progress: Progress;
  update: (patch: Partial<Progress>) => void;
}) {
  const [hint, setHint] = useState(0),
    [choice, setChoice] = useState<number | null>(null),
    [checked, setChecked] = useState(false),
    [size, setSize] = useState(100);
  if (stage === 0)
    return (
      <>
        <span className="eyebrow">01 / COMPRENDER</span>
        <h2>¿Qué estamos intentando resolver?</h2>
        <p className="lede">{p.summary}</p>
        <div className="definition-grid">
          <div>
            <h3>Recibimos</h3>
            <p>{p.input}</p>
          </div>
          <div>
            <h3>Buscamos</h3>
            <p>{p.output}</p>
          </div>
        </div>
        <h3>Restricciones que importan</h3>
        <p className="notice">{p.limits}</p>
        <h3>Ejemplos oficiales</h3>
        <div className="examples">
          {p.examples.map((e, i) => (
            <details key={i} open={i === 0}>
              <summary>Ejemplo {i + 1}</summary>
              <div className="example-grid">
                <div>
                  <span className="eyebrow">Entrada / interacción</span>
                  <pre>{e.input}</pre>
                </div>
                <div>
                  <span className="eyebrow">Salida</span>
                  <pre>{e.output}</pre>
                </div>
              </div>
              {e.note && <p className="small">{e.note}</p>}
            </details>
          ))}
        </div>
        <p className="small">
          Fuente: PDF de enunciados, páginas {p.pages}. Los ejemplos
          modificables y recorridos explicados están en la etapa Laboratorio.
        </p>
      </>
    );
  if (stage === 1)
    return (
      <>
        <span className="eyebrow">02 / PENSAR ANTES DE PROGRAMAR</span>
        <h2>
          Una hipótesis vale más
          <br />
          que una respuesta prestada.
        </h2>
        <p>
          Resuelve primero una instancia pequeña. Escribe qué información
          conservarías y qué pasaría al duplicar el tamaño.
        </p>
        {p.questions.map((q, i) => (
          <label className="guided-question" key={q}>
            <span>
              <b>0{i + 1}</b>
              {q}
            </span>
            <textarea
              value={progress.answers[String(i)] || ""}
              onChange={(e) =>
                update({
                  answers: { ...progress.answers, [String(i)]: e.target.value },
                })
              }
              placeholder="Mi razonamiento…"
            />
          </label>
        ))}
        <div className="reveal">
          <h3>Una pista a la vez</h3>
          {p.hints.slice(0, hint).map((h, i) => (
            <p key={h}>
              <strong>{i + 1}.</strong> {h}
            </p>
          ))}
          <button
            disabled={hint === p.hints.length}
            onClick={() => setHint((h) => h + 1)}
          >
            {hint === p.hints.length
              ? "Todas las pistas abiertas"
              : "Necesito una pista"}
          </button>
        </div>
      </>
    );
  if (stage === 2)
    return (
      <>
        <span className="eyebrow">03 / COMPARAR ESTRATEGIAS</span>
        <h2>El coste de una idea.</h2>
        <p>
          Una estrategia lenta puede ser útil para comprobar otra. Distingue una
          herramienta de exploración de una solución para los límites del
          enunciado.
        </p>
        {p.strategies.map((s, i) => (
          <article className="strategy" key={s.name}>
            <span className="strategy-number">0{i + 1}</span>
            <div>
              <h3>{s.name}</h3>
              <span className="cost-tag">{s.cost}</span>
              <p>{s.description}</p>
            </div>
          </article>
        ))}
        <h3>Información y estructuras</h3>
        <ul>
          {p.variables.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
        <p className="notice">
          Elige la estructura por las operaciones que necesitas: acceso,
          actualización, recorrido o consulta. Su nombre no es una
          justificación.
        </p>
      </>
    );
  if (stage === 3)
    return (
      <>
        <span className="eyebrow">04 / CONSTRUIR LA SOLUCIÓN</span>
        <h2>De la intuición al algoritmo.</h2>
        <h3>Qué significa cada variable</h3>
        <ul>
          {p.variables.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
        <DeepLesson id={p.id} answers={progress.answers} onChange={(answers) => update({ answers })} />
        <h3>Casos que pueden romper una idea</h3>
        <ul>
          {p.edges.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
        {p.pending.length > 0 && (
          <details open>
            <summary>Pendientes de verificación</summary>
            <ul>
              {p.pending.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </details>
        )}
      </>
    );
  if (stage === 4)
    return p.id === "Y" ? (
      <CompressionLab />
    ) : p.id === "P" ? (
      <TurningRedLab />
    ) : p.id === "W" ? (
      <LiarLab />
    ) : p.id === "U" ? (
      <TrainLab />
    ) : p.id === "Q" ? (
      <QueueLab />
    ) : (
      <GuidedLab id={p.id} />
    );
  if (stage === 5)
    return (
      <>
        <span className="eyebrow">06 / COMPLEJIDAD</span>
        <h2>
          Cuenta operaciones,
          <br />
          no líneas de código.
        </h2>
        <div className="complexity-pair">
          <div>
            <span>TIEMPO</span>
            <strong>{p.time}</strong>
          </div>
          <div>
            <span>MEMORIA</span>
            <strong>{p.space}</strong>
          </div>
        </div>
        <h3>De dónde sale la cota</h3>
        <p>{p.derivation}</p>
        <h3>Un experimento de crecimiento</h3>
        <p className="small">
          Comparación matemática de órdenes de crecimiento. Son unidades
          abstractas, no tiempos medidos ni una afirmación de que todos estos
          algoritmos resuelvan el problema.
        </p>
        <label>
          Tamaño n: {size.toLocaleString("es")}
          <input
            type="range"
            aria-label="Tamaño para comparar complejidad"
            min={10}
            max={1000}
            step={10}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
        </label>
        <table className="complexity-table">
          <thead>
            <tr>
              <th>Expresión</th>
              <th>n = {size}</th>
              <th>n = {size * 2}</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["n", size, size * 2],
              [
                "n log₂ n",
                size * Math.log2(size),
                2 * size * Math.log2(2 * size),
              ],
              ["n²", size ** 2, (size * 2) ** 2],
            ].map(([name, a, b]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{Math.round(Number(a)).toLocaleString("es")}</td>
                <td>{Math.round(Number(b)).toLocaleString("es")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Identifica qué bucle, consulta o recorrido corresponde a cada factor
          de la cota de este problema.
        </p>
      </>
    );
  if (stage === 6)
    return (
      <>
        <span className="eyebrow">07 / DEMOSTRAR COMPRENSIÓN</span>
        <h2>Haz una predicción.</h2>
        <p className="lede">{p.exercise.question}</p>
        <fieldset className="quiz">
          <legend className="sr-only">Elige una respuesta</legend>
          {p.exercise.options.map((o, i) => (
            <label key={o} className={choice === i ? "chosen" : ""}>
              <input
                type="radio"
                name="quiz"
                checked={choice === i}
                onChange={() => {
                  setChoice(i);
                  setChecked(false);
                }}
              />
              <span>{String.fromCharCode(65 + i)}</span>
              {o}
            </label>
          ))}
        </fieldset>
        <button
          className="primary"
          disabled={choice === null}
          onClick={() => {
            setChecked(true);
            if (choice === p.exercise.answer) update({ quiz: true });
          }}
        >
          Comprobar razonamiento
        </button>
        {checked && (
          <div
            role="status"
            className={`feedback ${choice === p.exercise.answer ? "correct" : ""}`}
          >
            <h3>
              {choice === p.exercise.answer
                ? "La idea es correcta."
                : "Revisa la propiedad que estás usando."}
            </h3>
            <p>{p.exercise.feedback}</p>
          </div>
        )}
        <h3>Ahora justifícalo</h3>
        <label>
          Mi explicación
          <textarea
            value={progress.answers.justification || ""}
            onChange={(e) =>
              update({
                answers: { ...progress.answers, justification: e.target.value },
              })
            }
            placeholder="La respuesta tiene sentido porque…"
          />
        </label>
        <p className="small">
          Resolver un ejercicio no marca automáticamente que puedas explicar
          todo el problema. Esa evaluación la haces tú.
        </p>
        <Checkpoints
          id={p.id}
          answers={progress.answers}
          onChange={(answers) => update({ answers })}
        />
      </>
    );
  return <Oral problem={p} progress={progress} update={update} />;
}
function Oral({
  problem: p,
  progress,
  update,
}: {
  problem: Problem;
  progress: Progress;
  update: (patch: Partial<Progress>) => void;
}) {
  const [seconds, setSeconds] = useState(0),
    [running, setRunning] = useState(false),
    [hidden, setHidden] = useState(true);
  useEffect(() => {
    if (!running) return;
    const started = Date.now() - seconds * 1000;
    const t = setInterval(() => {
      const elapsed = Math.min(300, Math.floor((Date.now() - started) / 1000));
      setSeconds(elapsed);
      if (elapsed === 300) setRunning(false);
    }, 250);
    return () => clearInterval(t);
  }, [running]); // elapsed uses wall time, including a background tab
  const blocks = [45, 45, 105, 60, 45],
    names = [
      "Definición del problema",
      "Modelado",
      "Algoritmo",
      "Por qué funciona",
      "Complejidad y cierre",
    ];
  let end = 0;
  const active = blocks.findIndex((v) => {
    end += v;
    return seconds < end;
  });
  return (
    <>
      <span className="eyebrow">08 / PREPARAR LA EXPOSICIÓN</span>
      <h2>Ahora, con tus palabras.</h2>
      <p>
        Practica sin leer. El temporizador orienta el ritmo; la claridad importa
        más que llenar cada segundo.
      </p>
      <div className="oral-timer">
        <div>
          <span className="eyebrow">
            {seconds === 300 ? "PRÁCTICA TERMINADA" : names[active]}
          </span>
          <strong role="timer" aria-label="Tiempo restante">
            {Math.floor((300 - seconds) / 60)}:
            {String((300 - seconds) % 60).padStart(2, "0")}
          </strong>
        </div>
        <div className="button-group">
          <button
            className="primary"
            disabled={seconds === 300}
            onClick={() => setRunning((r) => !r)}
          >
            {running ? "Pausar" : "Iniciar práctica"}
          </button>
          <button
            onClick={() => {
              setRunning(false);
              setSeconds(0);
            }}
          >
            Reiniciar
          </button>
        </div>
      </div>
      <label className="toggle">
        <input
          type="checkbox"
          checked={hidden}
          onChange={(e) => setHidden(e.target.checked)}
        />
        Practicar sin mostrar el guion
      </label>
      <div className="oral-blocks">
        {blocks.map((duration, i) => (
          <div className={active === i ? "active" : ""} key={i}>
            <span>{duration} s</span>
            <div>
              <h3>{names[i]}</h3>
              {!hidden && <p>{p.oral[i]}</p>}
            </div>
          </div>
        ))}
      </div>
      <h3>El profesor podría preguntar…</h3>
      <Checkpoints
        id={p.id}
        answers={progress.answers}
        onChange={(answers) => update({ answers })}
      />
      <ul>
        {p.followups.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
      {p.pending.length > 0 && (
        <p className="notice">
          Este módulo contiene partes avanzadas pendientes. Usa el guion para
          detectar esas lagunas, no para afirmar una demostración que aún no
          puedes desarrollar.
        </p>
      )}
    </>
  );
}
