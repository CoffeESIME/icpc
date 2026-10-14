import { test, expect, type Page } from "@playwright/test";
import { problems } from "../src/data/problems";
async function open(page: Page, name: string) {
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
  await page.getByRole("button", { name: "04 Construir", exact: true }).click();
}
test("eleven modules expose hidden code, detailed steps, source and recoverable exercises", async ({
  page,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  for (const problem of problems) {
    await open(page, problem.name);
    const section = page.getByRole("region", { name: "De la idea al código" });
    await expect(section.locator(".source-code")).toHaveCount(0);
    await section
      .getByRole("button", {
        name: "Terminar intento y ver pseudocódigo",
        exact: true,
      })
      .click();
    await expect(
      section.locator(".implementation-steps > li").first(),
    ).toBeVisible();
    await section
      .getByRole("button", { name: "Código completo", exact: true })
      .click();
    await expect(section.locator(".source-code")).toHaveCount(0);
    await section
      .getByRole("button", {
        name: "Terminar intento y ver código completo",
        exact: true,
      })
      .click();
    await expect(section.locator(".source-code").first()).toBeVisible();
    await expect(
      section
        .getByRole("link", { name: /Descargar src\/algorithms\// })
        .first(),
    ).toHaveAttribute("href", /\/reference\/.*\.ts\.txt/);
    await section
      .getByRole("button", { name: "Completar código", exact: true })
      .click();
    await section
      .getByLabel("Expresión para el hueco 1", { exact: true })
      .fill("mi intento");
    await section
      .getByRole("button", { name: "Comprobar hueco 1", exact: true })
      .click();
    await section
      .getByRole("button", {
        name: "Terminar intento y revelar solución",
        exact: true,
      })
      .first()
      .click();
    await expect(section.locator(".feedback").first()).toBeVisible();
    await section
      .getByRole("button", { name: "Ejecución", exact: true })
      .click();
    await section
      .getByRole("button", {
        name: "Terminar intento y ver ejecución",
        exact: true,
      })
      .click();
    await expect(section.locator(".notice").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});
test("Python is available in all eleven modules and the language choice persists", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto("/");
  for (const problem of problems) {
    await open(page, problem.name);
    const section = page.getByRole("region", { name: "De la idea al código" });
    await section
      .getByRole("button", { name: "Código completo", exact: true })
      .click();
    await section.getByRole("button", { name: "Python", exact: true }).click();
    await expect(section.locator(".source-code")).toHaveCount(0);
    await section
      .getByRole("button", {
        name: "Terminar intento y ver código completo",
        exact: true,
      })
      .click();
    await expect(
      section.getByRole("button", { name: "Python", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      section.locator(".python-reference .source-code"),
    ).toContainText("def ");
    const link = section.getByRole("link", {
      name: /Descargar src\/algorithms\/python\//,
    });
    const response = await page.request.get((await link.getAttribute("href"))!);
    expect(response.ok()).toBe(true);
    expect(await response.text()).toContain('if __name__ == "__main__":');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await section
      .getByRole("button", { name: "TypeScript", exact: true })
      .click();
    await expect(section.locator(".python-reference")).toHaveCount(0);
    await expect(section.locator(".source-code").first()).toContainText(
      "export function",
    );
    await section.getByRole("button", { name: "Python", exact: true }).click();
  }
  await page.reload();
  await open(page, "Compression");
  const section = page.getByRole("region", { name: "De la idea al código" });
  await section
    .getByRole("button", { name: "Código completo", exact: true })
    .click();
  await expect(
    section.getByRole("button", { name: "Python", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(section.locator(".source-code")).toHaveCount(0);
});
test("Compression direct execution follows source lines; attempts persist, solutions reset", async ({
  page,
}) => {
  await page.goto("/");
  await open(page, "Compression");
  let section = page.getByRole("region", { name: "De la idea al código" });
  await section
    .getByRole("button", { name: "Completar código", exact: true })
    .click();
  await section
    .getByLabel("Expresión para el hueco 1", { exact: true })
    .fill("s.length - 1");
  await section
    .getByRole("button", { name: "Comprobar hueco 1", exact: true })
    .click();
  await expect(section.getByRole("status")).toContainText("Coincide");
  await section.getByRole("button", { name: "Ejecución", exact: true }).click();
  await section
    .getByRole("button", {
      name: "Terminar intento y ver ejecución",
      exact: true,
    })
    .click();
  await expect(section.locator(".source-active")).toContainText(
    "let different = false;",
  );
  await section
    .getByRole("button", { name: "Paso siguiente", exact: true })
    .click();
  await expect(section.locator(".source-active")).toContainText(
    "if (s[i] !== first)",
  );
  for (const input of ["0000", "0011", "0010100"]) {
    await section.getByLabel("Cadena para la ejecución directa").fill(input);
    await section
      .getByLabel("Paso de ejecución")
      .fill(String(input.length + 1));
    await expect(section.locator(".source-active")).toContainText(
      "return result;",
    );
  }
  await section.getByLabel("Cadena para la ejecución directa").fill("012");
  await expect(section.getByRole("alert")).toContainText("bits");
  await page.reload();
  await open(page, "Compression");
  section = page.getByRole("region", { name: "De la idea al código" });
  await expect(section.locator(".source-code")).toHaveCount(0);
  await section
    .getByRole("button", { name: "Completar código", exact: true })
    .click();
  await expect(
    section.getByLabel("Expresión para el hueco 1", { exact: true }),
  ).toHaveValue("s.length - 1");
});
