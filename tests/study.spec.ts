import { test, expect, type Page } from "@playwright/test";
async function openProblem(page: Page, name: string) {
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
}
test("dashboard, once problemas, búsqueda y fichas", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".problem-row")).toHaveCount(11);
  await page.getByLabel("Buscar problemas").fill("Fenwick");
  await expect(page.locator(".problem-row")).toHaveCount(1);
  await expect(page.locator(".problem-row")).toContainText(
    "Doing the Container Shuffle",
  );
  await page.getByLabel("Buscar problemas").fill("");
  await page.getByLabel("Ordenar problemas").selectOption("Tema");
  await page
    .getByRole("button", {
      name: "Estudiar Archaeological Recovery",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Archaeological Recovery", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "04 Construir" }).click();
  await expect(page.getByText("Pendientes de verificación")).toBeVisible();
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("Compression: operaciones, deshacer y traza reversible", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Entrar al laboratorio" }).click();
  await page.locator(".operations button").filter({ hasText: "1 · 1" }).click();
  await expect(page.locator(".experiment-stage")).toContainText("4 bits");
  await page.getByRole("button", { name: "← Deshacer", exact: true }).click();
  await expect(page.locator(".experiment-stage")).toContainText("5 bits");
  await page.getByRole("button", { name: "Rehacer →", exact: true }).click();
  await page
    .locator(".operations button")
    .filter({ hasText: "10 · 10" })
    .click();
  await expect(page.locator(".experiment-stage")).toContainText("2 bits");
  await page.getByRole("button", { name: "Guardar intento" }).click();
  await expect(page.getByText("1. 10110 → 1010 → 10")).toBeVisible();
  await page
    .getByRole("button", { name: "Ver construcción paso a paso" })
    .click();
  await page
    .getByRole("button", { name: "Paso siguiente", exact: true })
    .click();
  const after = await page.locator(".trace-explanation").innerText();
  await page
    .getByRole("button", { name: "Paso anterior", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Paso siguiente", exact: true })
    .click();
  expect(await page.locator(".trace-explanation").innerText()).toBe(after);
  await page.getByRole("button", { name: "Reproducir traza" }).click();
  await page.getByRole("button", { name: "Pausar traza" }).click();
  await page.getByLabel("Cadena binaria", { exact: true }).fill("102");
  await page.getByRole("button", { name: "Cargar cadena" }).click();
  await expect(page.locator(".lesson").getByRole("alert")).toContainText(
    "Usa entre 1 y 24 bits",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("Turning Red: pulsaciones, conexiones, ecuaciones e imposibilidad", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await openProblem(page, "Turning Red");
  await page.getByRole("button", { name: "05 Laboratorio" }).click();
  await page.getByRole("button", { name: "Pulsar B1", exact: true }).click();
  await expect(
    page.getByText("1 pulsaciones · Sigue experimentando"),
  ).toBeVisible();
  await page.getByRole("button", { name: "← Deshacer", exact: true }).click();
  await page.getByText("Editar colores y conexiones", { exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Conectar B1 con L4", exact: true })
    .check();
  await expect(
    page.getByRole("checkbox", { name: "Conectar B1 con L4", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Ecuaciones", exact: true }).click();
  await expect(page.locator(".equations")).toContainText("x1 + x3");
  await page.getByRole("button", { name: "Grafo", exact: true }).click();
  await expect(
    page.getByRole("img", { name: "Grafo de restricciones entre botones" }),
  ).toBeVisible();
  await page
    .getByLabel("Caso de Turning Red")
    .selectOption({ label: "Oficial 1 · 8" });
  await page.getByRole("button", { name: "Algoritmo", exact: true }).click();
  await page.getByRole("button", { name: "Calcular y abrir la traza" }).click();
  await expect(
    page.getByText("8 pulsaciones mínimas", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Caso de Turning Red")
    .selectOption({ label: "Imposible: sin botones" });
  await page.getByRole("button", { name: "Calcular y abrir la traza" }).click();
  await expect(page.locator(".notice")).toContainText("impossible");
  await page
    .getByRole("button", { name: "Paso siguiente", exact: true })
    .click();
  await expect(page.locator(".trace-explanation")).toContainText(
    "Luz sin control",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("apuntes, respuestas, ejercicio, estado y tema persisten al recargar", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await openProblem(page, "Compression");
  await page
    .getByLabel("Mis apuntes", { exact: true })
    .fill("Los extremos y los símbolos sobreviven.");
  await page.getByLabel("Mi estado", { exact: true }).selectOption("2");
  await page.getByRole("button", { name: "02 Pensar" }).click();
  await page
    .locator(".guided-question textarea")
    .first()
    .fill("Eliminar una copia de 11.");
  await page.getByRole("button", { name: "Necesito una pista" }).click();
  await expect(page.locator(".reveal")).toContainText(
    "Observa qué ocurre en los extremos",
  );
  await page.getByRole("button", { name: "07 Comprobar" }).click();
  await page.getByRole("radio", { name: "C 010" }).check();
  await page.getByRole("button", { name: "Comprobar razonamiento" }).click();
  await expect(page.getByRole("status")).toContainText("La idea es correcta");
  await page.getByRole("button", { name: "Activar modo oscuro" }).click();
  await page.reload();
  await openProblem(page, "Compression");
  await expect(page.getByLabel("Mis apuntes", { exact: true })).toHaveValue(
    "Los extremos y los símbolos sobreviven.",
  );
  await expect(page.getByLabel("Mi estado", { exact: true })).toHaveValue("2");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "02 Pensar" }).click();
  await expect(page.locator(".guided-question textarea").first()).toHaveValue(
    "Eliminar una copia de 11.",
  );
});
test("temporizador oral permite ocultar, pausar, reiniciar y terminar", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await openProblem(page, "Compression");
  await page.getByRole("button", { name: "08 Exponer" }).click();
  await expect(page.getByRole("timer")).toHaveText("5:00");
  await expect(
    page.getByText(
      "Defino XX → X y busco una cadena final de longitud mínima.",
      { exact: true },
    ),
  ).not.toBeVisible();
  await page
    .getByRole("checkbox", { name: "Practicar sin mostrar el guion" })
    .uncheck();
  await expect(
    page.getByText(
      "Defino XX → X y busco una cadena final de longitud mínima.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Iniciar práctica" }).click();
  await page.clock.fastForward(46000);
  await expect(page.getByRole("timer")).toHaveText("4:14");
  await expect(page.locator(".oral-timer")).toContainText("Modelado");
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  await page.clock.fastForward(10000);
  await expect(page.getByRole("timer")).toHaveText("4:14");
  await page.getByRole("button", { name: "Iniciar práctica" }).click();
  await page.clock.fastForward(254000);
  await expect(page.getByRole("timer")).toHaveText("0:00");
  await page.getByRole("button", { name: "Reiniciar", exact: true }).click();
  await expect(page.getByRole("timer")).toHaveText("5:00");
});
