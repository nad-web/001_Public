const status = document.querySelector('#offline-status');
let promptEvent;
window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); promptEvent = event; });
document.querySelector('#install-button').addEventListener('click', async () => {
  if (promptEvent) { await promptEvent.prompt(); promptEvent = null; }
  else document.querySelector('#help-dialog').showModal();
});
if ('serviceWorker' in navigator && ['https:', 'http:'].includes(location.protocol)) {
  window.addEventListener('load', async () => {
    try {
      const base = new URL('../', import.meta.url);
      const registration = await navigator.serviceWorker.register(new URL('sw.js', base), { scope: base.pathname });
      function ready() {
        if (registration.active) status.textContent = 'Offline ready · works on this device';
      }
      function offerUpdate() {
        if (!registration.waiting || document.querySelector('#update-studio')) return;
        const button = document.createElement('button');
        button.id = 'update-studio'; button.className = 'text-button'; button.textContent = 'Update available';
        button.addEventListener('click', () => {
          navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
          registration.waiting?.postMessage({ type: 'ACTIVATE_UPDATE' });
        });
        document.querySelector('.app-footer').append(button);
      }
      ready(); offerUpdate();
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker?.addEventListener('statechange', () => { ready(); offerUpdate(); });
      });
      if (registration.installing) registration.installing.addEventListener('statechange', ready);
      if (!registration.active) {
        const worker = registration.installing || registration.waiting;
        if (worker) await new Promise((resolve, reject) => {
          worker.addEventListener('statechange', () => {
            if (worker.state === 'activated') resolve();
            if (worker.state === 'redundant') reject(new Error('Offline installation did not complete.'));
          });
        });
      }
      ready();
    } catch { status.textContent = 'Online · offline preparation unavailable'; }
  });
} else status.textContent = 'Offline access needs HTTPS. Export a project backup.';
