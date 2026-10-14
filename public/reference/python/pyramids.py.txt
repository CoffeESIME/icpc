"""T · Minimización convexa aproximada sobre 16 pares de lados."""
from math import hypot


def pyramid(p):
    x, y, u, v, h = p
    dx, dy = u - x, v - y
    base = [(x, y), (u, v), (u - dy, v + dx), (x - dy, y + dx)]
    apex = ((x + u - dy) / 2, (y + v + dx) / 2, h)
    return base, apex


def interpolate(a, b, t):
    return (a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]))


def minimize(f, iterations):
    lo, hi = 0.0, 1.0
    for _ in range(iterations):
        a, b = lo + (hi - lo) / 3, hi - (hi - lo) / 3
        if f(a) <= f(b):
            hi = b
        else:
            lo = a
    # Incluir extremos: el mínimo puede ser una esquina.
    candidates = [(x, f(x)) for x in (0.0, 1.0, (lo + hi) / 2)]
    return min(candidates, key=lambda pair: pair[1])


def solve_pyramids(first: list, second: list, iterations: int = 90) -> float:
    base_a, apex_a = pyramid(first)
    base_b, apex_b = pyramid(second)
    best = float("inf")
    for i in range(4):
        for j in range(4):
            def distance(t, u):
                p = interpolate(base_a[i], base_a[(i + 1) % 4], t)
                q = interpolate(base_b[j], base_b[(j + 1) % 4], u)
                return (
                    hypot(p[0] - apex_a[0], p[1] - apex_a[1], apex_a[2])
                    + hypot(p[0] - q[0], p[1] - q[1])
                    + hypot(q[0] - apex_b[0], q[1] - apex_b[1], apex_b[2])
                )
            # Cada evaluación exterior resuelve una búsqueda interior.
            t, _ = minimize(lambda t: minimize(lambda u: distance(t, u), iterations)[1], iterations)
            _, value = minimize(lambda u: distance(t, u), iterations)
            best = min(best, value)
    return best


if __name__ == "__main__":
    print(solve_pyramids([0, 0, 10, 0, 5], [20, 0, 30, 0, 5]))  # ≈24.142135624
