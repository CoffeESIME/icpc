"""Q · Doing the Container Shuffle. Esperanza, no simulación de pilas."""


class Fenwick:
    def __init__(self, n: int):
        self.n = n
        self.tree = [0] * (n + 1)

    def add(self, i: int, delta: int):
        # Índices desde 1; i & -i es el bit menos significativo.
        while i <= self.n:
            self.tree[i] += delta
            i += i & -i

    def sum(self, i: int) -> int:
        total = 0
        while i > 0:
            total += self.tree[i]
            i -= i & -i
        return total


def solve_queue(order: list[int]) -> float:
    n = len(order)
    if not n or set(order) != set(range(1, n + 1)):
        raise ValueError("Se requiere una permutación de 1 a n.")
    bit = Fenwick(n)
    for label in range(1, n + 1):
        bit.add(label, 1)
    twice = 2 * n  # Las n retiradas son obligatorias.
    for i, q in enumerate(order):
        bit.add(q, -1)  # Retirar antes de contar los restantes.
        if i == 0:
            count = n - q
        else:
            h = min(order[i - 1], q)
            count = n - i - 1 - bit.sum(h)
        twice += count  # Cada elegible aporta 1/2 movimiento esperado.
    return twice / 2


if __name__ == "__main__":
    print(solve_queue([4, 2, 5, 3, 1]))  # 7.0
