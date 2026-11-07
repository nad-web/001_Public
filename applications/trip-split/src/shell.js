import { createStore } from "./storage.js";
import { icon } from "./icons.js";
import "./pwa.js";
export const $ = (selector) => document.querySelector(selector);
export const root = $("#app");
export function replace(...children) {
  const active = document.activeElement,
    focusId = active?.id;
  const selection =
    active && "selectionStart" in active
      ? [active.selectionStart, active.selectionEnd]
      : null;
  root.replaceChildren(...children);
  if (focusId) {
    const target = document.getElementById(focusId);
    target?.focus({ preventScroll: true });
    if (selection && typeof target?.setSelectionRange === "function")
      try {
        target.setSelectionRange(...selection);
      } catch {}
  }
}
export const id = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key.startsWith("on"))
      node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (
      key === "checked" ||
      key === "disabled" ||
      key === "hidden" ||
      key === "selected"
    )
      node[key] = Boolean(value);
    else if (value !== null && value !== undefined)
      node.setAttribute(key, String(value));
  }
  for (const child of children.flat(Infinity))
    if (child !== null && child !== undefined && child !== false)
      node.append(
        child instanceof Node ? child : document.createTextNode(String(child)),
      );
  return node;
}
let storageWarning = "";
export function report(text, error = false) {
  const box = $("#feedback");
  box.textContent = text + (storageWarning ? " " + storageWarning : "");
  box.classList.toggle("error", error || Boolean(storageWarning));
}
export function button(text, fn, kind = "secondary", attrs = {}) {
  return el(
    "button",
    {
      type: "button",
      class: `btn ${kind}`,
      ...attrs,
      onclick: async (event) => {
        try {
          await fn(event);
        } catch (error) {
          report(error.message, true);
        }
      },
    },
    text,
  );
}
export const input = (name, value = "", attrs = {}) =>
  el("input", { id: name, name, value, ...attrs });
export const field = (label, control) =>
  el(
    "div",
    { class: "field" },
    el("label", { for: control.id || control.name }, label),
    control,
  );
export function select(name, options, value) {
  return el(
    "select",
    { id: name, name },
    options.map((option) => {
      const [v, label] = Array.isArray(option) ? option : [option, option];
      return el(
        "option",
        { value: v, selected: String(v) === String(value) },
        label,
      );
    }),
  );
}
export const panel = (title, ...children) =>
  el(
    "section",
    { class: "panel" },
    title ? el("h2", {}, title) : null,
    ...children,
  );
export const row = (...children) => el("div", { class: "row" }, ...children);
export const stack = (...children) =>
  el("div", { class: "stack" }, ...children);
export const hint = (text) => el("p", { class: "hint" }, text);
export const heading = (text, sub) =>
  stack(el("h2", {}, text), sub ? hint(sub) : null);
export const metric = (label, value) =>
  el(
    "div",
    { class: "metric" },
    el("span", {}, label),
    el("strong", {}, value),
  );
export function form(children, submit, label = "Save") {
  let busy = false;
  return el(
    "form",
    {
      onsubmit: async (event) => {
        event.preventDefault();
        if (busy) return;
        busy = true;
        const controls = [
          ...event.target.querySelectorAll('button[type="submit"]'),
        ];
        controls.forEach((b) => (b.disabled = true));
        try {
          await submit(new FormData(event.target), event.target);
        } catch (error) {
          report(error.message, true);
        } finally {
          busy = false;
          controls.forEach((b) => (b.disabled = false));
        }
      },
    },
    ...children,
    el("button", { type: "submit", class: "btn primary" }, label),
  );
}
export const money = (value) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    value / 100,
  );
export function store(app, fallback, validate = () => true) {
  return createStore(app, fallback, validate, {
    onWarning: (message) => {
      storageWarning = message;
      if (message) report(message, true);
    },
  });
}
export function download(name, content, type = "application/json") {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = el("a", { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  report(
    `Download prepared: ${name}. On iPhone, check Files or the Share menu.`,
  );
}
export const exportJSON = (name, data) =>
  download(name, JSON.stringify(data, null, 2));
export function importJSON(label, validate, onLoad) {
  const control = input(id(), "", {
    type: "file",
    accept: ".json,application/json",
    "aria-label": label,
  });
  control.addEventListener("change", async () => {
    try {
      const file = control.files[0];
      if (!file) return;
      if (file.size > 16 * 1024 * 1024)
        throw new Error("Import is limited to 16 MiB.");
      const data = JSON.parse(await file.text());
      if (!validate(data))
        throw new Error("This file does not match the expected data format.");
      if (!confirm("Replace the current data with this imported file?")) return;
      await onLoad(data);
      report("Import completed.");
    } catch (e) {
      report(e.message, true);
    } finally {
      control.value = "";
    }
  });
  return field(label, control);
}
export async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    report("Copied to clipboard.");
  } catch {
    report(
      "Clipboard unavailable. Select the text in the manual copy field below.",
      true,
    );
    const manual = el(
      "textarea",
      { readonly: "", "aria-label": "Text to copy manually" },
      text,
    );
    $("#feedback").append(manual);
    manual.focus();
    manual.select();
  }
}
export const confirmed = (message, fn) => {
  if (confirm(message)) fn();
};
export function empty(text = "No items yet. Add your first one above.") {
  return el("p", { class: "empty" }, text);
}
export function init() {
  let theme;
  try {
    theme = localStorage.getItem("001-public:theme");
  } catch {}
  document.documentElement.dataset.theme =
    theme ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const glyph = $("#app-icon");
  if (glyph) glyph.innerHTML = icon(document.body.dataset.icon);
  $("#theme")?.addEventListener("click", () => {
    const theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("001-public:theme", theme);
    } catch {}
  });
}
init();
