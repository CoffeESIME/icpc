import catalog from "@/data/code-catalog.json";
export const sources = catalog as Record<
  string,
  {
    path: string;
    code: string;
    declarations: { name: string; start: number; end: number }[];
  }
>;
export function sourceLine(file: string, anchor: string) {
  return (
    sources[file].code
      .split("\n")
      .findIndex((l) => l.trim() === anchor.trim()) + 1 ||
    sources[file].code.split("\n").findIndex((l) => l.includes(anchor)) + 1
  );
}
export function SourceCode({
  file,
  start = 1,
  end,
  active,
}: {
  file: string;
  start?: number;
  end?: number;
  active?: number;
}) {
  const lines = sources[file].code.split("\n");
  return (
    <pre
      className="source-code"
      tabIndex={0}
      aria-label={`Código de ${sources[file].path}`}
    >
      <code>
        {lines.slice(start - 1, end).map((line, i) => (
          <span
            key={i}
            className={start + i === active ? "source-active" : ""}
            aria-current={start + i === active ? "step" : undefined}
          >
            <span className="source-number" aria-hidden="true">
              {start + i}
            </span>
            {line || " "}
          </span>
        ))}
      </code>
    </pre>
  );
}
export function SourceSnapshot({
  source,
}: {
  source: { file: string; anchor: string; scope: "instruction" | "block" };
}) {
  const line = sourceLine(source.file, source.anchor);
  if (!line) return null;
  return (
    <aside className="source-snapshot">
      <p className="small">
        {source.scope === "instruction"
          ? "Instantánea después de esta instrucción"
          : "Resultado del bloque que comienza aquí (no una pausa del intérprete)"}{" "}
        · {sources[source.file].path}:{line}
      </p>
      <SourceCode
        file={source.file}
        start={Math.max(1, line - 2)}
        end={line + 3}
        active={line}
      />
    </aside>
  );
}
