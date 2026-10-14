"""U · Construcción máxima. La validación del recorrido es una función aparte."""


def solve_train(s: int, c: int) -> str:
    if type(s) is not int or type(c) is not int or not 0 <= s <= 100000 or not 4 <= c <= 100000:
        raise ValueError("Inventarios fuera de rango.")
    s -= s % 2
    c -= c % 2
    if s == 0:
        c -= c % 4
        if c == 8:  # Excepción sin rectas demostrada en la lección.
            c = 4
    if c == 4:
        base, gaps, extension = "LLLL", {0, 2}, "S" * (s // 2)
    else:
        base = "LRRLRRLRRLRR" if s == 0 else "LSLLSL" if c % 4 == 0 else "LSLSLLRL"
        gaps = {0, 6} if s == 0 else {0, 3}
        k = (c - sum(piece != "S" for piece in base)) // 4
        t = 0 if s == 0 else (s - 2) // 2
        word = "LR" if s == 0 else "RL"
        extension = word * k + "S" * t
    # join materializa la salida en O(s+c); evitar concatenar en un ciclo largo.
    return "".join((extension if i in gaps else "") + p for i, p in enumerate(base))


def check_track(track: str) -> bool:
    x = y = d = 0
    seen = set()
    directions = [(1, 0), (0, 1), (-1, 0), (0, -1)]
    for piece in track:
        if piece not in "SLR" or (x, y) in seen:
            return False
        seen.add((x, y))
        d = (d + {"S": 0, "L": 3, "R": 1}[piece]) % 4
        dx, dy = directions[d]
        x, y = x + dx, y + dy
    return len(track) >= 4 and (x, y, d) == (0, 0, 0)


if __name__ == "__main__":
    track = solve_train(2, 8)
    print(track, check_track(track))  # RLLSLRLLSL True
