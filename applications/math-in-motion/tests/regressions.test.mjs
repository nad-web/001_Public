import test from "node:test";
import assert from "node:assert/strict";
import catalog from "../tools/load-catalog.mjs";
test("equivalent fractions represent the same whole at the same width", () => {
  const { marks } = catalog.build("equivalent-fractions", [2, 3], "en");
  const rows = [65, 152].map((y) =>
    marks.filter((m) => m[0] === "rect" && m[2] === y),
  );
  assert(rows.every((row) => row.length > 0));
  const extent = (row) => [row[0][1], row.at(-1)[1] + row.at(-1)[3]];
  assert(
    extent(rows[0]).every(
      (value, i) => Math.abs(value - extent(rows[1])[i]) < 1e-9,
    ),
  );
});
test("inverse function identity line has equal horizontal and vertical pixel scales", () => {
  const { marks } = catalog.build("inverse-functions", [1], "en");
  const curve = marks.find((m) => m[0] === "poly" && m[2] === "blue");
  assert(curve);
  const a = curve[1][0],
    b = curve[1].at(-1);
  assert(Math.abs(Math.abs(a[0] - b[0]) - Math.abs(a[1] - b[1])) < 1e-8);
});
test("zero inequality coefficient and impossible selections keep their actual meaning", () => {
  const all = catalog.build("inequality", [6, 0], "en");
  assert(
    all.marks.some(
      (m) => m[0] === "text" && String(m[3]).includes("All real numbers"),
    ),
  );
  assert.match(
    catalog.build("combinations", [3, 5], "en").note,
    /C\(3, 5\) = 0/,
  );
});
