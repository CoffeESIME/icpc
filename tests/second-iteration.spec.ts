import { test, expect, type Page } from "@playwright/test";
async function open(page: Page, name: string, stage = "05 Laboratorio") {
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-ready",
    "true",
  );
  const menu = page.getByRole("button", { name: "Abrir navegación" });
  if (await menu.isVisible()) await menu.click();
  await page
    .locator(".problem-nav")
    .getByRole("button", { name: new RegExp(name) })
    .click();
  await page.getByRole("button", { name: stage, exact: true }).click();
}
test("W, U y Q ejecutan casos editables, validan y retroceden", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await open(page, "Riddle of the Sphinx");
  await expect(page.locator(".result-banner")).toContainText("2, 3, 1");
  await page.getByLabel("Respuesta alterada").selectOption("4");
  await page.getByLabel("Valor falso").fill("999");
  await expect(page.locator(".result-banner")).toContainText("2, 3, 1");
  await page.getByLabel("Respuesta alterada").selectOption("-1");
  await expect(page.locator(".result-banner")).toContainText("2, 3, 1");
  await open(page, "Toy Train Tracks");
  await expect(page.locator(".result-banner")).toContainText("10 piezas");
  await page.getByLabel("Rectas disponibles").fill("0");
  await expect(page.locator(".result-banner")).toContainText("4 piezas");
  await expect(page.locator(".result-banner")).toContainText(
    "Cierre y celdas verificados",
  );
  await open(page, "Doing the Container Shuffle");
  await expect(page.locator(".result-banner")).toContainText("7");
  await page
    .getByRole("button", { name: "Paso siguiente", exact: true })
    .click();
  const text = await page.locator(".trace-explanation").innerText();
  await page
    .getByRole("button", { name: "Paso anterior", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Paso siguiente", exact: true })
    .click();
  expect(await page.locator(".trace-explanation").innerText()).toBe(text);
  await page.getByLabel("Orden de retirada").fill("1 1");
  await page.getByRole("button", { name: "Calcular esperanza" }).click();
  await expect(page.locator(".lesson").getByRole("alert")).toContainText(
    "permutación",
  );
  await page.getByLabel("Orden de retirada").fill("1 2 3 4 5 6");
  await page.getByRole("button", { name: "Calcular esperanza" }).click();
  await expect(page.locator(".result-banner")).toContainText("13.5");
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("seis recorridos avanzados usan estados reales y muestran su alcance", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await open(page, "Bridging the Gap");
  await expect(page.locator(".result-banner")).toContainText("17");
  await page.getByLabel("Capacidad", { exact: true }).fill("6");
  await page.getByRole("button", { name: "Construir tabla DP" }).click();
  await expect(page.locator(".result-banner")).toContainText("10");
  await open(page, "Zoo Management");
  await page.getByLabel("Comparar con objetivo").check();
  await expect(page.locator(".result-banner")).toContainText("imposible");
  await open(page, "Quartets");
  await expect(page.locator(".result-banner")).toContainText("acción 4");
  await page.getByLabel("Cambiar última pregunta").check();
  await expect(page.locator(".result-banner")).toContainText(
    "Existe un reparto",
  );
  await open(page, "Archaeological Recovery");
  await page.getByLabel("Palancas para generar").fill("1; 2; 0");
  await page.getByRole("button", { name: "Reconstruir desde conteos" }).click();
  await expect(page.locator(".trace-player").first()).toContainText(
    "Distribución recibida",
  );
  await open(page, "Three Kinds of Dice");
  await expect(page.locator(".result-banner")).toContainText(
    "0.291666667 y 0.750000000",
  );
  await open(page, "Carl's Vacation");
  await expect(page.locator(".result-banner")).toContainText("4.828427124746");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
test("los once módulos ofrecen ejemplo, prueba, pseudocódigo y defensa persistente", async ({
  page,
}) => {
  await page.goto("/");
  for (const name of [
    "Compression",
    "Turning Red",
    "Toy Train Tracks",
    "Riddle of the Sphinx",
    "Doing the Container Shuffle",
    "Carl's Vacation",
    "Three Kinds of Dice",
    "Quartets",
    "Zoo Management",
    "Bridging the Gap",
    "Archaeological Recovery",
  ]) {
    await open(page, name, "04 Construir");
    await expect(page.locator(".worked-example li")).toHaveCount(
      name === "Compression" ||
        name === "Carl's Vacation" ||
        name === "Riddle of the Sphinx" ||
        name === "Toy Train Tracks" ||
        name === "Quartets"
        ? 4
        : 5,
    );
    await expect(page.locator(".explained-code")).toBeVisible();
    await expect(page.locator(".verification")).toBeVisible();
  }
  await page.getByRole("button", { name: "08 Exponer" }).click();
  const question = page.getByLabel("Respuesta de razonamiento", {
    exact: true,
  });
  await question.fill("Proyecto cada estado y cuento factores de dos.");
  await page
    .getByRole("button", { name: "Contrastar mi respuesta" })
    .first()
    .click();
  await page.getByLabel("Pude justificarlo sin leer").check();
  await page.reload();
  await open(page, "Archaeological Recovery", "08 Exponer");
  await expect(question).toHaveValue(
    "Proyecto cada estado y cuento factores de dos.",
  );
  await expect(
    page.getByText("Autoevaluación guardada: 1/4 criterios."),
  ).toBeVisible();
});
test("Y y P permiten predecir con el estado posterior oculto", async ({
  page,
}) => {
  await page.goto("/");
  await open(page, "Compression");
  await page
    .getByRole("button", { name: "Ver construcción paso a paso" })
    .click();
  await page.getByLabel("Anticipar el siguiente estado").check();
  await expect(
    page.getByText("Estado oculto hasta comprobar tu predicción."),
  ).toBeVisible();
  await page.getByLabel("Mi predicción", { exact: true }).fill("10110");
  await page.getByRole("button", { name: "Comprobar predicción" }).click();
  await expect(page.locator(".prediction")).toContainText("Correcto.");
  await open(page, "Turning Red");
  await page.getByRole("button", { name: "Algoritmo", exact: true }).click();
  await page.getByRole("button", { name: "Calcular y abrir la traza" }).click();
  await page.getByLabel("Anticipar el siguiente estado").check();
  await page.getByLabel("Mi predicción", { exact: true }).fill("?, ?, ?");
  await page.getByRole("button", { name: "Comprobar predicción" }).click();
  await expect(page.locator(".prediction")).toContainText(
    "El resultado de esta transición",
  );
});
