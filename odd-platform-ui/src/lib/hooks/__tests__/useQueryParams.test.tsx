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
