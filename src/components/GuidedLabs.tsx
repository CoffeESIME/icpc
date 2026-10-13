"use client";
import { useMemo, useState } from "react";
import { deepDives } from "@/data/deep-dives";
import { event, type TraceEvent } from "@/algorithms/trace";
import {
  solveBridge,
  solveLevers,
  leverDistribution,
} from "@/algorithms/extended";
import { rotationClass } from "@/algorithms/rotations";
import {
  checkQuartets,
  type Action,
  type MatchingState,
} from "@/algorithms/quartets";
import { solveDice, solvePyramids } from "@/algorithms/geometry";
import TracePlayer from "./TracePlayer";
import {
  StateTable,
  GraphView,
  ModularView,
  MatchingView,
} from "./EducationalViews";
import { Verification } from "./DeepLesson";

function ManualWalk({ id }: { id: string }) {
  const d = deepDives[id];
  const events = useMemo(() => {
    const out: TraceEvent<{ state: string }>[] = [];
    let before = { state: d.example };
    d.walk.forEach((s, i) => {
      const after = { state: s.state };
      event(out, before, after, {
        operation: s.title,
        explanation: s.why,
        active: [],
        pseudocode: -1,
        variables: { etapa: i + 1 },
        invariant:
          "Recorrido razonado del caso concreto; no representa una ejecución general.",
        partial: s.state,
      });
      before = after;
    });
    return out;
  }, [d]);
  return (
    <>
      <h3>Reproducir el caso a mano</h3>
      <p className="small">
        Pasos matemáticos revisados del ejemplo. Las tablas de ejecución de
        arriba proceden de los solucionadores; este recorrido explica las
        decisiones.
      </p>
      <TracePlayer
        events={events}
        code={d.code.map((c) => c.line)}
        render={(s) => <p className="state-text">{s.state}</p>}
      />
    </>
  );
}
function BridgeWalk() {
  const [input, setInput] = useState("1 2 5 10"),
    [c, setC] = useState(2),
    [config, setConfig] = useState({ times: [1, 2, 5, 10], c: 2 }),
    [error, setError] = useState("");
  const result = useMemo(
    () => solveBridge(config.times, config.c, true),
    [config],
  );
  const events = useMemo(() => {
    const out: TraceEvent<{ rows: (string | number)[][] }>[] = [];
    let state = { rows: [] as (string | number)[][] };
    result.cells.forEach((cell) => {
      const next = {
        rows: [
          ...state.rows,
          [
            cell.n,
            cell.e,
            Number.isFinite(cell.value) ? cell.value : "∞",
            cell.i < 0 ? "base" : cell.i,
          ],
        ],
      };
      event(out, state, next, {
        operation: `F(${cell.n},${cell.e})`,
        explanation:
          cell.i < 0
            ? "Todos cruzan una vez; el coste es el tiempo mayor."
            : `El mínimo se obtiene con i=${cell.i}; se pagan t[n]+P[i] y el subproblema menor. Consulta la recurrencia completa en Construir.`,
        active: [next.rows.length - 1],
        pseudocode: cell.i < 0 ? 2 : cell.n <= config.c ? 3 : 4,
        variables: { n: cell.n, e: cell.e, coste: cell.value },
        invariant:
          "Los valores consultados pertenecen a estados anteriores en orden (n,e).",
        partial: String(cell.value),
      });
      state = next;
    });
    return out;
  }, [result, config]);
  return (
    <>
      <form
        className="lab-form"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            const times = input
              .trim()
              .split(/[\s,]+/)
              .map(Number);
            if (times.length > 8)
              throw Error("La tabla didáctica admite de2 a8 personas.");
            solveBridge(times, c);
            setConfig({ times, c });
            setError("");
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      >
        <label>
          Tiempos de cruce
          <input value={input} onChange={(e) => setInput(e.target.value)} />
        </label>
        <label>
          Capacidad
          <input
            type="number"
            min="2"
            max="8"
            value={c}
            onChange={(e) =>
              setC(Math.max(2, Math.min(8, Math.floor(Number(e.target.value)))))
            }
          />
        </label>
        <button className="primary">Construir tabla DP</button>
      </form>
      {error && <p role="alert">{error}</p>}
      <p className="result-banner">
        Tiempo mínimo: <strong>{result.answer}</strong>
      </p>
      <TracePlayer
        events={events}
        code={deepDives.S.code.map((c) => c.line)}
        render={(s, active) => (
          <StateTable
            caption="Tabla DP · cada fila es un estado, e es deuda contable"
            columns={["n", "e", "F(n,e)", "i elegido"]}
            rows={s.rows}
            active={active}
          />
        )}
      />
    </>
  );
}
const zooEdges = [
  [0, 1],
  [1, 2],
  [2, 0],
  [0, 3],
  [3, 4],
  [4, 0],
];
function ZooWalk() {
  const [sequence, setSequence] = useState<number[]>([0]),
    [odd, setOdd] = useState(false);
  const result = useMemo(() => {
    let state = { labels: [0, 1, 2, 3, 4] };
    const events: TraceEvent<typeof state>[] = [];
    sequence.forEach((c) => {
      const cycle = c === 0 ? [0, 1, 2] : [0, 3, 4],
        labels = [...state.labels];
      cycle.forEach((v, i) => (labels[cycle[(i + 1) % 3]] = state.labels[v]));
      const next = { labels };
      event(events, state, next, {
        operation: `Rotar triángulo ${c + 1}`,
        explanation:
          "Cada animal avanza a la siguiente celda del ciclo. Tres animales se mueven simultáneamente; la permutación es par.",
        active: cycle,
        pseudocode: 0,
        variables: { ciclo: cycle.join("→") },
        invariant:
          "Las etiquetas permanecen en la componente y la paridad sigue siendo par.",
        partial: labels.join(","),
      });
      state = next;
    });
    return { events, state };
  }, [sequence]);
  const target = odd ? [0, 2, 1, 3, 4] : result.state.labels,
    classification = rotationClass(5, zooEdges, [0, 1, 2, 3, 4], target);
  return (
    <>
      <p>
        Grafo pequeño: dos triángulos unidos en v0. Cada botón añade una
        rotación real al recorrido.
      </p>
      <div className="button-group">
        <button
          disabled={sequence.length >= 16}
          onClick={() => setSequence([...sequence, 0])}
        >
          Rotar 0→1→2
        </button>
        <button
          disabled={sequence.length >= 16}
          onClick={() => setSequence([...sequence, 1])}
        >
          Rotar 0→3→4
        </button>
        <button onClick={() => setSequence([0])}>Restablecer ciclos</button>
      </div>
      <TracePlayer
        events={result.events}
        code={["rotar simultáneamente las etiquetas de un ciclo"]}
        render={(s, a) => (
          <GraphView
            labels={s.labels.map(String)}
            edges={zooEdges}
            active={a}
          />
        )}
      />
      <label className="toggle">
        <input
          type="checkbox"
          checked={odd}
          onChange={(e) => setOdd(e.target.checked)}
        />{" "}
        Comparar con objetivo que intercambia solo1 y2
      </label>
      <p className="result-banner">
        Objetivo [{target.join(", ")}]:{" "}
        <strong>{classification.possible ? "posible" : "imposible"}</strong> ·{" "}
        {classification.results[0].kind}
      </p>
    </>
  );
}
const quartetExample: Action[] = [
  { kind: "ask", player: 0, from: 1, card: 10, yes: false },
  { kind: "ask", player: 1, from: 2, card: 8, yes: true },
  { kind: "ask", player: 1, from: 3, card: 11, yes: true },
  { kind: "ask", player: 1, from: 0, card: 10, yes: false },
];
function QuartetState({ s }: { s: MatchingState }) {
  const slots = s.slots.filter((slot) => slot.suit === 2),
    cards = [8, 9, 10, 11];
  return (
    <>
      <MatchingView
        left={slots.map((o) => `J${o.player + 1}: conjunto3`)}
        right={["3A", "3B", "3C", "3D"]}
        edges={slots.flatMap((o, i) => o.candidates.map((c) => [i, c - 8]))}
        matching={slots.map((o) => {
          const index = s.slots.indexOf(o);
          return s.matching[index] >= 0 ? s.matching[index] - 8 : -1;
        })}
      />
      <StateTable
        caption="Cartas del conjunto3 · vista filtrada del matching global de32 cartas"
        columns={["Carta", "Dueño inicial", "Dueño actual"]}
        rows={cards.map((c) => [
          `3${"ABCD"[c - 8]}`,
          s.fixed[c] < 0
            ? s.domains[c].map((p) => p + 1).join(" / ")
            : s.fixed[c] + 1,
          s.owners[c] < 0 ? "desconocido" : s.owners[c] + 1,
        ])}
      />
      <p>{s.reason}</p>
    </>
  );
}
function QuartetWalk() {
  const [alternate, setAlternate] = useState(false);
  const result = useMemo(() => {
    const actions = quartetExample.map((a) => ({ ...a }));
    if (alternate) (actions[3] as Extract<Action, { kind: "ask" }>).card = 9;
    return checkQuartets(actions);
  }, [alternate]);
  const events = useMemo(() => {
    const out: TraceEvent<MatchingState>[] = [];
    let previous = checkQuartets([
      { kind: "ask", player: 0, from: 1, card: 10, yes: false },
    ]).history[0];
    result.history.forEach((s, i) => {
      if (i === 0)
        previous = {
          ...s,
          obligations: [],
          slots: [],
          matching: [],
          fixed: Array(32).fill(-1),
          owners: Array(32).fill(-1),
          domains: Array.from({ length: 32 }, () => [0, 1, 2, 3]),
          reason: "Sin observaciones todavía.",
          possible: true,
        };
      event(out, previous, s, {
        operation: `Acción ${i + 1}`,
        explanation:
          i === 3 && alternate
            ? "Se niega 3B, no 3C: J1 aún puede haber tenido3C y J2 haber tenido3B."
            : deepDives.X.walk[i].why,
        active: [],
        pseudocode: i === 3 ? 6 : i === 0 ? 1 : 3,
        variables: {
          obligaciones: s.obligations.length,
          asignadas: s.matching.filter((c) => c >= 0).length,
          huecos: s.slots.length,
        },
        invariant:
          "La prueba de matching se hace sobre todas las cartas, aunque el dibujo filtre el conjunto3.",
        partial: s.possible ? "compatible" : "contradicción",
      });
      previous = s;
    });
    return out;
  }, [result, alternate]);
  return (
    <>
      <label className="toggle">
        <input
          type="checkbox"
          checked={alternate}
          onChange={(e) => setAlternate(e.target.checked)}
        />{" "}
        Cambiar última pregunta de3C a3B (contrastar una historia compatible)
      </label>
      <p className="result-banner">
        {result.possible
          ? "Existe un reparto compatible"
          : `Primera contradicción: acción ${result.firstFailure}`}
      </p>
      <TracePlayer
        events={events}
        code={deepDives.X.code.map((c) => c.line)}
        render={(s) => <QuartetState s={s} />}
      />
    </>
  );
}
function LeverWalk() {
  const [input, setInput] = useState("0,0; 0,0; 2,0"),
    [levers, setLevers] = useState([
      [0, 0],
      [0, 0],
      [2, 0],
    ]),
    [error, setError] = useState("");
  const k = levers[0].length,
    result = useMemo(() => {
      const { counts } = leverDistribution(levers, levers[0].length);
      return { counts, ...solveLevers(counts, levers[0].length) };
    }, [levers]);
  const events = useMemo(() => {
    type State = {
      title: string;
      columns: string[];
      rows: (string | number)[][];
    };
    const states: State[] = [
      {
        title: "Distribución recibida",
        columns: ["Índice base3", "Conteo"],
        rows: result.counts.map((v, i) => [
          i.toString(3).padStart(k, "0").split("").reverse().join(","),
          v,
        ]),
      },
      {
        title: "Proyecciones y valoración",
        columns: ["x", "A₀", "A₁", "A₂", "f"],
        rows: result.projections.map((p) => [p.x.join(","), ...p.row, p.f]),
      },
      {
        title: "Líneas y multiplicidades",
        columns: ["Representante", "Copias no nulas"],
        rows: [
          ["vector cero", result.zeros],
          ...result.lines.map((l) => [l.u.join(","), l.count]),
        ],
      },
      {
        title: "DP con signos provisionales",
        columns: ["Capa", "Conteos"],
        rows: result.layers.map((r, i) => [i, r.join(", ")]),
      },
      {
        title: `Traslación v=(${result.shift.join(",")})`,
        columns: ["Palanca", "Vector recuperado", "Invertida"],
        rows: result.answer.map((u, i) => [
          i + 1,
          u.join(","),
          result.flipped.includes(i) ? "sí" : "no",
        ]),
      },
    ];
    const out: TraceEvent<State>[] = [];
    states.forEach((s, i) =>
      event(
        out,
        i
          ? states[i - 1]
          : {
              title: "Inicio",
              columns: ["Estado"],
              rows: [["Reconstrucción a partir de conteos"]],
            },
        s,
        {
          operation: s.title,
          explanation: [
            "El algoritmo solo recibe el multiconjunto, no las palancas configuradas.",
            "Agrupar por producto escalar y extraer factores de2.",
            "Aplicar la fórmula de masa en subespacios perpendiculares.",
            "Cada capa cuenta subconjuntos con o sin una palanca.",
            "La distribución regenerada debe coincidir en todas las celdas.",
          ][i],
          active: [],
          pseudocode: [0, 0, 2, 3, 5][i],
          variables: { k, n: levers.length },
          invariant:
            "Las cuentas son enteras; las coordenadas se operan módulo3.",
          partial: s.title,
        },
      ),
    );
    return out;
  }, [result, k, levers]);
  return (
    <>
      <form
        className="lab-form"
        onSubmit={(e) => {
          e.preventDefault();
          try {
            const u = input.split(";").map((r) =>
              r
                .trim()
                .split(/[\s,]+/)
                .map(Number),
            );
            if (
              !u.length ||
              u.length > 8 ||
              u[0].length < 1 ||
              u[0].length > 2 ||
              u.some(
                (r) =>
                  r.length !== u[0].length ||
                  r.some((x) => !Number.isInteger(x) || x < 0 || x > 2),
              )
            )
              throw Error(
                "Usa de1 a8 vectores de1 o2 coordenadas 0,1,2; separa vectores con ;",
              );
            setLevers(u);
            setError("");
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      >
        <label>
          Palancas para generar un caso válido
          <input value={input} onChange={(e) => setInput(e.target.value)} />
        </label>
        <button className="primary">Reconstruir desde conteos</button>
      </form>
      {error && <p role="alert">{error}</p>}
      <p>
        El generador conoce estas palancas; la reconstrucción recibe únicamente
        sus conteos. Puede devolver otra solución equivalente.
      </p>
      <ModularView a={1} b={2} />
      <TracePlayer
        events={events}
        code={deepDives.Z.code.map((c) => c.line)}
        render={(s) => (
          <StateTable caption={s.title} columns={s.columns} rows={s.rows} />
        )}
      />
    </>
  );
}
function DiceWalk() {
  const r = useMemo(() => solveDice([1, 1, 6, 6, 8, 8], [2, 4, 9]), []);
  return (
    <>
      <p className="result-banner">
        Óptimos calculados: {r.minimum.toFixed(9)} y {r.maximum.toFixed(9)}
      </p>
      <StateTable
        caption="Clases de caras y envolvente · x contra D₁ ganador, y contra D₂"
        columns={["v", "x", "y", "En hull"]}
        rows={r.points.map((p) => [
          p.v,
          p.x.toFixed(6),
          p.y.toFixed(6),
          r.hull.some((q) => q.v === p.v) ? "sí" : "no",
        ])}
      />
      <svg
        className="hull-view"
        viewBox="0 0 340 320"
        role="img"
        aria-label="Envolvente convexa de las puntuaciones; cortes x igual a un medio e y igual a un medio"
      >
        <title>Mezclas realizables y fronteras</title>
        <path
          d={`M ${r.hull.map((p) => `${30 + 280 * p.x},${290 - 260 * p.y}`).join(" L ")} Z`}
        />
        <line x1="170" x2="170" y1="25" y2="290" />
        <line x1="30" x2="310" y1="160" y2="160" />
        {r.points.map((p) => (
          <g key={p.v}>
            <circle cx={30 + 280 * p.x} cy={290 - 260 * p.y} r="4" />
            <text x={35 + 280 * p.x} y={284 - 260 * p.y}>
              {p.v}
            </text>
          </g>
        ))}
        <text x="245" y="315">
          x: score(D₃,D₁)
        </text>
        <text x="3" y="15">
          y: score(D₃,D₂)
        </text>
      </svg>
    </>
  );
}
function PyramidWalk() {
  const r = useMemo(() => solvePyramids([0, 0, 2, 0, 1], [4, 0, 6, 0, 1]), []);
  return (
    <>
      <p className="result-banner">
        Resultado numérico: {r.answer.toFixed(12)} · exacto: 2+2√2
      </p>
      <StateTable
        caption="16 pares evaluados · ordenados por distancia, índices de aristas desde0"
        columns={["Arista A", "Arista B", "t", "u", "Distancia"]}
        rows={r.candidates.map((c) => [
          c.i,
          c.j,
          c.t.toFixed(4),
          c.u.toFixed(4),
          c.distance.toFixed(8),
        ])}
      />
      <p>
        Las filas son resultados reales de la minimización convexa. El recorrido
        siguiente desarrolla el caso simétrico a mano.
      </p>
    </>
  );
}
export default function GuidedLab({ id }: { id: string }) {
  return (
    <>
      <span className="eyebrow">05 / RECORRIDO EXPLICADO</span>
      <h2>Ver el estado, defender la decisión.</h2>
      <Verification id={id} />
      {id === "S" ? (
        <BridgeWalk />
      ) : id === "R" ? (
        <ZooWalk />
      ) : id === "X" ? (
        <QuartetWalk />
      ) : id === "Z" ? (
        <LeverWalk />
      ) : id === "V" ? (
        <DiceWalk />
      ) : (
        <PyramidWalk />
      )}
      <ManualWalk id={id} />
    </>
  );
}
