export function cents(value) {
  const text = String(value).trim();
  if (!/^\d{1,9}(?:[.,]\d{1,2})?$/.test(text))
    throw new Error(
      'Enter a non-negative amount with at most two decimal places.',
    );
  const [whole, fraction = ''] = text.replace(',', '.').split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}
export function splitCents(amount, count) {
  if (
    !Number.isSafeInteger(amount) ||
    amount < 0 ||
    !Number.isInteger(count) ||
    count < 1
  )
    throw new Error('Invalid split.');
  return Array.from(
    { length: count },
    (_, i) => Math.floor(amount / count) + (i < amount % count ? 1 : 0),
  );
}
export function balances(people, expenses) {
  const result = Object.fromEntries(people.map((p) => [p.id, 0]));
  for (const item of expenses) {
    if (
      !(item.paidBy in result) ||
      !Number.isSafeInteger(item.amount) ||
      item.amount < 1
    )
      throw new Error('Invalid expense.');
    result[item.paidBy] += item.amount;
    splitCents(item.amount, people.length).forEach((share, i) => {
      result[people[i].id] -= share;
    });
  }
  return result;
}
export function settle(result) {
  const debt = Object.entries(result)
    .filter(([, n]) => n < 0)
    .map(([id, n]) => ({ id, n: -n }));
  const credit = Object.entries(result)
    .filter(([, n]) => n > 0)
    .map(([id, n]) => ({ id, n }));
  const transfers = [];
  let i = 0,
    j = 0;
  while (i < debt.length && j < credit.length) {
    const amount = Math.min(debt[i].n, credit[j].n);
    transfers.push({ from: debt[i].id, to: credit[j].id, amount });
    debt[i].n -= amount;
    credit[j].n -= amount;
    if (!debt[i].n) i++;
    if (!credit[j].n) j++;
  }
  if (debt.some((x) => x.n) || credit.some((x) => x.n))
    throw new Error('Balances do not sum to zero.');
  return transfers;
}
export function savings(target, saved, months) {
  if (
    ![target, saved].every((n) => Number.isSafeInteger(n) && n >= 0) ||
    !Number.isInteger(months) ||
    months < 1 ||
    months > 1200
  )
    throw new Error('Use valid amounts and 1–1200 months.');
  const remaining = Math.max(0, target - saved);
  return {
    remaining,
    monthly: Math.ceil(remaining / months),
    progress: target ? Math.min(100, (saved / target) * 100) : 100,
  };
}
export function randomIndex(length) {
  if (!Number.isInteger(length) || length < 1 || length > 10000)
    throw new Error('Invalid number of choices.');
  const ceiling = Math.floor(0x100000000 / length) * length;
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= ceiling);
  return buffer[0] % length;
}
export function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export const UNIT_GROUPS = {
  length: {
    m: ['Metres', 1],
    km: ['Kilometres', 1000],
    cm: ['Centimetres', 0.01],
    mm: ['Millimetres', 0.001],
    in: ['Inches', 0.0254],
    ft: ['Feet', 0.3048],
    mi: ['Miles', 1609.344],
  },
  weight: {
    kg: ['Kilograms', 1],
    g: ['Grams', 0.001],
    lb: ['Pounds', 0.45359237],
    oz: ['Ounces', 0.028349523125],
  },
  volume: {
    l: ['Litres', 1],
    ml: ['Millilitres', 0.001],
    gal: ['US gallons', 3.785411784],
    cup: ['US cups', 0.2365882365],
  },
  temperature: { c: ['Celsius', 1], f: ['Fahrenheit', 1], k: ['Kelvin', 1] },
};
export function convert(value, group, from, to) {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    Math.abs(value) > 1e15 ||
    !UNIT_GROUPS[group]?.[from] ||
    !UNIT_GROUPS[group]?.[to]
  )
    throw new Error('Enter a finite number and valid units.');
  if (group !== 'temperature')
    return (value * UNIT_GROUPS[group][from][1]) / UNIT_GROUPS[group][to][1];
  const c =
    from === 'c'
      ? value
      : from === 'f'
        ? ((value - 32) * 5) / 9
        : value - 273.15;
  if (c < -273.1500000001)
    throw new Error('Temperature is below absolute zero.');
  return to === 'c' ? c : to === 'f' ? (c * 9) / 5 + 32 : c + 273.15;
}
export function contrast(a, b) {
  const luminance = (hex) => {
    if (!/^#[\da-f]{6}$/i.test(hex))
      throw new Error('Use six-digit hex colors.');
    const values = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
  };
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function recentDates(count = 14, date = new Date()) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(date);
    d.setDate(d.getDate() - (count - 1 - i));
    return localDate(d);
  });
}
export function remainingMs(deadline, now = Date.now()) {
  return Math.max(0, deadline - now);
}
export function csv(rows) {
  return rows
    .map((row) =>
      row
        .map((value) => {
          let s = String(value ?? '');
          if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
          return '"' + s.replaceAll('"', '""') + '"';
        })
        .join(','),
    )
    .join('\r\n');
}
export function validCards(data) {
  return (
    Array.isArray(data) &&
    data.length <= 500 &&
    data.every(
      (x) =>
        x &&
        typeof x.question === 'string' &&
        x.question.trim() &&
        x.question.length <= 500 &&
        typeof x.answer === 'string' &&
        x.answer.trim() &&
        x.answer.length <= 1000,
    )
  );
}
export function validQuiz(data) {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    data.length <= 100 &&
    data.every(
      (x) =>
        x &&
        typeof x.question === 'string' &&
        x.question.trim() &&
        x.question.length <= 500 &&
        Array.isArray(x.options) &&
        x.options.length >= 2 &&
        x.options.length <= 6 &&
        x.options.every(
          (s) => typeof s === 'string' && s.trim() && s.length <= 300,
        ) &&
        Number.isInteger(x.answer) &&
        x.answer >= 0 &&
        x.answer < x.options.length &&
        typeof x.explanation === 'string' &&
        x.explanation.length <= 1000,
    )
  );
}

export function isDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
