const WEEKDAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const WEEKDAY_FULL = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export function formatWeekdays(weekdays: number[]): string {
  if (weekdays.length === 7) return 'Tous les jours';
  if (weekdays.length === 5 && [1, 2, 3, 4, 5].every((d) => weekdays.includes(d)))
    return 'En semaine';
  if (weekdays.length === 2 && weekdays.includes(0) && weekdays.includes(6)) return 'Week-end';
  if (weekdays.length === 0) return 'Une fois';
  return weekdays
    .slice()
    .sort()
    .map((d) => WEEKDAY_FULL[d])
    .join(' · ');
}

export const WEEKDAY_SHORT = WEEKDAY_LABELS;

/** Minutes jusqu'au prochain déclenchement de "HH:MM" (heure locale). */
export function minutesUntil(timeLocal: string, now = new Date()): number {
  const [h, m] = timeLocal.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h ?? 0, m ?? 0, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return Math.round((target.getTime() - now.getTime()) / 60000);
}

export function humanizeDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `dans ${m} min`;
  if (m === 0) return `dans ${h} h`;
  return `dans ${h} h ${m} min`;
}

export function nowMinutesOfDay(d = new Date()): number {
  return d.getHours() * 60 + d.getMinutes();
}
