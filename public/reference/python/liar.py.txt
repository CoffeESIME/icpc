"""W · Decodificador local; el transporte de un juez interactivo no se incluye."""
from itertools import combinations

QUESTIONS = [(1, 0, 0), (0, 1, 0), (0, 0, 1), (1, 1, 1), (1, 2, 3)]


def det(a: list) -> int:
    return (
        a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1])
        - a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0])
        + a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0])
    )


def solve_liar(replies: list[int]) -> list[int] | None:
    if len(replies) != 5 or any(type(x) is not int or not 0 <= x <= 100000 for x in replies):
        raise ValueError("Se requieren cinco enteros entre 0 y 100000.")
    for ids in combinations(range(5), 3):
        a = [QUESTIONS[i] for i in ids]
        d = det(a)  # Cualesquiera tres filas son independientes: d != 0.
        nums = []
        for col in range(3):
            replaced = [
                [replies[ids[t]] if c == col else row[c] for c in range(3)]
                for t, row in enumerate(a)
            ]
            nums.append(det(replaced))
        if any(x % d != 0 for x in nums):
            continue
        candidate = [x // d for x in nums]  # División exacta, no flotante.
        if any(x < 0 for x in candidate):
            continue
        agreements = sum(
            sum(v * x for v, x in zip(row, candidate)) == reply
            for row, reply in zip(QUESTIONS, replies)
        )
        if agreements >= 4:
            return candidate
    return None


if __name__ == "__main__":
    print(solve_liar([2, 3, 1, 6, 999]))  # [2, 3, 1]
