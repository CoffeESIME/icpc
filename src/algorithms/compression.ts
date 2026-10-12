import { event, type TraceEvent } from "./trace";
export type Reduction = { start: number; length: number };
export function validateBinary(s: string) {
  if (!/^[01]+$/.test(s))
    throw new Error("Escribe una cadena no vacía de ceros y unos.");
}
export function compress(s: string): string {
  validateBinary(s);
  if (!s.includes(s[0] === "0" ? "1" : "0")) return s[0];
  return s[0] !== s[s.length - 1]
    ? s[0] + s[s.length - 1]
    : s[0] + (s[0] === "0" ? "1" : "0") + s[0];
}
export function reductions(s: string): Reduction[] {
  validateBinary(s);
  const result: Reduction[] = [];
  for (let start = 0; start < s.length; start++)
    for (let length = 1; start + 2 * length <= s.length; length++)
      if (
        s.slice(start, start + length) ===
        s.slice(start + length, start + 2 * length)
      )
        result.push({ start, length });
  return result;
}
export function reduce(s: string, r: Reduction): string {
  if (
    !Number.isInteger(r.start) ||
    !Number.isInteger(r.length) ||
    r.start < 0 ||
    r.length < 1 ||
    r.start + 2 * r.length > s.length ||
    s.slice(r.start, r.start + r.length) !==
      s.slice(r.start + r.length, r.start + 2 * r.length)
  )
    throw new Error(
      "La operación requiere dos bloques consecutivos idénticos.",
    );
  return s.slice(0, r.start + r.length) + s.slice(r.start + 2 * r.length);
}
export function compressionTrace(input: string): TraceEvent<string>[] {
  validateBinary(input);
  const events: TraceEvent<string>[] = [];
  let s = input;
  const emit = (
    next: string,
    operation: string,
    explanation: string,
    active: number[],
    line: number,
  ) => {
    event(events, s, next, {
      operation,
      explanation,
      active,
      pseudocode: line,
      variables: {
        longitud: next.length,
        primero: next[0],
        último: next[next.length - 1],
      },
      invariant:
        "Se conservan el primer bit, el último y el conjunto de símbolos.",
      partial: next,
    });
    s = next;
  };
  emit(s, "Leer la cadena", "Todavía no se ha eliminado ningún bloque.", [], 0);
  for (let i = 0; i + 1 < s.length;) {
    if (s[i] === s[i + 1]) {
      emit(
        reduce(s, { start: i, length: 1 }),
        "Colapsar un par igual",
        `Los bits ${i + 1} y ${i + 2} son copias del mismo bloque. XX → X.`,
        [i, i + 1],
        1,
      );
    } else i++;
  }
  while (s.length >= 4)
    emit(
      reduce(s, { start: 0, length: 2 }),
      "Reducir el prefijo alternante",
      `El prefijo ${s.slice(0, 4)} contiene dos copias de ${s.slice(0, 2)}.`,
      [0, 1, 2, 3],
      2,
    );
  emit(
    s,
    "Cota alcanzada",
    "La longitud coincide con la cota impuesta por extremos y símbolos presentes.",
    [],
    3,
  );
  return events;
}
export const compressionPseudocode = [
  "leer cadena binaria",
  "mientras haya bits adyacentes iguales: XX → X, |X|=1",
  "mientras longitud ≥ 4: reducir prefijo XX, |X|=2",
  "devolver cadena mínima",
];
