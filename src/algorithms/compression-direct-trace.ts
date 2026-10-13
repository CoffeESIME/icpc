import { compress, type CompressionSnapshot } from "./compression";
import { event, type TraceEvent } from "./trace";
/** Observe the production solver; never replay a separately implemented algorithm. */
export function compressionDirectTrace(input: string) {
  const events: TraceEvent<CompressionSnapshot>[] = [];
  let before: CompressionSnapshot = {
    line: "",
    first: "",
    last: "",
    different: false,
    i: 0,
    result: "",
  };
  compress(input, (after) => {
    event(events, before, after, {
      operation:
        after.line === "return result;"
          ? "Devolver la respuesta"
          : after.line.startsWith("if (")
            ? `Inspeccionar s[${after.i}] = ${input[after.i]}`
            : "Actualizar variables",
      explanation: after.line.startsWith("if (")
        ? `El bit ${input[after.i]} ${input[after.i] === after.first ? "coincide con" : "es distinto de"} ${after.first}. different conserva lo encontrado en todo el prefijo.`
        : after.result
          ? `La respuesta es ${after.result}; la entrada ${input} no ha cambiado.`
          : "Guardamos los extremos e iniciamos el barrido en el índice 1.",
      active: after.i < input.length ? [after.i] : [],
      pseudocode: -1,
      variables: {
        i: after.i,
        first: after.first,
        last: after.last,
        different: String(after.different),
        result: after.result || "vacío",
      },
      invariant:
        "different resume si apareció un bit distinto de first en el prefijo inspeccionado. s permanece intacta.",
      partial: after.result,
      source: { file: "compression", anchor: after.line, scope: after.line === "let different = false;" ? "block" : "instruction" },
    });
    before = after;
  });
  return events;
}
