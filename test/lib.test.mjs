import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, isoDate } from '../src/lib/format.ts';
import { byDateDesc, byYearDescThenTitle } from '../src/lib/sort.ts';

test('formatDate schrijft de datum in het Nederlands', () => {
  assert.equal(formatDate(new Date('2022-12-13')), '13 december 2022');
  assert.equal(formatDate(new Date('2021-03-01')), '1 maart 2021');
});

test('isoDate geeft jjjj-mm-dd', () => {
  assert.equal(isoDate(new Date('2022-12-13')), '2022-12-13');
});

test('byDateDesc: nieuwste eerst, bij dezelfde datum op id', () => {
  const items = [
    { id: 'b', data: { date: new Date('2021-12-18') } },
    { id: 'c', data: { date: new Date('2022-12-13') } },
    { id: 'a', data: { date: new Date('2021-12-18') } },
  ];
  assert.deepEqual(items.sort(byDateDesc).map((item) => item.id), ['c', 'a', 'b']);
});

test('byYearDescThenTitle: nieuwste jaar eerst, dan op titel', () => {
  const items = [
    { data: { year: 2025, title: 'Oud' } },
    { data: { year: 2026, title: 'Umbraco' } },
    { data: { year: 2026, title: 'huisstijl' } },
  ];
  assert.deepEqual(items.sort(byYearDescThenTitle).map((item) => item.data.title), ['huisstijl', 'Umbraco', 'Oud']);
});
