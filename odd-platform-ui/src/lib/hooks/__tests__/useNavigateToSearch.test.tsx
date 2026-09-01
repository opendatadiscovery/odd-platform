import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type * as ReactRouterDom from 'react-router-dom';
import useNavigateToSearch from '../useNavigateToSearch';

/**
 * #1835 ST-1c — the shared param-URL navigator hook. It builds the canonical `/search?…` URL (ADR D10) from a
 * partial SearchUrlState and navigates there, replacing `useCreateSearch` (which created a `/search/{sessionId}`
 * URL where facet filtering was dead). RED on ref:main — the hook does not exist there (this file fails to
 * import) — GREEN on the fix. The emitted param strings are the exact forms `searchStateToParams` produces
 * (see lib/search/__tests__/searchUrlState.test.ts).
 */
const { navigateSpy } = vi.hoisted(() => ({ navigateSpy: vi.fn() }));
vi.mock('react-router-dom', async importOriginal => ({
  ...(await importOriginal<typeof ReactRouterDom>()),
  useNavigate: () => navigateSpy,
}));

const navigateWith = (state?: Parameters<ReturnType<typeof useNavigateToSearch>>[0]) => {
  navigateSpy.mockClear();
  const { result } = renderHook(() => useNavigateToSearch());
  result.current(state);
  return navigateSpy;
};

describe('useNavigateToSearch — canonical param-URL navigation (ADR D10 / #1835 ST-1c)', () => {
  it('navigates to a clean /search for an empty/absent state', () => {
    expect(navigateWith()).toHaveBeenCalledWith('/search');
    expect(navigateWith({})).toHaveBeenCalledWith('/search');
  });

  it('serialises a single tag facet into the param URL', () => {
    expect(navigateWith({ facets: { tags: [5] } })).toHaveBeenCalledWith(
      '/search?tags[]=5'
    );
  });

  it('serialises entityClasses + types together (stable key order: entityClasses before types)', () => {
    expect(
      navigateWith({ facets: { entityClasses: [1], types: [1] } })
    ).toHaveBeenCalledWith('/search?entityClasses[]=1&types[]=1');
  });

  it('carries the free-text query', () => {
    expect(navigateWith({ query: 'orders' })).toHaveBeenCalledWith('/search?q=orders');
  });

  // ST-8 (#1842): the navigator now carries the My-data SCOPE GROUP, not the retired My-Objects boolean.
  // This is the exact construction the three catalog-overview panels use for their "View all" deep-links, so
  // it must stay byte-identical to what the Search.tsx mirror writes — a divergence here silently defeats the
  // mirror's equality loop-guard.
  it('carries a My-data scope', () => {
    expect(navigateWith({ myData: ['MY_OBJECTS'] })).toHaveBeenCalledWith(
      '/search?my_data[]=MY_OBJECTS'
    );
  });

  it('carries a lineage scope with its per-direction depth', () => {
    expect(
      navigateWith({ myData: ['DOWNSTREAM'], downstreamDepth: 2 })
    ).toHaveBeenCalledWith('/search?downstream_depth=2&my_data[]=DOWNSTREAM');
  });
});
