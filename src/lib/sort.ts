export interface Dated {
  id: string;
  data: { date: Date };
}

export interface Yearly {
  data: { year: number; title: string };
}

/** Nieuwste eerst; bij dezelfde datum op id, zodat de volgorde vast is. */
export function byDateDesc(a: Dated, b: Dated): number {
  return b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id);
}

/** Nieuwste jaar eerst, daarna op titel. */
export function byYearDescThenTitle(a: Yearly, b: Yearly): number {
  return b.data.year - a.data.year || a.data.title.localeCompare(b.data.title, 'nl', { sensitivity: 'base' });
}
