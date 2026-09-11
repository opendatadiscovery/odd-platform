import { describe, expect, it, vi } from 'vitest';
import reducer from 'redux/slices/assetSearch.slice';
import { fetchAssetSearchHighlight, searchAssets } from 'redux/thunks';
import type { AssetSearchState } from 'redux/interfaces';
import { AssetKind, type AssetSearchHighlight } from 'generated-sources';

// The thunks barrel pulls every api client at import; replace the module so no client is constructed.
vi.mock('lib/api', () => {
  const handler = { get: (_t: object, p: string) => (p === '__esModule' ? true : {}) };
  return new Proxy({ __esModule: true }, handler);
});
vi.mock('lib/errorHandling', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, showSuccessToast: vi.fn(), showServerErrorToast: vi.fn() };
});

/**
 * ST-12 (#1846) — the per-row "why it matched" map: a fulfilled fetch lands under its (kind, id) key without
 * touching the other rows; a FIRST-page search (no cursor) clears the whole map, because a highlight explains
 * one query and a new search would otherwise show the previous query's marks for one hover; a scroll page (a
 * cursor) keeps it.
 */
const termHighlight: AssetSearchHighlight = {
  assetKind: AssetKind.TERM,
  term: { name: 'x' },
};
const state = (over: Partial<AssetSearchState> = {}): AssetSearchState => ({
  results: { items: [], pageInfo: { hasNext: true, total: 0 } },
  highlightByKey: {},
  ...over,
});

describe('assetSearch.slice highlights (ST-12 / #1846)', () => {
  it('a fulfilled fetch lands under its key and leaves the others alone', () => {
    const before = state({
      highlightByKey: { 'DATA_ENTITY:7': { assetKind: AssetKind.DATA_ENTITY } },
    });
    const after = reducer(
      before,
      fetchAssetSearchHighlight.fulfilled(
        { key: 'TERM:3', highlight: termHighlight },
        'req',
        { assetKind: AssetKind.TERM, assetId: 3, query: 'x' }
      )
    );
    expect(after.highlightByKey['TERM:3']).toEqual(termHighlight);
    expect(after.highlightByKey['DATA_ENTITY:7']).toEqual({
      assetKind: AssetKind.DATA_ENTITY,
    });
  });

  it('a first-page search clears every cached highlight', () => {
    const before = state({ highlightByKey: { 'TERM:3': termHighlight } });
    const after = reducer(
      before,
      searchAssets.pending('req', {
        size: 30,
        assetSearchFormData: { query: 'y', filters: {} },
      })
    );
    expect(after.highlightByKey).toEqual({});
  });

  it('a scroll page (a cursor) keeps the cached highlights', () => {
    const before = state({ highlightByKey: { 'TERM:3': termHighlight } });
    const after = reducer(
      before,
      searchAssets.pending('req', {
        size: 30,
        cursor: 'abc',
        assetSearchFormData: { query: 'y', filters: {} },
      })
    );
    expect(after.highlightByKey['TERM:3']).toEqual(termHighlight);
  });
});
