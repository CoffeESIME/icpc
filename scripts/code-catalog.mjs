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
