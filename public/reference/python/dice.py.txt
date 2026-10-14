"""V · Puntuaciones, envolvente convexa y recorte por 1/2."""
from bisect import bisect_left, bisect_right


def solve_dice(d1: list[int], d2: list[int]) -> dict:
    a, b = sorted(d1), sorted(d2)

    def score(v, die):
        # Victoria=1, empate=1/2. bisect_left/right son búsquedas binarias.
        return (bisect_left(die, v) + bisect_right(die, v)) / (2 * len(die))

    # Decidir el orden con enteros: un empate exacto no debe invertirse por redondeo.
    wins_twice = sum(bisect_left(b, v) + bisect_right(b, v) for v in a)
    if wins_twice < len(a) * len(b):
        a, b = b, a
    values = sorted({1, *a, *b, *(x + 1 for x in a), *(x + 1 for x in b)})
    points = []
    for v in values:
        point = (score(v, a), score(v, b))
        if not points or point != points[-1]:
            points.append(point)

    def cross(a, b, c):
        return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])

    def half(ordered):
        h = []
        for p in ordered:
            while len(h) > 1 and cross(h[-2], h[-1], p) <= 0:
                h.pop()
            h.append(p)
        return h

    hull = half(points)[:-1] + half(reversed(points))[:-1]
    if not hull:
        hull = [points[0]]
    minimum, maximum = float("inf"), -float("inf")

    def consider(x, y):
        nonlocal minimum, maximum
        if x >= 0.5 - 1e-12:
            minimum = min(minimum, y)
        if y <= 0.5 + 1e-12:
            maximum = max(maximum, x)

    for i, p in enumerate(hull):
        q = hull[(i + 1) % len(hull)]
        consider(*p)
        # Los vértices nuevos del recorte están en x=1/2 o y=1/2.
        if p[0] != q[0]:
            t = (0.5 - p[0]) / (q[0] - p[0])
            if 0 <= t <= 1:
                consider(0.5, p[1] + t * (q[1] - p[1]))
        if p[1] != q[1]:
            t = (0.5 - p[1]) / (q[1] - p[1])
            if 0 <= t <= 1:
                consider(p[0] + t * (q[0] - p[0]), 0.5)
    return {"minimum": minimum, "maximum": maximum}


if __name__ == "__main__":
    print(solve_dice([1], [1]))  # {'minimum': 0.5, 'maximum': 0.5}
