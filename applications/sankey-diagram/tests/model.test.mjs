import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProject, projectFile, parseDelimited, toCSV, totals, exportSize, clone } from '../src/model.js';
import { SAMPLES, fromSample, blankProject } from '../src/samples.js';
import { createLayout, positionNode } from '../src/layout.js';

test('all Sankey templates are balanced, finite and proportional', () => {
  for (const sample of SAMPLES) {
    const project = fromSample(sample.id), graph = createLayout(project);
    assert.deepEqual(totals(project).imbalances, []);
    const ratios = graph.links.map((l) => l.width / l.value);
    for (const ratio of ratios) assert.ok(Math.abs(ratio - ratios[0]) < 1e-8);
    for (const n of graph.nodes) {
      assert.ok([n.x0, n.x1, n.y0, n.y1].every(Number.isFinite));
      assert.ok(n.x1 > n.x0 && n.y1 >= n.y0);
      assert.ok(n.y0 >= graph.extent[0][1] - 1e-6);
      assert.ok(n.y1 <= graph.extent[1][1] + 1e-6);
    }
  }
});
test('source totals do not count the same money at each stage', () => {
  const p = fromSample('income');
  assert.equal(totals(p).sourceTotal, 5400);
  assert.equal(totals(p).sinkTotal, 5400);
  assert.ok(p.links.reduce((v, l) => v + l.value, 0) > 5400);
});
test('dense diagrams retain positive node and ribbon sizes at the supported node limit', () => {
  const nodes = Array.from({ length: 120 }, (_, i) => ({ id: 'node-' + i, label: 'Node ' + i, color: '' }));
  const links = nodes.slice(1).map((n, i) => ({ id: 'flow-' + i, source: nodes[0].id, target: n.id, value: 1 }));
  const graph = createLayout({ nodes, links });
  assert.ok(graph.effectiveGap < graph.settings.nodeGap);
  assert.ok(graph.links.every((l) => l.width > 0));
  assert.ok(graph.nodes.every((n) => n.y1 > n.y0 && Number.isFinite(n.y0)));
});
test('editable project round-trip retains theme, colours and manual positions', () => {
  const p = fromSample('income');
  p.settings.theme = 'midnight'; p.settings.background = '#123456';
  p.nodes[0].color = '#abcdef'; p.nodes[0].position = { y: 0.35 }; p.links[0].color = '#fedcba';
  assert.deepEqual(normalizeProject(JSON.parse(JSON.stringify(projectFile(p)))), p);
});
test('invalid graphs are rejected before layout', () => {
  const p = fromSample('energy');
  const invalidValue = (value) => { const c = clone(p); c.links[0].value = value; return c; };
  for (const value of [-1, NaN, Infinity, 1e16, '12', null])
    assert.throws(() => normalizeProject(invalidValue(value)), /Flow value/);
  const self = clone(p); self.links[0].target = self.links[0].source;
  assert.throws(() => createLayout(self), /itself/);
  const missing = clone(p); missing.links[0].target = 'missing';
  assert.throws(() => createLayout(missing), /existing/);
  const cyclic = clone(p); cyclic.links.push({ id: 'cycle', source: cyclic.links[0].target, target: cyclic.links[0].source, value: 1 });
  assert.throws(() => createLayout(cyclic), /Circular/);
  const duplicate = clone(p); duplicate.nodes[1].id = duplicate.nodes[0].id;
  assert.throws(() => normalizeProject(duplicate), /unique/);
  const duplicateLabel = clone(p); duplicateLabel.nodes[1].label = duplicateLabel.nodes[0].label.toUpperCase();
  assert.throws(() => normalizeProject(duplicateLabel), /different label/);
});
test('unbalanced flows are reported and their actual values are retained', () => {
  const p = parseDelimited('source,target,value\nA,B,100\nB,C,75');
  assert.equal(totals(p).imbalances[0].incoming, 100);
  assert.equal(totals(p).imbalances[0].outgoing, 75);
  assert.equal(p.links.length, 2);
  assert.equal(totals(p).sourceTotal, 100);
  assert.equal(totals(p).sinkTotal, 75);
});
test('CSV parsing handles BOM, escaped quotes, newlines, tab rows and decimal comma', () => {
  const p = parseDelimited('\uFEFFsource,target,value\r\n"Salary, bonus","Annual ""income""",1234.5\r\n"Annual ""income""","Long\nlabel",100');
  assert.equal(p.nodes[0].label, 'Salary, bonus');
  assert.equal(p.nodes[1].label, 'Annual "income"');
  assert.equal(p.links[0].value, 1234.5);
  assert.equal(parseDelimited('from;to;amount\nA;B;1,5').links[0].value, 1.5);
  assert.equal(parseDelimited('source\ttarget\tvalue\nA\tB\t2.25').links[0].value, 2.25);
  assert.equal(parseDelimited('"A; note",B,2').nodes[0].label, 'A; note');
  assert.throws(() => parseDelimited('source,target,value\nA,B,€20'), /nonnegative/);
  assert.throws(() => parseDelimited('source,target,value\n"A,B,1'), /not closed/);
});
test('CSV export neutralises spreadsheet formulas, JSON preserves exact labels', () => {
  const p = parseDelimited('source,target,value\n=SUM(A1),Target,2');
  assert.ok(toCSV(p).includes('"\'=SUM(A1)"'));
  assert.equal(normalizeProject(projectFile(p)).nodes[0].label, '=SUM(A1)');
});
test('empty and zero-only projects have stable empty layouts', () => {
  assert.equal(createLayout(blankProject()).nodes.length, 0);
  const p = fromSample('income'); p.links.forEach((l) => { l.value = 0; });
  assert.equal(createLayout(p).links.length, 0);
});
test('manual node movement is bounded and leaves weights unchanged', () => {
  const p = fromSample('income'), graph = createLayout(p), id = graph.nodes[0].id;
  const before = graph.links.map((l) => l.width);
  assert.equal(positionNode(graph, id, -10000), 0);
  assert.equal(positionNode(graph, id, 10000), 1);
  assert.deepEqual(graph.links.map((l) => l.width), before);
});
test('image limits protect mobile devices and preserve aspect ratio', () => {
  assert.deepEqual(exportSize(1440, 920, 2), { width: 2880, height: 1840 });
  assert.throws(() => exportSize(3200, 2400, 3), /too large/);
  assert.throws(() => exportSize(0, 920, 2), /Invalid/);
});
test('control characters, unsafe colours and future file schemas are rejected', () => {
  const p = fromSample('income'); p.nodes[0].label = 'bad\u0000name';
  assert.throws(() => normalizeProject(p), /characters/);
  const c = fromSample('income'); c.nodes[0].color = 'url(https://example.com)';
  assert.throws(() => normalizeProject(c), /hex/);
  assert.throws(() => normalizeProject({ ...projectFile(fromSample('income')), schemaVersion: 100 }), /version/);
});
