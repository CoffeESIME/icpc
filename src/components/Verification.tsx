import { deepDives } from "@/data/deep-dives";
export function Verification({ id }: { id: string }) {
  const d = deepDives[id];
  return (
    <aside className="verification">
      <strong>{d.status}</strong>
      <p>{d.evidence}</p>
      <details>
        <summary>Alcance, límites y fuentes</summary>
        <ul>
          {d.limitations.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        {d.sources.map((s) => (
          <p key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.title} ↗
            </a>
          </p>
        ))}
      </details>
    </aside>
  );
}
