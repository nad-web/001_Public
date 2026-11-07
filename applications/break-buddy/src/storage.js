/* Compatible v1 records with explicit stale-tab protection. */
export function createStore(
  app,
  fallback,
  validate = () => true,
  { platform = globalThis, onWarning = () => {} } = {},
) {
  const key = `noorullah-lab:${app}:v1`,
    clone = (x) => JSON.parse(JSON.stringify(x));
  let data = clone(fallback),
    baseline = null;
  try {
    baseline = platform.localStorage.getItem(key);
    if (baseline) {
      const saved = JSON.parse(baseline);
      if (saved.version !== 1 || !validate(saved.data))
        throw new Error("Invalid saved record");
      data = saved.data;
    }
  } catch {
    onWarning("Saved data is unavailable or invalid. Keep exports as backups.");
  }
  function unchanged() {
    let current;
    try {
      current = platform.localStorage.getItem(key);
    } catch {
      return;
    }
    if (current !== baseline)
      throw new Error(
        "This app changed in another tab. Export unsaved edits, then reload before saving.",
      );
  }
  const api = {
    get: () => clone(data),
    set(next) {
      if (!validate(next)) throw new Error("Data validation failed.");
      unchanged();
      data = clone(next);
      const serialized = JSON.stringify({ version: 1, data });
      try {
        platform.localStorage.setItem(key, serialized);
        baseline = serialized;
        onWarning("");
      } catch {
        onWarning(
          "Browser storage is unavailable. Changes last only for this visit; export a backup before leaving.",
        );
      }
    },
    clear() {
      unchanged();
      try {
        platform.localStorage.removeItem(key);
        baseline = null;
        data = clone(fallback);
        onWarning("");
      } catch {
        data = clone(fallback);
        onWarning(
          "Saved records could not be removed. Current visit was reset; check browser site-data settings.",
        );
      }
      return clone(data);
    },
  };
  platform.addEventListener?.("storage", (event) => {
    if (event.key === key)
      onWarning(
        "This app changed in another tab. Export unsaved edits and reload to see the latest records.",
      );
  });
  return api;
}
