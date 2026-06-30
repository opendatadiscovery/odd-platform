import { describe, expect, it } from 'vitest';
import {
  paramsToSearchState,
  searchStateToParams,
  type SearchUrlState,
} from '../searchUrlState';

/**
 * ST-1a (ADR D10) — the search query ⇄ URL param round-trip. The URL is the canonical, shareable search
 * state; this is the (de)serialiser the Search page reads on load and writes on each committed query.
 * RED before `searchUrlState.ts` existed (the module was absent); GREEN on the implementation.
 */
describe('searchUrlState — query ⇄ URL params (ST-1a / D10)', () => {
  it('round-trips a query through the URL (identity)', () => {
    const state: SearchUrlState = { query: 'sales orders' };
    const params = searchStateToParams(state);
    expect(params).toContain('q=');
    expect(paramsToSearchState(`?${params}`)).toEqual(state);
  });

  it('omits an empty query → a clean (empty) URL', () => {
    expect(searchStateToParams({ query: '' })).toBe('');
  });

  it('fails closed: unknown / garbage params are ignored and the query defaults to empty', () => {
    expect(paramsToSearchState('?q=hello&bogus=1&=&%zz')).toEqual({ query: 'hello' });
    expect(paramsToSearchState('?')).toEqual({ query: '' });
    expect(paramsToSearchState('')).toEqual({ query: '' });
  });

  it('keeps a numeric-looking query as a string (never coerced to a number)', () => {
    expect(paramsToSearchState('?q=2024')).toEqual({ query: '2024' });
  });

  it('preserves special characters through the round-trip (encoding-safe)', () => {
    const state: SearchUrlState = { query: 'a & b / c?d e' };
    expect(paramsToSearchState(`?${searchStateToParams(state)}`)).toEqual(state);
  });
});
