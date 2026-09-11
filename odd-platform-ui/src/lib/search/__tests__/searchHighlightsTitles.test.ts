import { describe, expect, it } from 'vitest';
import en from 'locales/translations/en.json';
import { searchHighlightsTitlesMap } from 'lib/constants';

/**
 * ST-12 (#1846) — every section / field title of the search-result "why it matched" tooltip is looked up with
 * `t(value)`; a value that is not a catalog key renders English on every non-English locale, silently, and the
 * catalog-parity guard cannot see it (the key is missing from `en` too). Seven of the Data Entity titles shipped
 * that way ("Data entity", "External name", "Internal Description", "External Description", "Data source",
 * "ODDRN", "Dataset structure") — this pins the fix and every title added for Terms and Query Examples.
 */
describe('searchHighlightsTitlesMap (ST-12 / #1846)', () => {
  it('every title is a key of the en catalog', () => {
    const catalog = en as Record<string, string>;
    const missing = [...searchHighlightsTitlesMap.values()].filter(v => !(v in catalog));
    expect(missing).toEqual([]);
  });

  it('carries a title for every Term and Query Example section', () => {
    for (const key of [
      'term',
      'definition',
      'queryExample',
      'query',
      'linkedEntities',
    ] as const) {
      expect(searchHighlightsTitlesMap.get(key)).toBeTruthy();
    }
  });
});
