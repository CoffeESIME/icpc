import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import ts from "typescript";
const files = [
  "compression",
  "turning-red",
  "extended",
  "trains",
  "rotations",
  "quartets",
  "geometry",
  "trace",
];
const catalog = {};
mkdirSync("public/reference", { recursive: true });
for (const name of files) {
  const path = `src/algorithms/${name}.ts`;
  const code = readFileSync(path, "utf8").replaceAll("\r\n", "\n");
  const ast = ts.createSourceFile(path, code, ts.ScriptTarget.Latest, true);
  const declarations = [];
  for (const node of ast.statements) {
    const names = ts.isVariableStatement(node)
      ? node.declarationList.declarations.map((d) => d.name.getText(ast))
      : node.name
        ? [node.name.getText(ast)]
        : [];
    for (const name of names)
      declarations.push({
        name,
        start: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
        end: ast.getLineAndCharacterOfPosition(node.end).line + 1,
      });
  }
  catalog[name] = { path, code, declarations };
  // A downloadable copy of the actual repository module, not a second implementation.
  writeFileSync(`public/reference/${name}.ts.txt`, code);
}
writeFileSync(
  "src/data/code-catalog.json",
  JSON.stringify(catalog, null, 2) + "\n",
);

const pythonFiles = {
  Y: "compression",
  P: "turning_red",
  Q: "queue",
  W: "liar",
  U: "trains",
  S: "bridge",
  R: "rotations",
  X: "quartets",
  T: "pyramids",
  V: "dice",
  Z: "levers",
};
const pythonCatalog = {};
mkdirSync("public/reference/python", { recursive: true });
for (const [id, name] of Object.entries(pythonFiles)) {
  const path = `src/algorithms/python/${name}.py`;
  const code = readFileSync(path, "utf8").replaceAll("\r\n", "\n");
  pythonCatalog[id] = { name, path, code };
  writeFileSync(`public/reference/python/${name}.py.txt`, code);
}
writeFileSync(
  "src/data/python-catalog.json",
  JSON.stringify(pythonCatalog, null, 2) + "\n",
);
