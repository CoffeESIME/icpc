"""Z · Reconstrucción en F3^k. Los enteros de Python conservan conteos exactos."""


def ternary_vectors(k):
    return [tuple((s // (3 ** j)) % 3 for j in range(k)) for s in range(3 ** k)]


def encode(v):
    return sum(d * 3 ** i for i, d in enumerate(v))


def vector_add(a, b, sign=1):
    return tuple((x + sign * y) % 3 for x, y in zip(a, b))


def lever_distribution(levers, k):
    vectors = ternary_vectors(k)
    counts = [0] * len(vectors)
    counts[0] = 1
    layers = [counts]
    for u in levers:
        next_counts = counts.copy()  # No usar la palanca.
        for s, v in enumerate(vectors):
            next_counts[encode(vector_add(v, u))] += counts[s]  # Usarla una vez.
        counts = next_counts
        layers.append(counts)
    return counts, layers


def solve_levers(counts: list[int], k: int) -> list[list[int]]:
    if not 1 <= k <= 5 or len(counts) != 3 ** k or any(type(x) is not int or x < 0 for x in counts):
        raise ValueError("Distribución inválida.")
    total = sum(counts)
    if total < 1 or total & (total - 1) or total > 2 ** 40:
        raise ValueError("La suma debe ser 2^n, n <= 40.")
    n = total.bit_length() - 1
    vectors = ternary_vectors(k)

    def dot(a, b):
        return sum(x * y for x, y in zip(a, b)) % 3

    projections = []
    for x in vectors:
        row = [0, 0, 0]
        for s, v in enumerate(vectors):
            row[dot(x, v)] += counts[s]
        # v & -v es una potencia de dos: su exponente es la valuación de v.
        f = min((v & -v).bit_length() - 1 for v in row if v)
        projections.append((x, f))

    def mass(generators):
        h = [f for x, f in projections if all(dot(x, g) == 0 for g in generators)]
        numerator, denominator = 3 * sum(h) - n * len(h), 2 * len(h)
        if numerator % denominator:
            raise ValueError("Conteos incompatibles.")
        return numerator // denominator

    zeros = mass([])
    if zeros < 0:
        raise ValueError("Conteos incompatibles.")
    levers = [(0,) * k for _ in range(zeros)]
    for s, u in enumerate(vectors[1:], 1):
        neg = encode(tuple(-x % 3 for x in u))
        if s > neg:
            continue  # Un solo representante por recta {u,-u}.
        count = mass([u]) - zeros
        if count < 0:
            raise ValueError("Conteos incompatibles.")
        levers.extend([u] * count)
    if len(levers) != n:
        raise ValueError("Conteos incompatibles.")
    initial, layers = lever_distribution(levers, k)
    shift = next((v for i, v in enumerate(vectors) if initial[i] > 0 and all(
        counts[j] == initial[encode(vector_add(s, v))] for j, s in enumerate(vectors)
    )), None)
    if shift is None:
        raise ValueError("No existe una orientación consistente.")
    # Retroceder por capas recupera el subconjunto que debe cambiar de signo.
    v = shift
    answer = [list(u) for u in levers]
    for i in range(n, 0, -1):
        if layers[i - 1][encode(v)] == 0:
            v = vector_add(v, levers[i - 1], -1)
            answer[i - 1] = [-x % 3 for x in levers[i - 1]]
    return answer


if __name__ == "__main__":
    print(solve_levers([1, 1, 0], 1))  # [[1]]
