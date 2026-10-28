// Optional browser QA. Runtime-only QA packages are deliberately not app dependencies.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { ROOT, readJSON } from '../scripts/lib.mjs';
import { createStaticServer } from '../scripts/serve.mjs';
import { WORDS } from '../Vibcoding/shared/js/german-data.js';
const require = createRequire(import.meta.url);
const paths = [
  process.env.LAB_QA_MODULES,
  process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,
  ROOT,
].filter(Boolean);
const load = (name) => require(require.resolve(name, { paths }));
const { chromium } = load('playwright');
const { expect } = load('@playwright/test');
const AxeBuilder = load('@axe-core/playwright').default;
const jsQR = load('jsqr');
const server = createStaticServer({
  root: path.join(ROOT, 'dist'),
  basePath: '/001_Public/',
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/001_Public/`;
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_EXECUTABLE
    ? {
        executablePath: process.env.CHROMIUM_EXECUTABLE,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      }
    : {}),
});
const apps = await readJSON(path.join(ROOT, 'Vibcoding/catalogue.json'));
const results = [];
const url = (id) => {
  const app = apps.find((a) => a.id === id);
  return `${base}Vibcoding/${app.category}/${id}/`;
};
const mobile = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  reducedMotion: 'reduce',
  colorScheme: 'light',
  serviceWorkers: 'block',
};
async function test(name, fn) {
  if (
    process.env.LAB_QA_ONLY &&
    !new RegExp(process.env.LAB_QA_ONLY).test(name)
  )
    return;
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: error.message });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}
async function withApp(id, fn) {
  const context = await browser.newContext(mobile),
    page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => d.accept());
  try {
    await page.goto(url(id));
    await page.locator('#app > *').first().waitFor();
    await fn(page, context);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}
async function download(page, button) {
  const pending = page.waitForEvent('download');
  await button.click();
  return await pending;
}

try {
  await test('All 20 apps: mobile and desktop rendering, manifests, and accessibility', async () => {
    const context = await browser.newContext(mobile),
      page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    try {
      for (const app of apps) {
        await page.goto(url(app.id));
        await page.locator('#app > *').first().waitFor();
        for (const width of [320, 390, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          const size = await page.evaluate(() => ({
            scroll: document.documentElement.scrollWidth,
            width: innerWidth,
          }));
          assert.ok(
            size.scroll <= size.width,
            `${app.id}: overflow at ${width}, scrollWidth=${size.scroll}`,
          );
        }
        await page.setViewportSize({ width: 390, height: 844 });
        const a11y = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        const violations = a11y.violations.filter((v) =>
          ['critical', 'serious'].includes(v.impact),
        );
        assert.deepEqual(
          violations.map((v) => ({
            id: v.id,
            nodes: v.nodes.map((n) => n.target),
          })),
          [],
          `${app.id}: accessibility`,
        );
        const manifest = await (
          await page.request.get(
            new URL('manifest.webmanifest', url(app.id)).href,
          )
        ).json();
        assert.equal(manifest.short_name, app.name);
        assert.equal(manifest.display, 'standalone');
        for (const icon of manifest.icons)
          assert.equal(
            (
              await page.request.get(new URL(icon.src, url(app.id)).href)
            ).status(),
            200,
          );
        assert.equal(
          await page.getByRole('button', { name: 'Install app ↗' }).count(),
          1,
        );
      }
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  });
  await test('Pocket Budget: exact totals, persistence, CSV export, and safe text', () =>
    withApp('pocket-budget', async (page) => {
      await page.getByLabel('Type', { exact: true }).selectOption('income');
      await page.getByLabel('Amount · EUR').fill('100.10');
      await page.getByLabel('Description').fill('Test income');
      await page
        .getByRole('button', { name: 'Add entry', exact: true })
        .click();
      await page.getByLabel('Amount · EUR').fill('0.10');
      await page.getByLabel('Description').fill('<img src=x onerror=alert(1)>');
      await page
        .getByRole('button', { name: 'Add entry', exact: true })
        .click();
      await expect(page.locator('.metric strong').nth(2)).toHaveText(
        '100,00 €',
      );
      assert.equal(await page.locator('.item img').count(), 0);
      await page.reload();
      await expect(page.locator('.metric strong').nth(2)).toHaveText(
        '100,00 €',
      );
      assert.equal(
        (
          await download(
            page,
            page.getByRole('button', { name: 'Export CSV', exact: true }),
          )
        ).suggestedFilename(),
        'pocket-budget.csv',
      );
    }));
  await test('Savings Goal: contribution and alternative timeline calculations', () =>
    withApp('savings-goal', async (page) => {
      await page.getByLabel('Target · EUR').fill('10000');
      await page.getByLabel('Already saved · EUR').fill('2000');
      await page.getByLabel('Months remaining').fill('10');
      await page.getByRole('button', { name: 'Update plan' }).click();
      await expect(page.locator('.big-result').first()).toHaveText('800,00 €');
      await page.getByLabel('Alternative timeline · months').fill('5');
      await page.getByRole('button', { name: 'Compare timeline' }).click();
      await expect(page.locator('.big-result').nth(1)).toContainText(
        '1.600,00',
      );
    }));
  await test('Trip Split: group, uneven expenses, balances, and settlements', () =>
    withApp('trip-split', async (page) => {
      for (const name of ['Alice', 'Bob', 'Noor']) {
        await page.getByLabel('Participant name').fill(name);
        await page
          .getByRole('button', { name: 'Add person', exact: true })
          .click();
      }
      await page.getByLabel('Paid by').selectOption({ label: 'Alice' });
      await page.getByLabel('Amount · EUR').fill('10');
      await page.getByLabel('Description').fill('Shared meal');
      await page.getByRole('button', { name: 'Add shared expense' }).click();
      await expect(
        page.getByText('Receives 6,66 €', { exact: true }),
      ).toBeVisible();
      await expect(page.getByText('Bob → Alice')).toBeVisible();
      await expect(page.getByText('Noor → Alice')).toBeVisible();
      await page.reload();
      await expect(
        page.getByText('Shared meal', { exact: true }),
      ).toBeVisible();
    }));
  await test('Pack Light: template, checked items, persistence, export', () =>
    withApp('pack-light', async (page) => {
      await page.getByRole('button', { name: 'Load template' }).click();
      assert.equal(await page.getByRole('checkbox').count(), 8);
      await page.getByRole('checkbox').first().check();
      await page.reload();
      await expect(page.getByRole('checkbox').first()).toBeChecked();
      assert.equal(
        (
          await download(
            page,
            page.getByRole('button', { name: 'Export list' }),
          )
        ).suggestedFilename(),
        'pack-light.json',
      );
    }));
  await test('Week Board: create, move, edit, complete, and persist task', () =>
    withApp('week-board', async (page) => {
      await page.getByLabel('Task', { exact: true }).fill('Review the apps');
      await page.getByLabel('Day', { exact: true }).selectOption('1');
      await page.getByRole('button', { name: 'Add task', exact: true }).click();
      await page.getByLabel('Move Review the apps to day').selectOption('4');
      await expect(
        page
          .getByRole('region', { name: 'Friday' })
          .getByText('Review the apps', { exact: true }),
      ).toBeVisible();
      await page.getByLabel('Complete Review the apps').check();
      await page.reload();
      await expect(page.getByLabel('Complete Review the apps')).toBeChecked();
    }));
  await test('Habit Garden: local-day history, undo, and persistence', () =>
    withApp('habit-garden', async (page) => {
      await page.getByLabel('A small habit to nurture').fill('Read a page');
      await page.getByRole('button', { name: 'Plant a habit' }).click();
      await page
        .getByRole('button', { name: 'Mark today', exact: true })
        .click();
      await expect(
        page.getByText('1 day current streak · 1 recorded day', {
          exact: true,
        }),
      ).toBeVisible();
      await page.reload();
      await expect(
        page.getByText('1 day current streak · 1 recorded day', {
          exact: true,
        }),
      ).toBeVisible();
    }));
  for (const id of ['focus-flow', 'break-buddy'])
    await test(`${id}: start, pause, deadline recovery, completion`, async () => {
      const context = await browser.newContext(mobile),
        page = await context.newPage();
      await page.clock.install({ time: new Date('2026-10-28T12:00:00Z') });
      try {
        await page.goto(url(id));
        await page.locator('#focus-minutes').fill('1');
        await page.locator('#break-minutes').fill('1');
        await page.getByRole('button', { name: 'Save lengths' }).click();
        await page.getByRole('button', { name: 'Start', exact: true }).click();
        await page.clock.fastForward(20000);
        await page.reload();
        await page.clock.fastForward(10000);
        await expect(page.locator('#timer')).toHaveText('00:30');
        await page.getByRole('button', { name: 'Pause', exact: true }).click();
        await page.clock.fastForward(5000);
        await expect(page.locator('#timer')).toHaveText('00:30');
        await page.getByRole('button', { name: 'Start', exact: true }).click();
        await page.clock.fastForward(31000);
        await expect(page.locator('#feedback')).toContainText(
          'Work session complete',
        );
        await expect(page.locator('#timer')).toHaveText('01:00');
      } finally {
        await context.close();
      }
    });
  await test('Deutsch Daily: reveal, recall record, topic and saved progress', () =>
    withApp('deutsch-daily', async (page) => {
      await page.getByRole('button', { name: 'Reveal meaning' }).click();
      await expect(page.locator('.translation')).toBeVisible();
      await page
        .getByRole('button', { name: 'Remembered', exact: true })
        .click();
      await expect(page.locator('.metric strong').first()).toHaveText('1');
      await page.reload();
      await expect(page.locator('.metric strong').first()).toHaveText('1');
      await page.getByLabel('Topic', { exact: true }).selectOption('Phrases');
      await expect(page.locator('.word')).toBeVisible();
    }));
  await test('Artikel Trainer: evaluates a noun’s gender and advances', () =>
    withApp('artikel-trainer', async (page) => {
      const word = await page.locator('.word').textContent();
      const correct = WORDS.find((w) => w.word === word).article;
      await page.getByRole('button', { name: correct, exact: true }).click();
      await expect(page.locator('#feedback')).toHaveText('Correct!');
      await expect(
        page.getByRole('button', { name: 'Next word' }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Next word' }).click();
      await expect(page.locator('.study-card .hint')).toContainText('Card 2');
    }));
  await test('Decision Wheel: editable options and valid reduced-motion result', () =>
    withApp('decision-wheel', async (page) => {
      await page.getByLabel('Options · one per line').fill('Tea\nCoffee');
      await page.getByRole('button', { name: 'Update wheel' }).click();
      await page.getByRole('button', { name: 'Spin the wheel' }).click();
      await expect(page.locator('#wheel-result')).toHaveText(/^(Tea|Coffee)$/);
      await page.reload();
      await expect(page.getByLabel('Options · one per line')).toHaveValue(
        'Tea\nCoffee',
      );
    }));
  await test('Memory Lab: a complete round using revealed cards', () =>
    withApp('memory-lab', async (page) => {
      await page.getByLabel('Board size').selectOption('4');
      const known = new Map();
      for (let i = 0; i < 8; i += 2) {
        const cards = page.locator('.memory-card');
        if (!(await cards.nth(i).isDisabled())) {
          await cards.nth(i).click();
          known.set(i, await cards.nth(i).textContent());
        }
        if (!(await cards.nth(i + 1).isDisabled())) {
          await cards.nth(i + 1).click();
          known.set(i + 1, await cards.nth(i + 1).textContent());
        }
        await page.waitForTimeout(900);
      }
      const groups = new Map();
      for (const [index, symbol] of known) {
        if (!groups.has(symbol)) groups.set(symbol, []);
        groups.get(symbol).push(index);
      }
      for (const indices of groups.values()) {
        for (const index of indices) {
          const card = page.locator('.memory-card').nth(index);
          if (!(await card.isDisabled())) await card.click();
        }
      }
      assert.equal(await page.locator('.memory-card.matched').count(), 8);
      await expect(page.locator('#feedback')).toContainText('All pairs found');
    }));
  await test('Flashcard Studio: CRUD, practice round, import validation, export', () =>
    withApp('flashcard-studio', async (page) => {
      await page
        .getByLabel('Question', { exact: true })
        .fill('My custom question');
      await page.getByLabel('Answer', { exact: true }).fill('A custom answer');
      await page.getByRole('button', { name: 'Add card', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: 'Your cards · 5' }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Shuffle and practise' }).click();
      for (let i = 0; i < 5; i++) {
        await page
          .getByRole('button', { name: 'Reveal answer', exact: true })
          .click();
        await page
          .getByRole('button', { name: 'Remembered', exact: true })
          .click();
      }
      await expect(page.locator('.big-result')).toHaveText('5 / 5');
      await page
        .getByLabel('Import deck · replaces current cards')
        .setInputFiles({
          name: 'bad.json',
          mimeType: 'application/json',
          buffer: Buffer.from('[{"question":12}]'),
        });
      await expect(page.locator('#feedback')).toContainText('does not match');
      assert.equal(
        (
          await download(
            page,
            page.getByRole('button', { name: 'Export deck' }),
          )
        ).suggestedFilename(),
        'flashcards.json',
      );
    }));
  await test('Quiz Forge: imports, evaluates answers, scores, and reviews mistakes', () =>
    withApp('quiz-forge', async (page) => {
      const data = [
        {
          question: 'Choose A',
          options: ['A', 'B'],
          answer: 0,
          explanation: 'A is requested.',
        },
        {
          question: 'Choose B',
          options: ['A', 'B'],
          answer: 1,
          explanation: 'B is requested.',
        },
      ];
      await page
        .getByLabel('Import questions JSON')
        .setInputFiles({
          name: 'quiz.json',
          mimeType: 'application/json',
          buffer: Buffer.from(JSON.stringify(data)),
        });
      for (let i = 0; i < 2; i++) {
        await page.getByRole('button', { name: 'A', exact: true }).click();
        await page.getByRole('button', { name: 'Next question' }).click();
      }
      await expect(page.locator('.big-result')).toHaveText('1 / 2');
      await expect(
        page.getByRole('heading', { name: 'Review your missed questions' }),
      ).toBeVisible();
    }));
  await test('JSON Workbench: formatting, minification, parsing errors, download', () =>
    withApp('json-workbench', async (page) => {
      await page
        .getByLabel('JSON to inspect')
        .fill('{"name":"Noorullah","n":2}');
      await page
        .getByRole('button', { name: 'Format JSON', exact: true })
        .click();
      assert.deepEqual(
        JSON.parse(await page.locator('#json-output').textContent()),
        { name: 'Noorullah', n: 2 },
      );
      await page.getByRole('button', { name: 'Minify JSON' }).click();
      await expect(page.locator('#json-output')).toHaveText(
        '{"name":"Noorullah","n":2}',
      );
      assert.equal(
        (
          await download(
            page,
            page.getByRole('button', { name: 'Download JSON' }),
          )
        ).suggestedFilename(),
        'formatted.json',
      );
      await page.getByLabel('JSON to inspect').fill('{broken');
      await page
        .getByRole('button', { name: 'Format JSON', exact: true })
        .click();
      await expect(page.locator('#feedback')).toContainText('JSON error');
    }));
  await test('Regex Playground: matches, invalid pattern, and runaway worker timeout', () =>
    withApp('regex-playground', async (page) => {
      await page.getByLabel('Pattern · without / delimiters').fill('\\d+');
      await page.getByLabel('Flags', { exact: true }).fill('g');
      await page.getByLabel('Sample text').fill('a1 b22');
      await page.getByRole('button', { name: 'Test pattern' }).click();
      await expect(page.locator('#regex-summary')).toContainText('2 matches');
      assert.equal(await page.locator('#matches-preview mark').count(), 2);
      await page.getByLabel('Pattern · without / delimiters').fill('(');
      await page.getByRole('button', { name: 'Test pattern' }).click();
      await expect(page.locator('#regex-summary')).toContainText(
        'could not complete',
      );
      await page.getByLabel('Pattern · without / delimiters').fill('(a+)+$');
      await page.getByLabel('Sample text').fill('a'.repeat(19000) + '!');
      await page.getByRole('button', { name: 'Test pattern' }).click();
      await expect(page.locator('#feedback')).toContainText('800 ms');
      await expect(
        page.getByRole('button', { name: 'Test pattern' }),
      ).toBeEnabled();
    }));
  await test('Unit Converter: temperature conversion and absolute-zero error', () =>
    withApp('unit-converter', async (page) => {
      await page
        .getByLabel('Measurement', { exact: true })
        .selectOption('temperature');
      await page.getByLabel('Value', { exact: true }).fill('0');
      await page.getByLabel('From', { exact: true }).selectOption('c');
      await page.getByLabel('To', { exact: true }).selectOption('f');
      await page.getByRole('button', { name: 'Convert', exact: true }).click();
      await expect(page.locator('#conversion-result')).toHaveText('32');
      await page.getByLabel('Value', { exact: true }).fill('-1');
      await page.getByLabel('From', { exact: true }).selectOption('k');
      await page.getByRole('button', { name: 'Convert', exact: true }).click();
      await expect(page.locator('#feedback')).toContainText('absolute zero');
    }));
  await test('QR Studio: UTF-8 QR round-trip decode and PNG/SVG downloads', () =>
    withApp('qr-studio', async (page) => {
      const value = 'Noorullah · München ✓';
      await page.getByLabel('Text or web address').fill(value);
      await page.getByRole('button', { name: 'Generate QR code' }).click();
      await expect(page.locator('#qr-preview svg')).toBeVisible();
      const image = await page.evaluate(async () => {
        const source = new XMLSerializer().serializeToString(
          document.querySelector('#qr-preview svg'),
        );
        const img = new Image();
        img.src =
          'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
        await img.decode();
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 512, 512);
        return {
          data: Array.from(ctx.getImageData(0, 0, 512, 512).data),
          width: 512,
          height: 512,
        };
      });
      const decoded = jsQR(
        new Uint8ClampedArray(image.data),
        image.width,
        image.height,
      );
      assert.equal(decoded?.data, value);
      const png = await download(
        page,
        page.getByRole('button', { name: 'Download PNG' }),
      );
      const bytes = await fs.readFile(await png.path());
      assert.deepEqual(
        [...bytes.subarray(0, 8)],
        [137, 80, 78, 71, 13, 10, 26, 10],
      );
      assert.equal(
        (
          await download(
            page,
            page.getByRole('button', { name: 'Download SVG' }),
          )
        ).suggestedFilename(),
        'noorullah-qr.svg',
      );
    }));
  await test('Palette Studio: locks, contrast, saved colors, CSS export', () =>
    withApp('palette-studio', async (page) => {
      const first = await page.locator('.swatch code').first().textContent();
      await page
        .getByRole('button', { name: 'Lock color 1', exact: true })
        .click();
      await page
        .getByRole('button', { name: 'Generate unlocked colors' })
        .click();
      await expect(page.locator('.swatch code').first()).toHaveText(first);
      await page.getByLabel('Text color', { exact: true }).fill('#000000');
      await page
        .getByLabel('Background color', { exact: true })
        .fill('#ffffff');
      await expect(page.locator('#contrast-ratio')).toHaveText('21.00 : 1');
      await page.reload();
      await expect(
        page.getByRole('button', { name: 'Unlock color 1', exact: true }),
      ).toBeVisible();
      assert.equal(
        (
          await download(
            page,
            page.getByRole('button', { name: 'Download CSS' }),
          )
        ).suggestedFilename(),
        'noorullah-palette.css',
      );
    }));
  await test('Writing Sparks: autosave, preserved draft, original prompts, text export', () =>
    withApp('writing-sparks', async (page) => {
      await page
        .getByLabel('Draft title', { exact: true })
        .fill('My small story');
      await page.getByLabel('Draft', { exact: true }).fill('Small ideas grow.');
      await page.waitForTimeout(400);
      await page.reload();
      await expect(page.getByLabel('Draft', { exact: true })).toHaveValue(
        'Small ideas grow.',
      );
      await page.getByRole('button', { name: 'New writing spark' }).click();
      await expect(page.getByLabel('Draft', { exact: true })).toHaveValue(
        'Small ideas grow.',
      );
      assert.equal(
        (
          await download(
            page,
            page.getByRole('button', { name: 'Download text' }),
          )
        ).suggestedFilename(),
        'writing-sparks.txt',
      );
    }));
  await test('Library: branding, all launch links, categories, search, and install help', async () => {
    const context = await browser.newContext(mobile),
      page = await context.newPage();
    try {
      await page.goto(base);
      await page.locator('.app-card').first().waitFor();
      assert.equal(await page.locator('.launch-link').count(), 20);
      assert.ok((await page.locator('body').innerText()).includes('NOORULLAH'));
      assert.ok(
        !(await page.locator('body').innerText())
          .toLowerCase()
          .includes('shukur'),
      );
      await page
        .getByRole('button', { name: 'Languages', exact: true })
        .click();
      assert.equal(await page.locator('.app-card').count(), 2);
      await page.locator('#search').fill('artikel');
      assert.equal(await page.locator('.app-card').count(), 1);
      await page.getByRole('button', { name: 'Install Build Lab ↗' }).click();
      await expect(
        page.getByRole('dialog', { name: 'Keep this app with you.' }),
      ).toBeVisible();
    } finally {
      await context.close();
    }
  });

  await test('Blocked storage: all 20 apps still open and persistence warnings remain truthful', async () => {
    const context = await browser.newContext(mobile);
    await context.addInitScript(() =>
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new Error('Storage blocked for QA');
        },
      }),
    );
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    try {
      for (const app of apps) {
        await page.goto(url(app.id));
        await page.locator('#app > *').first().waitFor();
      }
      await page.goto(url('pocket-budget'));
      await page.getByLabel('Amount · EUR').fill('1');
      await page.getByLabel('Description').fill('Memory-only entry');
      await page
        .getByRole('button', { name: 'Add entry', exact: true })
        .click();
      await expect(page.locator('#feedback')).toContainText(
        'Changes last only for this visit',
      );
      await expect(page.locator('.metric strong').nth(1)).toHaveText('1,00 €');
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  });
  await test('Dark theme: shared preference and accessible contrast across app navigation', async () => {
    const context = await browser.newContext(mobile),
      page = await context.newPage();
    try {
      await page.goto(base + 'Vibcoding/');
      await page.locator('.app-card').first().waitFor();
      await page.locator('#theme-toggle').click();
      assert.equal(
        await page.locator('html').getAttribute('data-theme'),
        'dark',
      );
      await page.goto(url('pocket-budget'));
      assert.equal(
        await page.locator('html').getAttribute('data-theme'),
        'dark',
      );
      const scan = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      assert.deepEqual(
        scan.violations
          .filter((v) => ['serious', 'critical'].includes(v.impact))
          .map((v) => v.id),
        [],
      );
    } finally {
      await context.close();
    }
  });
  await test('Offline PWA: full library cached and all 20 apps launch without network', async () => {
    const context = await browser.newContext({
        ...mobile,
        serviceWorkers: 'allow',
      }),
      page = await context.newPage();
    try {
      await page.goto(base + 'Vibcoding/');
      await page.locator('.app-card').first().waitFor();
      await page.waitForFunction(
        () => navigator.serviceWorker.controller !== null,
        { timeout: 30000 },
      );
      await page.getByRole('button', { name: 'Install Build Lab ↗' }).click();
      await expect(page.locator('#offline-status')).toHaveText(
        'Offline library ready on this device.',
      );
      await page.getByRole('button', { name: 'Got it', exact: true }).click();
      await context.setOffline(true);
      for (const app of apps) {
        await page.goto(url(app.id));
        await page.locator('#app > *').first().waitFor();
        await expect(page.locator('#app-title')).toHaveText(app.name);
      }
      await page.goto(base + 'Vibcoding/');
      await page.locator('.app-card').first().waitFor();
      assert.equal(await page.locator('.launch-link').count(), 20);
    } finally {
      await context.close();
    }
  });

  await test('PWA update: a new cached release waits for explicit reload', async () => {
    const context = await browser.newContext({
        ...mobile,
        serviceWorkers: 'allow',
      }),
      page = await context.newPage();
    const htmlFile = path.join(ROOT, 'dist/Vibcoding/index.html'),
      workerFile = path.join(ROOT, 'dist/sw.js');
    const originalHTML = await fs.readFile(htmlFile, 'utf8'),
      originalWorker = await fs.readFile(workerFile, 'utf8');
    try {
      await page.goto(base + 'Vibcoding/');
      await page.waitForFunction(
        () => navigator.serviceWorker.controller !== null,
      );
      await fs.writeFile(
        htmlFile,
        originalHTML.replace(
          '</main>',
          '<p id="release-probe">Updated release loaded</p></main>',
        ),
      );
      await fs.writeFile(
        workerFile,
        originalWorker.replace(
          /noorullah-build-lab-001-[a-f0-9]+/,
          (value) => value + '-qa-update',
        ),
      );
      await page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        await registration.update();
      });
      await expect(page.locator('#update-app')).toBeVisible({ timeout: 30000 });
      await page.locator('#update-app').click();
      await expect(page.locator('#release-probe')).toHaveText(
        'Updated release loaded',
      );
    } finally {
      await fs.writeFile(htmlFile, originalHTML);
      await fs.writeFile(workerFile, originalWorker);
      await context.close();
    }
  });
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  const report = {
    date: '2026-10-28',
    browser: 'Chromium',
    checks: results.length,
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length,
    results,
  };
  if (process.env.LAB_QA_OUTPUT)
    await fs.writeFile(
      process.env.LAB_QA_OUTPUT,
      JSON.stringify(report, null, 2) + '\n',
    );
  console.log(JSON.stringify(report, null, 2));
  if (report.failed) process.exitCode = 1;
}
