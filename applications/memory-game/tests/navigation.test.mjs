import test from "node:test";
import assert from "node:assert/strict";
import { nextCardIndex } from "../src/navigation.js";
test("vertical card navigation skips matched cards in the same column", () => {
  assert.equal(
    nextCardIndex({
      index: 0,
      key: "ArrowDown",
      columns: 4,
      count: 16,
      matched: [4, 8],
    }),
    12,
  );
  assert.equal(
    nextCardIndex({
      index: 12,
      key: "ArrowUp",
      columns: 4,
      count: 16,
      matched: [8, 4],
    }),
    0,
  );
});
test("RTL horizontal navigation, Home and End respect bounds and matched cards", () => {
  assert.equal(
    nextCardIndex({
      index: 0,
      key: "ArrowLeft",
      columns: 4,
      count: 8,
      matched: [1],
    }),
    2,
  );
  assert.equal(
    nextCardIndex({ index: 0, key: "ArrowRight", columns: 4, count: 8 }),
    null,
  );
  assert.equal(
    nextCardIndex({ index: 3, key: "End", columns: 4, count: 8, matched: [7] }),
    6,
  );
});
