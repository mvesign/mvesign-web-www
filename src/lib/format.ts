// Datums in UTC: de datum uit de front matter is middernacht UTC, en zo valt hij nergens
// op de dag ervoor.
const longDate = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function formatDate(date: Date): string {
  return longDate.format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
