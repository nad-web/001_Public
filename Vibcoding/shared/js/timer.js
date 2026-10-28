import {
  $,
  root,
  el,
  button,
  input,
  field,
  panel,
  row,
  metric,
  form,
  store,
  confirmed,
  hint,
  report,
} from './shell.js';
import { remainingMs } from './logic.js';
export function startTimer({ app, focus = 25, rest = 5, breakApp = false }) {
  const fallback = {
    focusMinutes: focus,
    breakMinutes: rest,
    mode: 'focus',
    remaining: focus * 60000,
    deadline: null,
    running: false,
    completed: 0,
  };
  const valid = (x) =>
    x &&
    Number.isInteger(x.focusMinutes) &&
    x.focusMinutes >= 1 &&
    x.focusMinutes <= 180 &&
    Number.isInteger(x.breakMinutes) &&
    x.breakMinutes >= 1 &&
    x.breakMinutes <= 60 &&
    ['focus', 'break'].includes(x.mode) &&
    typeof x.running === 'boolean' &&
    Number.isFinite(x.remaining) &&
    x.remaining >= 0 &&
    x.remaining <= 10800000 &&
    (x.deadline === null || Number.isFinite(x.deadline)) &&
    (!x.running || Number.isFinite(x.deadline)) &&
    Number.isInteger(x.completed) &&
    x.completed >= 0;
  const db = store(app, fallback, valid);
  let state = { ...db.get() };
  const duration = () =>
    60000 * (state.mode === 'focus' ? state.focusMinutes : state.breakMinutes);
  const persist = () => db.set({ ...state });
  const time = () =>
    state.running ? remainingMs(state.deadline) : state.remaining;
  function render() {
    const settings = form(
      [
        row(
          field(
            breakApp ? 'Work interval · minutes' : 'Focus · minutes',
            input('focus-minutes', state.focusMinutes, {
              type: 'number',
              min: 1,
              max: 180,
              step: 1,
              required: true,
            }),
          ),
          field(
            'Break · minutes',
            input('break-minutes', state.breakMinutes, {
              type: 'number',
              min: 1,
              max: 60,
              step: 1,
              required: true,
            }),
          ),
        ),
      ],
      (data) => {
        if (state.running)
          throw new Error('Pause the timer before changing its lengths.');
        state.focusMinutes = Number(data.get('focus-minutes'));
        state.breakMinutes = Number(data.get('break-minutes'));
        state.remaining = duration();
        state.deadline = null;
        persist();
        render();
        report('Timer lengths saved.');
      },
      'Save lengths',
    );
    const switchMode = (mode) => {
      state.mode = mode;
      state.running = false;
      state.deadline = null;
      state.remaining = duration();
      persist();
      render();
    };
    const controls = row(
      button(
        state.running ? 'Pause' : 'Start',
        () => {
          if (state.running) {
            state.remaining = time();
            state.deadline = null;
            state.running = false;
          } else {
            if (state.remaining <= 0) state.remaining = duration();
            state.deadline = Date.now() + state.remaining;
            state.running = true;
          }
          persist();
          render();
        },
        'primary',
        { id: 'start-pause' },
      ),
      button('Reset timer', () => {
        state.running = false;
        state.deadline = null;
        state.remaining = duration();
        persist();
        render();
      }),
    );
    const notifications = button('Enable optional notifications', async () => {
      if (!('Notification' in window) || !('serviceWorker' in navigator))
        throw new Error(
          'Notifications are unavailable in this browser. On iPhone, try the installed Home Screen app.',
        );
      const result = await Notification.requestPermission();
      report(
        result === 'granted'
          ? 'Notifications enabled while this app can run.'
          : 'Notifications were not enabled. The in-app timer still works.',
      );
    });
    root.replaceChildren(
      el(
        'div',
        { class: 'grid' },
        panel(
          breakApp ? 'A gentler work rhythm' : 'One session at a time',
          el(
            'div',
            { class: 'center' },
            row(
              button(
                breakApp ? 'Work' : 'Focus',
                () => switchMode('focus'),
                state.mode === 'focus' ? 'active' : 'secondary',
              ),
              button(
                'Break',
                () => switchMode('break'),
                state.mode === 'break' ? 'active' : 'secondary',
              ),
            ),
            el('div', {
              id: 'timer',
              class: 'timer-digits',
              'aria-label': 'Time remaining',
            }),
            hint(
              state.mode === 'focus'
                ? breakApp
                  ? 'Work interval. A small break is coming.'
                  : 'Make room for one meaningful task.'
                : 'Rest your eyes, stretch gently, or get a glass of water.',
            ),
            controls,
          ),
          el(
            'div',
            { class: 'metrics' },
            metric('Completed work sessions', state.completed),
            metric('Work', `${state.focusMinutes} min`),
            metric('Break', `${state.breakMinutes} min`),
          ),
        ),
        panel(
          'Your rhythm',
          settings,
          hint(
            'The timer uses a saved deadline and catches up when you return. iPhone can suspend or close web apps; this is not a reliable alarm while the phone is locked or the app is closed.',
          ),
          notifications,
        ),
      ),
      panel(
        breakApp ? 'A few small break ideas' : 'Keep it sustainable',
        el(
          'ul',
          {},
          el('li', {}, 'Look away from the screen for a moment.'),
          el('li', {}, 'Stand up and move at your own comfortable pace.'),
          el('li', {}, 'Drink some water and choose your next small task.'),
        ),
        hint(
          'Each session stops at its end. Start the next session when you are ready.',
        ),
        button(
          'Reset session history',
          () =>
            confirmed('Reset lengths, timer, and completed sessions?', () => {
              state = { ...fallback };
              persist();
              render();
            }),
          'danger',
        ),
      ),
    );
    draw();
  }
  async function notify() {
    try {
      if (
        'Notification' in window &&
        Notification.permission === 'granted' &&
        'serviceWorker' in navigator
      ) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration)
          await registration.showNotification('Noorullah’s Build Lab', {
            body: 'Your timer session has finished. Open the app for the next step.',
            tag: app,
          });
      }
    } catch {
      /* The in-app status remains the primary notification. */
    }
  }
  function draw() {
    const total = Math.max(0, Math.ceil(time() / 1000));
    const text = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    if ($('#timer')) $('#timer').textContent = text;
    document.title = `${text} · ${breakApp ? 'Break Buddy' : 'Focus Flow'} · Noorullah’s Build Lab`;
  }
  function tick() {
    if (state.running && time() <= 0) {
      const wasFocus = state.mode === 'focus';
      if (wasFocus) state.completed++;
      state.mode = wasFocus ? 'break' : 'focus';
      state.running = false;
      state.deadline = null;
      state.remaining = duration();
      persist();
      render();
      report(
        wasFocus
          ? 'Work session complete. Take a break, then start when you are ready.'
          : 'Break complete. Start a new work session when you are ready.',
      );
      notify();
    } else draw();
  }
  render();
  tick();
  setInterval(tick, 250);
  document.addEventListener('visibilitychange', tick);
  window.addEventListener('pageshow', tick);
}
