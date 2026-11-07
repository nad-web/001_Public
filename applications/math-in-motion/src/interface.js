import "./pwa.js";
let theme;
try {
  theme = localStorage.getItem("noorullah.math-in-motion.theme");
} catch {}
document.documentElement.dataset.theme =
  theme ||
  (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light");
document.getElementById("theme").onclick = () => {
  const value =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = value;
  try {
    localStorage.setItem("noorullah.math-in-motion.theme", value);
  } catch {}
};
function translate() {
  document.getElementById("nav-all").textContent =
    document.documentElement.lang === "de" ? "Alle Apps" : "All apps";
}
new MutationObserver(translate).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["lang"],
});
translate();

const offline = document.getElementById("offline-status");
const offlineWords = [
  [
    "Offline storage is unavailable in this browser.",
    "Offline-Speicher ist in diesem Browser nicht verfügbar.",
  ],
  [
    "This app is ready for offline use.",
    "Lektionen und Grafiken sind offline bereit.",
  ],
  [
    "Preparing this app for offline use…",
    "Offline-Lektionen werden vorbereitet…",
  ],
  [
    "Open this app online to prepare offline use.",
    "Öffne die App online, um Offline-Lektionen vorzubereiten.",
  ],
];
function localizeOffline() {
  const german = document.documentElement.lang === "de";
  for (const pair of offlineWords)
    if (pair.includes(offline.textContent)) {
      const text = pair[german ? 1 : 0];
      if (offline.textContent !== text) offline.textContent = text;
      break;
    }
  const update = offline.nextElementSibling;
  if (update?.tagName === "BUTTON")
    update.textContent = german
      ? "Neu laden und App aktualisieren"
      : "Reload to update this app";
  document
    .getElementById("theme")
    .setAttribute(
      "aria-label",
      german ? "Farbschema wechseln" : "Switch color theme",
    );
}
new MutationObserver(localizeOffline).observe(offline, {
  childList: true,
  characterData: true,
  subtree: true,
});
new MutationObserver(localizeOffline).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["lang"],
});
localizeOffline();
