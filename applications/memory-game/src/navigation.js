export function nextCardIndex({ index, key, columns, count, matched = [] }) {
  const deltas = {
    ArrowLeft: 1,
    ArrowRight: -1,
    ArrowDown: columns,
    ArrowUp: -columns,
  };
  if (
    !Object.prototype.hasOwnProperty.call(deltas, key) &&
    key !== "Home" &&
    key !== "End"
  )
    return null;
  let next =
    key === "Home" ? 0 : key === "End" ? count - 1 : index + deltas[key];
  const step = deltas[key] || (key === "End" ? -1 : 1),
    done = new Set(matched);
  while (next >= 0 && next < count && done.has(next)) next += step;
  return next >= 0 && next < count ? next : null;
}
