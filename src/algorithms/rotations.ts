/** Iterative lowlink / biconnected edge blocks: safe for deep 400000-vertex inputs. */
export function rotationClass(
  n: number,
  edges: number[][],
  start: number[],
  target: number[],
) {
  const adj: { v: number; e: number }[][] = Array.from({ length: n }, () => []);
  edges.forEach(([a, b], e) => {
    adj[a].push({ v: b, e });
    adj[b].push({ v: a, e });
  });
  const tin = Array(n).fill(-1),
    low = Array(n).fill(0),
    parent = Array(n).fill(-1),
    pe = Array(n).fill(-1),
    cursor = Array(n).fill(0),
    bridges = new Set<number>(),
    blocks: number[][] = [],
    edgeStack: number[] = [];
  let clock = 0;
  for (let root = 0; root < n; root++)
    if (tin[root] < 0) {
      const stack = [root];
      tin[root] = low[root] = clock++;
      while (stack.length) {
        const u = stack.at(-1)!;
        if (cursor[u] < adj[u].length) {
          const { v, e } = adj[u][cursor[u]++];
          if (e === pe[u]) continue;
          if (tin[v] < 0) {
            parent[v] = u;
            pe[v] = e;
            edgeStack.push(e);
            tin[v] = low[v] = clock++;
            stack.push(v);
          } else if (tin[v] < tin[u]) {
            low[u] = Math.min(low[u], tin[v]);
            edgeStack.push(e);
          }
        } else {
          stack.pop();
          const p = parent[u];
          if (p >= 0) {
            low[p] = Math.min(low[p], low[u]);
            // Estricto: no hay retorno al padre ni a un ancestro suyo.
            if (low[u] > tin[p]) bridges.add(pe[u]);
            // No estricto: termina un bloque biconexo, aunque no sea un puente.
            if (low[u] >= tin[p]) {
              const b: number[] = [];
              let e: number;
              do {
                e = edgeStack.pop()!;
                b.push(e);
              } while (e !== pe[u]);
              blocks.push(b);
            }
          }
        }
      }
    }
  const comp = Array(n).fill(-1),
    parts: number[][] = [];
  for (let u = 0; u < n; u++)
    if (comp[u] < 0) {
      const nodes = [u],
        id = parts.length;
      comp[u] = id;
      for (let i = 0; i < nodes.length; i++)
        for (const { v, e } of adj[nodes[i]])
          if (!bridges.has(e) && comp[v] < 0) {
            comp[v] = id;
            nodes.push(v);
          }
      parts.push(nodes);
    }
  const full = Array(parts.length).fill(false),
    blockCount = Array(parts.length).fill(0);
  for (const block of blocks)
    if (block.length > 1) {
      const vertices = new Set(block.flatMap((e) => edges[e])),
        id = comp[edges[block[0]][0]];
      blockCount[id]++;
      if (block.length !== vertices.size || block.length % 2 === 0)
        full[id] = true;
    }
  const results = parts.map((nodes, id) => {
    const a = nodes.map((v) => start[v]),
      b = nodes.map((v) => target[v]);
    const sorted = a.toSorted((x, y) => x - y),
      same = sorted.join(",") === b.toSorted((x, y) => x - y).join(",");
    if (nodes.length === 1) return { nodes, kind: "fijo", possible: same };
    if (
      blockCount[id] === 1 &&
      nodes.every((u) => adj[u].filter((x) => !bridges.has(x.e)).length === 2)
    ) {
      const order = [nodes[0]];
      let prev = -1,
        u = nodes[0];
      do {
        const v = adj[u].find((x) => !bridges.has(x.e) && x.v !== prev)!.v;
        prev = u;
        u = v;
        if (u !== order[0]) order.push(u);
      } while (u !== order[0]);
      const pattern = order.map((v) => target[v]),
        text = order.map((v) => start[v]),
        pi = Array(pattern.length).fill(0);
      // KMP: pi permite reutilizar el prefijo ya comparado tras un fallo.
      for (let i = 1, j = 0; i < pattern.length; i++) {
        while (j && pattern[i] !== pattern[j]) j = pi[j - 1];
        if (pattern[i] === pattern[j]) j++;
        pi[i] = j;
      }
      let found = false;
      for (let i = 0, j = 0; i < 2 * text.length - 1; i++) {
        while (j && text[i % text.length] !== pattern[j]) j = pi[j - 1];
        if (text[i % text.length] === pattern[j]) j++;
        if (j === pattern.length) {
          found = true;
          break;
        }
      }
      return { nodes, kind: "rotaciones", possible: found };
    }
    if (full[id])
      return { nodes, kind: "cualquier permutación", possible: same };
    // Intercambiar dos copias iguales cambia paridad sin cambiar lo observable.
    const duplicate = sorted.some((v, i) => i > 0 && v === sorted[i - 1]);
    if (!same || duplicate)
      return {
        nodes,
        kind: "paridad (duplicados indistinguibles)",
        possible: same,
      };
    const where = new Map(a.map((v, i) => [v, i])),
      p = b.map((v) => where.get(v)!),
      seen = new Set<number>();
    let cycles = 0;
    for (let i = 0; i < p.length; i++)
      if (!seen.has(i)) {
        cycles++;
        let j = i;
        while (!seen.has(j)) {
          seen.add(j);
          j = p[j];
        }
      }
    return {
      nodes,
      kind: "solo permutaciones pares",
      possible: (nodes.length - cycles) % 2 === 0,
    };
  });
  return {
    possible: results.every((r) => r.possible),
    results,
    bridges: [...bridges],
    blocks,
  };
}
