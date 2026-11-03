// Numeric array adapter by Noorullah Adel. MIT licensed.
export function max(values, accessor = (value) => value) {
  let result;
  let i = -1;
  for (const value of values) { const n = accessor(value, ++i, values); if (n != null && n >= n && (result === undefined || n > result)) result = n; }
  return result;
}
export function min(values, accessor = (value) => value) {
  let result;
  let i = -1;
  for (const value of values) { const n = accessor(value, ++i, values); if (n != null && n >= n && (result === undefined || n < result)) result = n; }
  return result;
}
export function sum(values, accessor = (value) => value) {
  let result = 0;
  let i = -1;
  for (const value of values) { const n = +accessor(value, ++i, values); if (n) result += n; }
  return result;
}
