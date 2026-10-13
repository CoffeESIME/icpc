/** Events are immutable JSON-serializable snapshots, not animation instructions. */
export type TraceEvent<S> = {
  id: number;
  before: S;
  after: S;
  operation: string;
  explanation: string;
  active: number[];
  pseudocode: number;
  variables: Record<string, string | number>;
  invariant: string;
  partial: string;
  /** Exact repository instruction that produced this snapshot, or a completed block. */
  source?: { file: string; anchor: string; scope: "instruction" | "block" };
};
export function event<S>(
  events: TraceEvent<S>[],
  before: S,
  after: S,
  info: Omit<TraceEvent<S>, "id" | "before" | "after">,
) {
  events.push({
    id: events.length,
    before: JSON.parse(JSON.stringify(before)),
    after: JSON.parse(JSON.stringify(after)),
    ...info,
  });
}
