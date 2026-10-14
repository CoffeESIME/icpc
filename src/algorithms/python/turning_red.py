"""P · Turning Red. Colores R=0, G=1, B=2; índices desde cero."""


def solve_red(colors: list[int], buttons: list[list[int]]) -> dict:
    if not colors or any(c not in (0, 1, 2) for c in colors):
        raise ValueError("Colores inválidos.")
    n = len(buttons)
    own = [[] for _ in colors]
    for b, lights in enumerate(buttons):
        if not lights or len(set(lights)) != len(lights):
            raise ValueError("Conexiones vacías o repetidas.")
        for light in lights:
            if not 0 <= light < len(colors):
                raise ValueError("Índice de luz inválido.")
            own[light].append(b)
            if len(own[light]) > 2:
                raise ValueError("Una luz admite como máximo dos botones.")
    impossible = {"cost": None, "presses": None}
    adj = [[] for _ in buttons]
    for light, incident in enumerate(own):
        if not incident and colors[light] != 0:
            return impossible
        if len(incident) == 2:
            a, b = incident
            adj[a].append((b, colors[light]))
            adj[b].append((a, colors[light]))

    visited = [False] * n
    answer = [0] * n
    values = [-1] * n
    total = 0
    for root in range(n):
        if visited[root]:
            continue
        component, stack, lights = [], [root], set()
        visited[root] = True
        while stack:
            u = stack.pop()
            component.append(u)
            lights.update(buttons[u])
            for v, _ in adj[u]:
                if not visited[v]:
                    visited[v] = True
                    stack.append(v)
        best = float("inf")
        best_values = []
        for trial in range(3):
            # Reiniciar solo esta componente conserva el coste lineal.
            for u in component:
                values[u] = -1
            values[root] = trial
            todo, valid = [root], True
            while todo and valid:
                u = todo.pop()
                for v, color in adj[u]:
                    forced = (-color - values[u]) % 3  # Python normaliza % 3.
                    if values[v] == -1:
                        values[v] = forced
                        todo.append(v)
                    elif values[v] != forced:
                        valid = False
                        break
            # Incluir las restricciones de luces con un solo botón.
            if valid:
                valid = all(
                    (colors[l] + sum(values[b] for b in own[l])) % 3 == 0
                    for l in lights
                )
            if valid:
                cost = sum(values[u] for u in component)
                if cost < best:
                    best = cost
                    best_values = [values[u] for u in component]
        if best == float("inf"):
            return impossible
        for u, value in zip(component, best_values):
            answer[u] = value
        total += best
    return {"cost": total, "presses": answer}


if __name__ == "__main__":
    print(solve_red([1], [[0]]))  # {'cost': 2, 'presses': [2]}
