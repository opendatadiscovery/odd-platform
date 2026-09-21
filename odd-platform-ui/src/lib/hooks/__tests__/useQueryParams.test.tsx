import React from 'react';
import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import useQueryParams from '../useQueryParams';

/**
 * useQueryParams ST-1 extension (ADR D10): `setQueryParams` gains an optional `{ pathname, replace }`.
 * The defaults (current pathname, push) reproduce the prior behaviour exactly — the ~37 existing callers
 * pass no options. ST-1 passes `{ pathname: '/search' }` to write the canonical base-path param URL.
 */
const wrapper =
  (initialPath: string) =>
  ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
  );

function setup(initialPath: string) {
  return renderHook(
    () => ({ qp: useQueryParams<{ q: string }>({ q: '' }), loc: useLocation() }),
    { wrapper: wrapper(initialPath) }
  );
}

describe('useQueryParams', () => {
  it('parses query params from the URL', () => {
    const { result } = setup('/search?q=hello');
    expect(result.current.qp.queryParams).toMatchObject({ q: 'hello' });
  });

  it('writes params onto the CURRENT pathname by default (backward-compatible — push)', () => {
    const { result } = setup('/activity?q=');
    act(() => result.current.qp.setQueryParams({ q: 'x' }));
    expect(result.current.loc.pathname).toBe('/activity');
    expect(result.current.loc.search).toBe('?q=x');
  });

  it('writes onto an OVERRIDE pathname when given (ST-1 D10 — canonical /search base, drops the session id)', () => {
    const { result } = setup('/search/sess-123');
    act(() => result.current.qp.setQueryParams({ q: 'orders' }, { pathname: '/search' }));
    expect(result.current.loc.pathname).toBe('/search');
    expect(result.current.loc.search).toBe('?q=orders');
  });

  it('a functional update builds on the params the BROWSER is on when the router lags a navigation (CTRIB-073)', () => {
    // The router's `location.search` trails a `navigate` by the page's render (react-router 7 commits inside
    // startTransition; ~0.5 s measured on the search page). An updater called inside that window — the sort menu
    // right after the column picker closed — spread the router's stale copy and dropped the `columns[]` the picker
    // had just written. Modelled: the browser's history has moved on while the memory router shows the old URL.
    const { result } = setup('/search?q=x');
    window.history.replaceState({}, '', '/search?columns[]=owners&q=x');
    try {
      act(() =>
        result.current.qp.setQueryParams(
          prev => ({ ...prev, sort: 'name' }) as unknown as { q: string },
          { pathname: '/search' }
        )
      );
      expect(result.current.loc.search).toBe('?columns[]=owners&q=x&sort=name');
    } finally {
      window.history.replaceState({}, '', '/');
    }
  });

  it('keeps the router as the source of `prev` under a memory router whose pathname the browser is not on', () => {
    const { result } = setup('/activity?q=a');
    // the browser (jsdom) is on `/`; the router on `/activity` — the pathnames differ, so the router's memo is used
    act(() => result.current.qp.setQueryParams(prev => ({ ...prev, q: 'b' })));
    expect(result.current.loc.search).toBe('?q=b');
  });

  it('threads the replace option without changing the target URL', () => {
    const { result } = setup('/search?q=a');
    act(() =>
      result.current.qp.setQueryParams({ q: 'b' }, { pathname: '/search', replace: true })
    );
    expect(`${result.current.loc.pathname}${result.current.loc.search}`).toBe(
      '/search?q=b'
    );
  });
});
