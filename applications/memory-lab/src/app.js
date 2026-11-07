import {
  el,
  button,
  field,
  select,
  panel,
  row,
  metric,
  hint,
  report,
  replace,
} from "./shell.js";
import { shuffle } from "./logic.js";
const symbols = ["✦", "☀", "☂", "♬", "☕", "♥", "✿", "⚓"];
let pairs = 8,
  cards = [],
  shown = [],
  matched = new Set(),
  moves = 0,
  busy = false,
  pending,
  board,
  movesText,
  pairsText;
function update() {
  movesText.textContent = String(moves);
  pairsText.textContent = `${matched.size / 2} / ${pairs}`;
  [...board.children].forEach((node, index) => {
    const visible = matched.has(index) || shown.includes(index);
    node.textContent = visible ? cards[index] : "?";
    node.className = "memory-card" + (matched.has(index) ? " matched" : "");
    node.setAttribute(
      "aria-label",
      `Card ${index + 1}, ${visible ? cards[index] : "hidden"}`,
    );
    node.setAttribute("aria-pressed", String(visible));
    node.setAttribute("aria-disabled", String(matched.has(index) || busy));
  });
}
function flip(index) {
  if (busy || matched.has(index) || shown.includes(index)) return;
  shown.push(index);
  if (shown.length === 2) {
    moves++;
    if (cards[shown[0]] === cards[shown[1]]) {
      shown.forEach((i) => matched.add(i));
      shown = [];
      report(
        matched.size === cards.length
          ? `All pairs found in ${moves} moves.`
          : "A match!",
      );
    } else {
      busy = true;
      pending = setTimeout(() => {
        shown = [];
        busy = false;
        update();
      }, 850);
    }
  }
  update();
}
function restart() {
  clearTimeout(pending);
  cards = shuffle([...symbols.slice(0, pairs), ...symbols.slice(0, pairs)]);
  shown = [];
  matched = new Set();
  moves = 0;
  busy = false;
  const size = select(
    "pairs",
    [
      [4, "4 pairs"],
      [6, "6 pairs"],
      [8, "8 pairs"],
    ],
    pairs,
  );
  size.onchange = () => {
    pairs = Number(size.value);
    restart();
  };
  board = el("div", {
    class: "memory-grid",
    role: "group",
    "aria-label": "Matching cards",
  });
  cards.forEach((_, i) => {
    const node = button("?", () => flip(i), "memory-card", {
      id: "memory-" + i,
    });
    node.addEventListener("keydown", (event) => {
      const delta = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 4, ArrowUp: -4 }[
        event.key
      ];
      if (delta === undefined) return;
      event.preventDefault();
      board.children[
        Math.max(0, Math.min(cards.length - 1, i + delta))
      ].focus();
    });
    board.append(node);
  });
  const m = metric("Moves", "0"),
    p = metric("Pairs found", `0 / ${pairs}`);
  movesText = m.querySelector("strong");
  pairsText = p.querySelector("strong");
  replace(
    panel(
      "A small game. A fresh perspective.",
      row(field("Board size", size), button("New game", restart)),
      el("div", { class: "metrics" }, m, p, metric("Cards", cards.length)),
    ),
    panel(
      "Find the matching pairs",
      board,
      hint(
        "Touch a card or use arrows and Enter/Space. Focus stays on the card you selected.",
      ),
    ),
  );
  update();
}
restart();
