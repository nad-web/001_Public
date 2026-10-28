const base = new URL('../../../', import.meta.url);
let installPrompt;
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  installPrompt = event;
});
const dialog = document.querySelector('#install-dialog');
document
  .querySelector('#install-button')
  ?.addEventListener('click', async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
    } else dialog?.showModal();
  });
document
  .querySelector('#close-install')
  ?.addEventListener('click', () => dialog.close());
if (
  'serviceWorker' in navigator &&
  document.querySelector('meta[name="lab-build"]')
) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        new URL('sw.js', base),
        { scope: base.pathname },
      );
      const showUpdate = () => {
        if (!registration.waiting || document.querySelector('#update-app'))
          return;
        const button = document.createElement('button');
        button.id = 'update-app';
        button.className = 'btn secondary';
        button.textContent = 'Update available · reload';
        button.addEventListener('click', () => {
          navigator.serviceWorker.addEventListener(
            'controllerchange',
            () => location.reload(),
            { once: true },
          );
          registration.waiting.postMessage({ type: 'ACTIVATE_UPDATE' });
        });
        document.querySelector('footer')?.prepend(button);
      };
      showUpdate();
      registration.addEventListener('updatefound', () => {
        registration.installing?.addEventListener('statechange', () =>
          setTimeout(showUpdate, 0),
        );
      });
      await navigator.serviceWorker.ready;
      const status = document.querySelector('#offline-status');
      if (status) status.textContent = 'Offline library ready on this device.';
    } catch {
      const status = document.querySelector('#offline-status');
      if (status)
        status.textContent =
          'Offline download unavailable. The apps still work online; reconnect and reload to retry.';
    }
  });
}
