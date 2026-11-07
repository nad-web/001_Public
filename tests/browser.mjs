/** Optional local engine checks. Install Playwright separately; not run by npm test. */
import assert from "node:assert/strict";
import { buildRepository } from "../scripts/build.mjs";
import { discoverApps } from "../scripts/lib.mjs";
import { createStaticServer } from "../scripts/serve.mjs";
const engines = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const engine = process.env.BROWSER || "chromium";
assert(
  ["chromium", "firefox", "webkit"].includes(engine),
  "BROWSER must be chromium, firefox or webkit.",
);
const { output } = await buildRepository(),
  apps = await discoverApps(),
  server = createStaticServer({ root: output, basePath: "/001_Public/" });
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}/001_Public/`;
let browser,
  checks = 0;
try {
  browser = await engines[engine].launch({ headless: true });
  for (const width of [320, 390, 1440]) {
    const context = await browser.newContext({
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
      }),
      page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base + "applications/");
    await page.locator(".app-card").first().waitFor();
    assert.equal(await page.locator(".app-card").count(), apps.length);
    for (const app of apps) {
      await page.goto(base + "applications/" + app.id + "/");
      await page.locator("h1").first().waitFor();
      if (!["sankey-diagram", "math-in-motion", "memory-game"].includes(app.id))
        await page.locator("#app .panel").first().waitFor();
      const size = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      assert(
        size.scroll <= size.width + 1,
        `${app.id} overflows at ${width}px`,
      );
      checks++;
    }
    assert.deepEqual(errors, [], "No uncaught app errors");
    await context.close();
  }
  const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    }),
    page = await context.newPage();
  await page.goto(base + "applications/json-workbench/");
  await page
    .getByLabel("JSON to inspect", { exact: true })
    .fill('{"n":9007199254740993,"n":1e+09}');
  await page.getByRole("button", { name: "Format JSON", exact: true }).click();
  const output = await page.locator("#json-output").innerText();
  assert(output.includes("9007199254740993") && output.includes("1e+09"));
  checks++;
  await page.goto(base + "applications/pocket-budget/");
  await page
    .getByRole("button", { name: "Keep this app ↗", exact: true })
    .click();
  await page
    .locator("#offline-status")
    .filter({ hasText: "ready for offline" })
    .waitFor({ timeout: 30000 });
  await context.setOffline(true);
  await page.reload();
  await page.locator("#app .panel").first().waitFor();
  checks++;
  await context.close();
  console.log(
    JSON.stringify(
      { engine, checks, passed: true, physicalIPhone: false },
      null,
      2,
    ),
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
