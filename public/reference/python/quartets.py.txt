"""X · Matching del reparto inicial. Índices desde cero; acciones válidas del enunciado."""


def check_quartets(actions: list[dict], deck: dict | None = None) -> dict:
    if deck is None:
        deck = {"players": 4, "suits": 8, "perSuit": 4, "hand": 8}
    players, suits, per_suit, hand = (deck[k] for k in ("players", "suits", "perSuit", "hand"))
    count = suits * per_suit
    if players * hand != count:
        raise ValueError("Mazo y manos incompatibles.")
    domains = [set(range(players)) for _ in range(count)]
    owners, fixed = [-1] * count, [-1] * count
    obligations = {}  # (jugador, palo) -> cartas testigo posibles.
    failed = False

    def reveal(card, player):
        nonlocal failed
        if fixed[card] >= 0:
            failed |= owners[card] != player
            return
        failed |= player not in domains[card]
        fixed[card] = owners[card] = player
        domains[card] = {player}
        for key in list(obligations):
            candidates = obligations[key]
            if key[0] == player and card in candidates:
                del obligations[key]
            else:
                candidates.discard(card)

    def match():
        unknown = [c for c in range(count) if fixed[c] < 0]
        slots = []
        for player in range(players):
            free = hand - fixed.count(player)
            required = [cards for (p, _), cards in obligations.items() if p == player]
            if free < len(required):
                return False
            for cards in required:
                slots.append([c for c in cards if fixed[c] < 0 and player in domains[c]])
            for _ in range(free - len(required)):
                slots.append([c for c in unknown if player in domains[c]])
        occupied = [-1] * count

        def augment(slot, seen):
            for card in slots[slot]:
                if card in seen:
                    continue
                seen.add(card)
                if occupied[card] < 0 or augment(occupied[card], seen):
                    occupied[card] = slot
                    return True
            return False

        # Recursión acotada por el mazo estándar de 32 cartas.
        matched = sum(augment(s, set()) for s in range(len(slots)))
        return not failed and matched == len(unknown) == len(slots)

    for i, action in enumerate(actions):
        player = action["player"]
        if action["kind"] == "ask":
            card, sender = action["card"], action["from"]
            suit = card // per_suit
            cards = range(suit * per_suit, (suit + 1) * per_suit)
            if not any(owners[c] == player for c in cards):
                candidates = {c for c in cards if fixed[c] < 0 and player in domains[c]}
                key = (player, suit)
                if key in obligations:
                    obligations[key] &= candidates
                else:
                    obligations[key] = candidates
            if action["yes"]:
                reveal(card, sender)
                owners[card] = player  # Transferir no cambia el dueño INICIAL.
            elif fixed[card] >= 0:
                failed |= owners[card] == sender
            else:
                domains[card].discard(sender)
        else:
            for j in range(per_suit):
                card = action["suit"] * per_suit + j
                reveal(card, player)
                owners[card] = -2  # Retirada en un cuarteto.
        if not match():
            return {"possible": False, "firstFailure": i + 1}
    return {"possible": True, "firstFailure": None}


if __name__ == "__main__":
    print(check_quartets([]))  # {'possible': True, 'firstFailure': None}
