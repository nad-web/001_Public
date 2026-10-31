export const APP = Object.freeze({
  name: 'باغ حافظهٔ هاینبورگ', developer: 'نورالله عادل',
  developerLatin: 'Noorullah Adel', version: '1.1.0', releasedOn: '2026-10-31',
  lang: 'fa-AF', dir: 'rtl', location: 'هاینبورگ، هِسِن، آلمان',
});
export const fa = (value) => String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
export function timeText(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${fa(Math.floor(seconds / 60))}:${fa(String(seconds % 60).padStart(2, '0'))}`;
}
export const MODES = Object.freeze({
  relaxed: { name: 'آرام', delay: 2200, description: 'فرصت بیشتر برای دیدن کارت‌ها؛ بدون عجله.' },
  standard: { name: 'معمولی', delay: 1500, description: 'یک بازی با ریتم ملایم و راهنمای اختیاری.' },
  challenge: { name: 'چالش', delay: 900, description: 'کارت‌های ناهماهنگ زودتر برمی‌گردند؛ بدون محدودیت زمان.' },
});
export const DEFAULTS = Object.freeze({
  sound: false, readCards: true, showTime: false, showLabels: true,
  contrast: false, largeText: false, reduceMotion: false, hints: true,
  mode: 'relaxed', welcome: '', favorites: [],
});
