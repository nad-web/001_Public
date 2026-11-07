const status = document.getElementById("offline-status");
const dialog = document.getElementById("install-dialog");
document.getElementById("install-button")?.addEventListener("click", () => {
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
});
document.getElementById("close-install")?.addEventListener("click", () => {
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
});
async function start() {
  if (!status) return;
  if (!("serviceWorker" in navigator)) {
    status.textContent = "Offline storage is unavailable in this browser.";
    return;
  }
  const scope = new URL("../", import.meta.url),
    registration = await navigator.serviceWorker.register(
      new URL("../sw.js", import.meta.url),
      { scope: scope.href },
    );
  async function check() {
    if (!registration.active) return;
    const channel = new MessageChannel();
    const ready = await new Promise((resolve) => {
      const timer = setTimeout(() => resolve(false), 5000);
      channel.port1.onmessage = (e) => {
        clearTimeout(timer);
        channel.port1.close();
        resolve(e.data?.ready === true);
      };
      registration.active.postMessage({ type: "CHECK_READY" }, [channel.port2]);
    });
    status.textContent = ready
      ? "This app is ready for offline use."
      : "Preparing this app for offline use…";
  }
  let update;
  function offer() {
    if (!registration.waiting || update) return;
    update = document.createElement("button");
    update.type = "button";
    update.className = "btn primary";
    update.textContent = "Reload to update this app";
    update.onclick = () => {
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        () => location.reload(),
        { once: true },
      );
      registration.waiting?.postMessage({ type: "SKIP_WAITING" });
    };
    status.after(update);
  }
  function observe() {
    const worker = registration.installing;
    worker?.addEventListener("statechange", () => {
      if (worker.state === "activated") check();
      if (worker.state === "installed") offer();
    });
  }
  observe();
  registration.addEventListener("updatefound", observe);
  navigator.serviceWorker.addEventListener("controllerchange", check);
  offer();
  await check();
}
start().catch(() => {
  if (status)
    status.textContent = "Open this app online to prepare offline use.";
});
