"""S · Recurrencia Backhouse–Truong. La lección conserva su estado parcial."""
from math import isfinite


def solve_bridge(times: list[int], capacity: int) -> int | float:
    if len(times) < 2 or type(capacity) is not int or capacity < 2 or any(not isfinite(t) or t <= 0 for t in times):
        raise ValueError("Se requieren tiempos positivos y capacidad >= 2.")
    t = [0] + sorted(times)
    n_total = len(times)
    c = min(capacity, n_total)
    prefix = [0] * (n_total + 1)
    for i in range(1, n_total + 1):
        prefix[i] = prefix[i - 1] + t[i]
    # Filas de longitud distinta: no reservar un cuadrado N x N innecesario.
    dp = [[] for _ in range(n_total + 1)]
    for n in range(2, n_total + 1):
        for e in range((n_total - n) // c + 1):
            if n <= c and e == 0:
                dp[n].append(t[n])
                continue
            lo = 2 if n <= c else max(0, c + 2 - n)
            hi = min(n, e + 1) if n <= c else min(c - 1, e + 1)
            best = float("inf")
            for i in range(lo, hi + 1):
                next_n = i if n <= c else n - c + i
                # next_n<n o misma fila con e menor: la celda ya existe.
                candidate = t[n] + prefix[i] + dp[next_n][e + 1 - i]
                best = min(best, candidate)
            dp[n].append(best)
    return dp[n_total][0]


if __name__ == "__main__":
    print(solve_bridge([1, 2, 5, 10], 2))  # 17
