export type Action =
  | { kind: "ask"; player: number; from: number; card: number; yes: boolean }
  | { kind: "quartet"; player: number; suit: number };
export type Deck = {
  players: number;
  suits: number;
  perSuit: number;
  hand: number;
};
export const standardDeck: Deck = { players: 4, suits: 8, perSuit: 4, hand: 8 };
export type Obligation = { player: number; suit: number; candidates: number[] };
export type MatchingState = {
  domains: number[][];
  owners: number[];
  fixed: number[];
  obligations: Obligation[];
  slots: { player: number; suit: number; candidates: number[] }[];
  matching: number[];
  possible: boolean;
  reason: string;
};
/** All domains refer to INITIAL ownership. owners tracks current ownership after first disclosure. */
export function checkQuartets(
  actions: Action[],
  deck = standardDeck,
  trace = true,
) {
  const { players, suits, perSuit, hand } = deck,
    C = suits * perSuit;
  if (players * hand !== C) throw Error("Mazo y manos incompatibles.");
  const domains = Array.from({ length: C }, () =>
      Array.from({ length: players }, (_, i) => i),
    ),
    owners = Array(C).fill(-1),
    fixed = Array(C).fill(-1);
  let obligations: Obligation[] = [],
    failure = "",
    firstFailure: number | null = null;
  const history: MatchingState[] = [];
  const reveal = (card: number, p: number) => {
    if (fixed[card] >= 0) {
      if (owners[card] !== p) failure = "La carta ya tiene otro dueño actual.";
      return;
    }
    if (!domains[card].includes(p))
      failure = "Una respuesta anterior excluía este dueño inicial.";
    fixed[card] = p;
    owners[card] = p;
    domains[card] = [p];
    obligations = obligations
      .filter((o) => !(o.player === p && o.candidates.includes(card)))
      .map((o) => ({
        ...o,
        candidates: o.candidates.filter((c) => c !== card),
      }));
  };
  const match = () => {
    const slots: MatchingState["slots"] = [],
      unknown = Array.from({ length: C }, (_, i) => i).filter(
        (c) => fixed[c] < 0,
      );
    for (let p = 0; p < players; p++) {
      const free = hand - fixed.filter((x) => x === p).length,
        required = obligations.filter((o) => o.player === p);
      if (free < required.length)
        failure = "Más obligaciones que huecos iniciales disponibles.";
      for (const o of required)
        slots.push({
          player: p,
          suit: o.suit,
          candidates: o.candidates.filter(
            (c) => fixed[c] < 0 && domains[c].includes(p),
          ),
        });
      for (let i = required.length; i < free; i++)
        slots.push({
          player: p,
          suit: -1,
          candidates: unknown.filter((c) => domains[c].includes(p)),
        });
    }
    const occupied = Array(C).fill(-1),
      matching = Array(slots.length).fill(-1);
    // Recolocar al dueño del hueco ocupado evita el error de un greedy irrevocable.
    const augment = (s: number, seen: Set<number>): boolean => {
      for (const c of slots[s].candidates)
        if (!seen.has(c)) {
          seen.add(c);
          if (occupied[c] < 0 || augment(occupied[c], seen)) {
            occupied[c] = s;
            matching[s] = c;
            return true;
          }
        }
      return false;
    };
    let matched = 0;
    for (let s = 0; s < slots.length; s++) if (augment(s, new Set())) matched++;
    const possible =
      !failure && matched === unknown.length && slots.length === unknown.length;
    if (!possible && !failure)
      failure =
        "No hay matching que complete simultáneamente las manos iniciales.";
    if (trace)
      history.push(
        JSON.parse(
          JSON.stringify({
            domains,
            owners,
            fixed,
            obligations,
            slots,
            matching,
            possible,
            reason:
              failure ||
              "Existe una distribución inicial compatible con todo el prefijo.",
          }),
        ),
      );
    return possible;
  };
  for (let i = 0; i < actions.length; i++) {
    const a = actions[i],
      p = a.player;
    if (a.kind === "ask") {
      const s = Math.floor(a.card / perSuit),
        cards = Array.from({ length: perSuit }, (_, j) => s * perSuit + j);
      // Asking for one's own card is expressly allowed by the statement.
      if (!cards.some((c) => owners[c] === p)) {
        const candidates = cards.filter(
            (c) => fixed[c] < 0 && domains[c].includes(p),
          ),
          old = obligations.find((o) => o.player === p && o.suit === s);
        if (old)
          old.candidates = old.candidates.filter((c) => candidates.includes(c));
        else obligations.push({ player: p, suit: s, candidates });
      }
      if (a.yes) {
        reveal(a.card, a.from);
        // Una transferencia cambia el dueño actual, nunca el reparto inicial.
        owners[a.card] = p;
      } else if (fixed[a.card] >= 0) {
        if (owners[a.card] === a.from)
          failure = "Se niega una carta que sabemos que posee.";
      } else domains[a.card] = domains[a.card].filter((x) => x !== a.from);
    } else {
      for (let j = 0; j < perSuit; j++) {
        const c = a.suit * perSuit + j;
        reveal(c, p);
        owners[c] = -2;
      }
    }
    if (!match()) {
      firstFailure = i + 1;
      break;
    }
  }
  return { possible: firstFailure === null, firstFailure, history };
}
