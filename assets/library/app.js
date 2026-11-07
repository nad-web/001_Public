const grid = document.getElementById("app-grid"),
  search = document.getElementById("app-search"),
  filters = document.getElementById("category-filters"),
  count = document.getElementById("result-count");
const categories = {
  all: "All apps",
  education: "Learning",
  visualisation: "Visualization",
  finances: "Finance",
  productivity: "Productivity",
  "on-the-way": "Travel",
  languages: "Languages",
  "developer-tools": "Developer tools",
  "everyday-tools": "Everyday tools",
  "health-wellbeing": "Wellbeing",
  creative: "Creative",
  fun: "Fun & games",
  other: "Other",
};
const base = new URL("../../", import.meta.url);
let apps = [],
  selected = "all";
function el(tag, attrs, ...children) {
  const n = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, String(v)));
  n.append(...children);
  return n;
}
const normalized = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss");
function render() {
  const terms = normalized(search.value).split(/\s+/).filter(Boolean),
    matched = apps.filter(
      (a) =>
        (selected === "all" || a.category === selected) &&
        terms.every((q) =>
          normalized(
            [a.name, a.summary, a.id, categories[a.category]].join(" "),
          ).includes(q),
        ),
    );
  grid.replaceChildren(
    ...matched.map((a) =>
      el(
        "a",
        {
          class: "app-card",
          href: new URL("applications/" + a.id + "/", base),
        },
        el(
          "div",
          { class: "card-top" },
          el(
            "span",
            { class: "app-badge", "aria-hidden": "true" },
            a.name
              .split(" ")
              .slice(0, 2)
              .map((x) => x[0])
              .join(""),
          ),
          el(
            "span",
            { class: "category" },
            categories[a.category] || a.category,
          ),
        ),
        el("h3", {}, a.name),
        el("p", {}, a.summary),
        el(
          "div",
          { class: "card-bottom" },
          el("span", {}, "Open application"),
          el("span", { "aria-hidden": "true" }, "↗"),
        ),
      ),
    ),
  );
  count.textContent = `${matched.length} of ${apps.length} applications`;
  document.getElementById("no-results").hidden = matched.length > 0;
  filters
    .querySelectorAll("button")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.category === selected)),
    );
  document
    .querySelectorAll("[data-app-count]")
    .forEach((n) => (n.textContent = apps.length));
}
let theme;
try {
  theme = localStorage.getItem("001-public:theme");
} catch {}
document.documentElement.dataset.theme =
  theme ||
  (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light");
document.getElementById("theme").onclick = () => {
  const value =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = value;
  try {
    localStorage.setItem("001-public:theme", value);
  } catch {}
};
async function start() {
  const response = await fetch(new URL("../catalog.json", import.meta.url));
  if (!response.ok)
    throw new Error(
      "The application catalogue is unavailable. Reload after deployment finishes.",
    );
  apps = await response.json();
  for (const category of ["all", ...new Set(apps.map((a) => a.category))]) {
    const b = el(
      "button",
      { type: "button", class: "chip", "data-category": category },
      categories[category] || category,
    );
    b.onclick = () => {
      selected = category;
      render();
    };
    filters.append(b);
  }
  search.addEventListener("input", render);
  document.getElementById("clear-filters").onclick = () => {
    selected = "all";
    search.value = "";
    render();
    search.focus();
  };
  render();
  if ("serviceWorker" in navigator) {
    try {
      const old = await navigator.serviceWorker.getRegistration(base.href);
      if (old && old.scope === base.href) await old.update();
    } catch {
      // The catalogue remains usable when offline APIs are restricted.
    }
  }
}
start().catch((e) => {
  const n = document.getElementById("no-results");
  n.hidden = false;
  n.textContent = e.message;
});
