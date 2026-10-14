"""R · Clasificación con lowlink iterativo, KMP y paridad. Grafo simple."""


def is_rotation(text: list[int], pattern: list[int]) -> bool:
    pi = [0] * len(pattern)
    j = 0
    for i in range(1, len(pattern)):
        while j and pattern[i] != pattern[j]:
            j = pi[j - 1]
        if pattern[i] == pattern[j]:
            j += 1
        pi[i] = j
    j = 0
    for i in range(2 * len(text) - 1):
        value = text[i % len(text)]
        while j and value != pattern[j]:
            j = pi[j - 1]
        if value == pattern[j]:
            j += 1
        if j == len(pattern):
            return True
    return False


def rotation_class(n: int, edges: list[list[int]], start: list[int], target: list[int]) -> bool:
    adj = [[] for _ in range(n)]
    for e, (a, b) in enumerate(edges):
        adj[a].append((b, e))
        adj[b].append((a, e))
    tin, low = [-1] * n, [0] * n
    parent, pe, cursor = [-1] * n, [-1] * n, [0] * n
    bridges, blocks, edge_stack = set(), [], []
    clock = 0
    for root in range(n):
        if tin[root] >= 0:
            continue
        stack = [root]
        tin[root] = low[root] = clock
        clock += 1
        while stack:
            u = stack[-1]
            if cursor[u] < len(adj[u]):
                v, e = adj[u][cursor[u]]
                cursor[u] += 1
                if e == pe[u]:
                    continue
                if tin[v] < 0:
                    parent[v], pe[v] = u, e
                    edge_stack.append(e)
                    tin[v] = low[v] = clock
                    clock += 1
                    stack.append(v)
                elif tin[v] < tin[u]:
                    low[u] = min(low[u], tin[v])
                    edge_stack.append(e)
            else:
                # Simula el retorno del DFS sin recursión profunda en Python.
                stack.pop()
                p = parent[u]
                if p >= 0:
                    low[p] = min(low[p], low[u])
                    if low[u] > tin[p]:  # Estricto para puentes.
                        bridges.add(pe[u])
                    if low[u] >= tin[p]:  # No estricto para bloques.
                        block = []
                        while True:
                            e = edge_stack.pop()
                            block.append(e)
                            if e == pe[u]:
                                break
                        blocks.append(block)
    comp, parts = [-1] * n, []
    for u in range(n):
        if comp[u] >= 0:
            continue
        nodes = [u]
        comp[u] = len(parts)
        # Iterar una lista creciente es válido aquí; cada vértice entra una vez.
        for node in nodes:
            for v, e in adj[node]:
                if e not in bridges and comp[v] < 0:
                    comp[v] = len(parts)
                    nodes.append(v)
        parts.append(nodes)
    full, block_count = [False] * len(parts), [0] * len(parts)
    for block in blocks:
        if len(block) <= 1:
            continue
        vertices = {v for e in block for v in edges[e]}
        part = comp[edges[block[0]][0]]
        block_count[part] += 1
        if len(block) != len(vertices) or len(block) % 2 == 0:
            full[part] = True

    for part, nodes in enumerate(parts):
        a, b = [start[v] for v in nodes], [target[v] for v in nodes]
        if sorted(a) != sorted(b):
            return False
        if len(nodes) == 1:
            continue
        if block_count[part] == 1 and all(
            sum(e not in bridges for _, e in adj[u]) == 2 for u in nodes
        ):
            # Un ciclo aislado solo admite rotaciones, aun si es par.
            order, prev, u = [nodes[0]], -1, nodes[0]
            while True:
                v = next(v for v, e in adj[u] if e not in bridges and v != prev)
                prev, u = u, v
                if u == order[0]:
                    break
                order.append(u)
            if not is_rotation([start[v] for v in order], [target[v] for v in order]):
                return False
            continue
        if full[part] or len(set(a)) < len(a):
            continue  # Los duplicados permiten ocultar un cambio de paridad.
        where = {value: i for i, value in enumerate(a)}
        permutation = [where[value] for value in b]
        seen, cycles = set(), 0
        for i in range(len(nodes)):
            if i not in seen:
                cycles += 1
                j = i
                while j not in seen:
                    seen.add(j)
                    j = permutation[j]
        if (len(nodes) - cycles) % 2:
            return False
    return True


if __name__ == "__main__":
    print(rotation_class(3, [[0, 1], [1, 2], [2, 0]], [1, 2, 3], [2, 3, 1]))  # True
