import { event, type TraceEvent } from "./trace";
export type Lights = { colors: number[]; buttons: number[][] };
export type RedState = {
  values: (number | null)[];
  root: number | null;
  trial: number | null;
  cost: number;
  valid: boolean | null;
  done: boolean;
};
export type RedResult = {
  cost: number | null;
  presses: number[] | null;
  trace: TraceEvent<RedState>[];
};
export const mod = (v: number) => ((v % 3) + 3) % 3;
export function validateLights(input: Lights) {
  if (
    !input.colors.length ||
    input.colors.some((c) => !Number.isInteger(c) || c < 0 || c > 2)
  )
    throw new Error("Cada luz debe tener color R, G o B.");
  const counts = Array(input.colors.length).fill(0);
  for (const b of input.buttons) {
    if (b.length === 0)
      throw new Error("Cada botón debe controlar al menos una luz.");
    const seen = new Set<number>();
    for (const l of b) {
      if (!Number.isInteger(l) || l < 0 || l >= counts.length || seen.has(l))
        throw new Error("Conexión inválida o repetida.");
      seen.add(l);
      if (++counts[l] > 2)
        throw new Error("Una luz no puede tener más de dos botones.");
    }
  }
}
export function parseLights(raw: string): Lights {
  const tokens = raw.trim().split(/\s+/);
  let p = 0;
  const l = Number(tokens[p++]),
    b = Number(tokens[p++]);
  if (
    !Number.isInteger(l) ||
    l < 1 ||
    l > 200000 ||
    !Number.isInteger(b) ||
    b < 0 ||
    b > 2 * l
  )
    throw new Error("Dimensiones inválidas.");
  const text = tokens[p++] || "";
  if (text.length !== l || !/^[RGB]+$/.test(text))
    throw new Error("La cadena de colores debe tener l caracteres R, G o B.");
  const buttons: number[][] = [];
  for (let i = 0; i < b; i++) {
    const k = Number(tokens[p++]);
    if (!Number.isInteger(k) || k < 1 || k > l)
      throw new Error("Cantidad de conexiones inválida.");
    const lights: number[] = [];
    for (let j = 0; j < k; j++) lights.push(Number(tokens[p++]) - 1);
    buttons.push(lights);
  }
  if (p !== tokens.length) throw new Error("Faltan datos o sobran valores.");
  const result = { colors: [...text].map((c) => "RGB".indexOf(c)), buttons };
  validateLights(result);
  return result;
}
export function owners(input: Lights) {
  const result: number[][] = input.colors.map(() => []);
  input.buttons.forEach((list, b) => list.forEach((l) => result[l].push(b)));
  return result;
}
export function press(input: Lights, b: number, colors = input.colors) {
  return colors.map((c, l) => (input.buttons[b].includes(l) ? mod(c + 1) : c));
}
export function solveRed(input: Lights, withTrace = false): RedResult {
  validateLights(input);
  const { colors, buttons } = input,
    n = buttons.length,
    own = owners(input);
  const adj: { to: number; color: number; light: number }[][] = Array.from(
    { length: n },
    () => [],
  );
  const trace: TraceEvent<RedState>[] = [];
  let current: RedState = {
    values: Array(n).fill(null),
    root: null,
    trial: null,
    cost: 0,
    valid: null,
    done: false,
  };
  const emit = (
    patch: Partial<RedState>,
    operation: string,
    explanation: string,
    active: number[],
    line: number,
  ) => {
    if (!withTrace) return;
    const after = { ...current, ...patch };
    event(trace, current, after, {
      operation,
      explanation,
      active,
      pseudocode: line,
      variables: {
        raíz: after.root === null ? "—" : after.root + 1,
        intento: after.trial ?? "—",
        coste: after.cost,
      },
      invariant:
        "Cada luz comprobada exige (color + suma de pulsaciones) mod 3 = 0.",
      partial:
        after.valid === false ? "Intento incompatible" : String(after.cost),
      source: {
        file: "turning-red",
        anchor: (
          {
            "Preparar restricciones":
              "const adj: { to: number; color: number; light: number }[][] = Array.from(",
            "Luz sin control": "if (own[l].length === 0 && colors[l] !== 0) {",
            "Fijar raíz": "values[root] = trial;",
            Propagar: "const forced = mod(-e.color - values[u]);",
            Contradicción: "} else if (values[e.to] !== forced) {",
            "Restricción incumplida": "if (mod(sum) !== 0) {",
            "Intento válido":
              "const cost = component.reduce((s, u) => s + values[u], 0);",
            "Elegir mínimo de componente": "component.forEach((u, i) => {",
            Imposible: "if (best === Infinity) {",
            "Solución mínima":
              "return { cost: total, presses: answer, trace };",
          } as Record<string, string>
        )[operation],
        scope: "block",
      },
    });
    current = after;
  };
  emit(
    {},
    "Preparar restricciones",
    "R=0, G=1, B=2. Cada variable toma un valor de 0 a 2.",
    [],
    0,
  );
  for (let l = 0; l < colors.length; l++) {
    if (own[l].length === 0 && colors[l] !== 0) {
      emit(
        { valid: false, done: true },
        "Luz sin control",
        `L${l + 1} no es roja y ningún botón puede cambiarla.`,
        [],
        0,
      );
      return { cost: null, presses: null, trace };
    }
    if (own[l].length === 2) {
      const [a, b] = own[l];
      adj[a].push({ to: b, color: colors[l], light: l });
      adj[b].push({ to: a, color: colors[l], light: l });
    }
  }
  const visited = Array(n).fill(false),
    answer = Array(n).fill(0),
    values: number[] = Array(n).fill(-1);
  let total = 0;
  for (let root = 0; root < n; root++) {
    if (visited[root]) continue;
    const component: number[] = [],
      stack = [root],
      lights = new Set<number>();
    visited[root] = true;
    while (stack.length) {
      const u = stack.pop()!;
      component.push(u);
      buttons[u].forEach((l) => lights.add(l));
      for (const e of adj[u])
        if (!visited[e.to]) {
          visited[e.to] = true;
          stack.push(e.to);
        }
    }
    let best = Infinity,
      bestValues: number[] = [];
    for (let trial = 0; trial < 3; trial++) {
      component.forEach((u) => (values[u] = -1));
      values[root] = trial;
      const todo = [root];
      let valid = true;
      const snapshot = () =>
        answer.map((v, u) =>
          visited[u] ? (values[u] < 0 ? null : values[u]) : null,
        );
      if (withTrace)
        emit(
          {
            values: snapshot(),
            root,
            trial,
            cost: 0,
            valid: null,
            done: false,
          },
          "Fijar raíz",
          `Probamos x${root + 1} = ${trial}. Es una de las tres posibilidades de esta componente.`,
          [root],
          2,
        );
      while (todo.length && valid) {
        const u = todo.pop()!;
        for (const e of adj[u]) {
          // color + x_u + x_v ≡ 0 (mod 3): fijar x_u determina x_v.
          const forced = mod(-e.color - values[u]);
          if (values[e.to] === -1) {
            values[e.to] = forced;
            todo.push(e.to);
            if (withTrace)
              emit(
                { values: snapshot() },
                "Propagar",
                `L${e.light + 1}: x${e.to + 1} = (−${e.color}−${values[u]}) mod 3 = ${forced}.`,
                [u, e.to],
                3,
              );
          } else if (values[e.to] !== forced) {
            valid = false;
            emit(
              { valid: false },
              "Contradicción",
              `L${e.light + 1} exige x${e.to + 1}=${forced}, pero ya vale ${values[e.to]}.`,
              [u, e.to],
              4,
            );
            break;
          }
        }
      }
      if (valid)
        for (const l of lights) {
          const sum = colors[l] + own[l].reduce((s, b) => s + values[b], 0);
          if (mod(sum) !== 0) {
            valid = false;
            emit(
              { valid: false },
              "Restricción incumplida",
              `L${l + 1} no quedaría roja. Incluimos las luces de un único botón.`,
              own[l],
              4,
            );
            break;
          }
        }
      if (valid) {
        const cost = component.reduce((s, u) => s + values[u], 0);
        emit(
          { cost, valid: true },
          "Intento válido",
          `Todas las luces de la componente son rojas con ${cost} pulsaciones.`,
          component,
          5,
        );
        if (cost < best) {
          best = cost;
          bestValues = component.map((u) => values[u]);
        }
      }
    }
    if (best === Infinity) {
      emit(
        { done: true, valid: false },
        "Imposible",
        "Ninguno de los tres valores de raíz satisface esta componente.",
        component,
        6,
      );
      return { cost: null, presses: null, trace };
    }
    component.forEach((u, i) => {
      answer[u] = bestValues[i];
      values[u] = bestValues[i];
    });
    total += best;
    if (withTrace)
      emit(
        {
          values: answer.map((v, u) => (visited[u] ? v : null)),
          cost: total,
          valid: true,
        },
        "Elegir mínimo de componente",
        `Se conserva el menor coste válido: ${best}. Acumulado: ${total}.`,
        component,
        5,
      );
  }
  emit(
    { values: [...answer], cost: total, valid: true, done: true },
    "Solución mínima",
    `Las componentes son independientes. Coste total mínimo: ${total}.`,
    [],
    6,
  );
  return { cost: total, presses: answer, trace };
}
export const redPseudocode = [
  "validar luces sin botones; construir restricciones",
  "separar componentes conexas",
  "para raíz = 0, 1, 2: iniciar intento",
  "propagar xⱼ = (−c − xᵢ) mod 3",
  "comprobar conflictos y luces de un botón",
  "guardar mínimo válido de la componente",
  "sumar mínimos o devolver impossible",
];
