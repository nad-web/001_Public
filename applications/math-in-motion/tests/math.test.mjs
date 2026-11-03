import { test } from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../tools/load-catalog.mjs';

test('every bilingual lab renders finite, labeled scenes at default and boundary inputs', () => {
  const { lessons, labs, build } = catalog;
  for (const {id} of lessons) {
    const knobs = labs[id].controls;
    assert(knobs.length > 0);
    const entries = knobs.map(k=>[k.min,k.initial,k.max]);
    const allInputs = entries.reduce((prev,choices)=>prev.flatMap(a=>choices.map(b=>[...a,b])),[[]]);
    for (const lang of ['en','de']) for(const values of allInputs) {
      const { marks, note } = build(id,values,lang);
      assert(marks.length>0,`${id} has no scene`);
      assert(note && !/NaN|Infinity|undefined/.test(note),`${id}: ${note}`);
      assert(marks.flat(Infinity).filter(x=>typeof x==='number').every(Number.isFinite),`${id} has an invalid coordinate`);
    }
  }
});

test('worked examples produce their expected values', () => {
  const note = (id,v,lang='en') => catalog.build(id,v,lang).note;
  assert.equal(note('fractions',[3,4]),'3/4 = 0.75');
  assert.equal(note('division',[14,3]),'14 = 4 × 3 + 2 · remainder 2');
  assert.equal(note('pythagoras',[3,4]),'3² + 4² = 25 · c = 5');
  assert.match(note('compound-interest',[1000,5,3],'de'),/1157,63/);
  assert.match(note('quadratic-roots',[6]),/2 \/ 3/);
  assert.match(note('derivative',[2,.25]),/4\.25.*= 4$/);
  assert.match(note('determinant',[2,3]),/det A = 6/);
  assert.match(note('gradient-descent',[.25,2]),/0\.75/);
  assert.match(note('black-scholes',[20,100]),/7\.97/);
  assert.match(note('jensen',[3]),/4 ≤ 5/);
  assert.match(note('backpropagation',[2]),/= 16$/);
  assert.match(note('hypothesis-test',[1.96]),/0\.05/);
});
