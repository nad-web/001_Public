import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cents,
  splitCents,
  balances,
  settle,
  savings,
  convert,
  contrast,
  localDate,
  recentDates,
  isDateKey,
  remainingMs,
  csv,
  validCards,
  validQuiz,
  shuffle,
  randomIndex,
} from '../Vibcoding/shared/js/logic.js';
import { WORDS } from '../Vibcoding/shared/js/german-data.js';

test('money parsing preserves cents and rejects ambiguous or unsafe values', () => {
  assert.equal(cents('1.10'), 110);
  assert.equal(cents('12,5'), 1250);
  assert.equal(cents('0.01'), 1);
  assert.equal(cents('999999999.99'), 99999999999);
  for (const value of ['', '-1', '1.001', '1e5', 'Infinity', 'abc', '1,234.50'])
    assert.throws(() => cents(value));
});
test('every equal split conserves every cent and differs by at most one cent', () => {
  for (let people = 1; people <= 20; people++)
    for (const amount of [0, 1, 2, 5, 100, 10001, 99999999999]) {
      const shares = splitCents(amount, people);
      assert.equal(
        shares.reduce((a, b) => a + b, 0),
        amount,
      );
      assert.ok(Math.max(...shares) - Math.min(...shares) <= 1);
    }
});
test('trip balances settle exactly for uneven shared expenses', () => {
  const people = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const result = balances(people, [
    { paidBy: 'a', amount: 1000 },
    { paidBy: 'b', amount: 701 },
  ]);
  assert.equal(
    Object.values(result).reduce((a, b) => a + b, 0),
    0,
  );
  for (const transfer of settle(result)) {
    assert.ok(transfer.amount > 0);
    result[transfer.from] += transfer.amount;
    result[transfer.to] -= transfer.amount;
  }
  assert.deepEqual(Object.values(result), [0, 0, 0]);
  assert.throws(() => settle({ a: 3, b: -2 }));
});
test('trip settlement remains balanced for groups of all supported sizes', () => {
  for (let n = 2; n <= 20; n++) {
    const people = Array.from({ length: n }, (_, i) => ({ id: String(i) }));
    const expenses = people.map((p, i) => ({
      paidBy: p.id,
      amount: 251 + i * 13,
    }));
    const result = balances(people, expenses);
    for (const t of settle(result)) {
      result[t.from] += t.amount;
      result[t.to] -= t.amount;
    }
    assert.ok(Object.values(result).every((v) => v === 0));
  }
});
test('savings contributions round up, handle completed targets, and validate months', () => {
  assert.deepEqual(savings(10000, 0, 3), {
    remaining: 10000,
    monthly: 3334,
    progress: 0,
  });
  assert.equal(savings(100, 150, 2).monthly, 0);
  assert.equal(savings(0, 0, 1).progress, 100);
  assert.throws(() => savings(100, 0, 0));
  assert.throws(() => savings(100, 0, 1.5));
});
test('unit conversions use defined international factors', () => {
  assert.equal(convert(1, 'length', 'in', 'cm'), 2.54);
  assert.ok(Math.abs(convert(1, 'weight', 'lb', 'kg') - 0.45359237) < 1e-12);
  assert.equal(convert(1, 'volume', 'gal', 'l'), 3.785411784);
  assert.equal(convert(0, 'temperature', 'c', 'f'), 32);
  assert.equal(convert(212, 'temperature', 'f', 'c'), 100);
  assert.equal(convert(0, 'temperature', 'k', 'c'), -273.15);
  assert.throws(() => convert(-1, 'temperature', 'k', 'c'));
  assert.throws(() => convert(NaN, 'length', 'm', 'ft'));
});
test('contrast calculations match reference black, white, and grey ratios', () => {
  assert.equal(contrast('#000000', '#ffffff'), 21);
  assert.equal(contrast('#abcdef', '#abcdef'), 1);
  assert.ok(
    Math.abs(contrast('#777777', '#ffffff') - 4.478089453577214) < 1e-9,
  );
  assert.throws(() => contrast('red', '#ffffff'));
});
test('local calendar dates handle month and year boundaries without UTC slicing', () => {
  const date = new Date(2026, 0, 1, 0, 15);
  assert.equal(localDate(date), '2026-01-01');
  assert.deepEqual(recentDates(3, date), [
    '2025-12-30',
    '2025-12-31',
    '2026-01-01',
  ]);
});
test('timers calculate against a deadline and clamp overdue sessions', () => {
  assert.equal(remainingMs(10000, 1000), 9000);
  assert.equal(remainingMs(10000, 15000), 0);
});
test('CSV exports quote records and neutralize spreadsheet formulas', () => {
  const output = csv([['=1+1', 'a"b', 'line\nbreak', 'ä']]);
  assert.equal(output, '"\'=1+1","a""b","line\nbreak","ä"');
});
test('card and quiz imports reject malformed, oversized, and incorrect records', () => {
  assert.ok(validCards([{ question: 'Q', answer: 'A' }]));
  assert.ok(validCards([]));
  assert.equal(validCards([{ question: '', answer: 'A' }]), false);
  assert.equal(validCards([{ question: 'Q', answer: 12 }]), false);
  assert.equal(
    validCards(Array(501).fill({ question: 'Q', answer: 'A' })),
    false,
  );
  const q = {
    question: 'Q',
    options: ['A', 'B'],
    answer: 1,
    explanation: 'Why B',
  };
  assert.ok(validQuiz([q]));
  assert.equal(validQuiz([{ ...q, answer: 2 }]), false);
  assert.equal(validQuiz([{ ...q, options: ['A'] }]), false);
  assert.equal(validQuiz([]), false);
});
test('random selection bounds and shuffle preserve card multiplicity', () => {
  for (let i = 0; i < 100; i++) {
    const value = randomIndex(12);
    assert.ok(value >= 0 && value < 12);
  }
  const input = ['a', 'a', 'b', 'c'];
  assert.deepEqual(shuffle(input).sort(), input.slice().sort());
  assert.deepEqual(input, ['a', 'a', 'b', 'c']);
  assert.throws(() => randomIndex(0));
});
test('German starter collection has unique IDs, 36 gendered nouns, and 12 phrases', () => {
  assert.equal(WORDS.length, 48);
  assert.equal(new Set(WORDS.map((w) => w.id)).size, 48);
  assert.equal(WORDS.filter((w) => w.article).length, 36);
  assert.ok(
    WORDS.every(
      (w) =>
        w.word &&
        w.translation &&
        w.example &&
        w.topic &&
        (!w.article || ['der', 'die', 'das'].includes(w.article)),
    ),
  );
});

test('import date validation rejects impossible calendar days', () => {
  assert.equal(isDateKey('2026-02-29'), false);
  assert.equal(isDateKey('2024-02-29'), true);
  assert.equal(isDateKey('2026-04-31'), false);
  assert.equal(isDateKey('2026-10-28'), true);
  assert.equal(isDateKey('2026-13-01'), false);
});
