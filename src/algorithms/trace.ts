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
