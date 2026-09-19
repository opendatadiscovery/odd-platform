import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import {
  DEFAULT_RESULT_COLUMNS,
  RESULT_COLUMNS_STORAGE_KEY,
  serializeStoredColumns,
} from 'lib/search/resultColumns';
import useResultColumns from '../useResultColumns';

/**
 * ST-13a (#1847) — the layout's state machine (CTRIB-073 R13): the URL is the live truth, the store is the baseline
 * a plain search starts from, a picker action writes both through the one serialiser (on the param route) or the
 * store only (on a legacy session view), and a URL-carried layout never reaches the store on its own.
 */
const wrapper =
  (initialPath: string) =>
  ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path='/search' element={children} />
        <Route path='/search/:searchId' element={children} />
      </Routes>
    </MemoryRouter>
  );

function setup(initialPath: string) {
  return renderHook(() => ({ rc: useResultColumns(), loc: useLocation() }), {
    wrapper: wrapper(initialPath),
  });
}

const stored = () => window.localStorage.getItem(RESULT_COLUMNS_STORAGE_KEY);
const url = (r: { current: { loc: { pathname: string; search: string } } }) =>
  `${r.current.loc.pathname}${r.current.loc.search}`;

describe('useResultColumns', () => {
  beforeEach(() => window.localStorage.clear());

  it('a fresh browser on a plain URL shows the default and writes nothing anywhere', () => {
    const { result } = setup('/search?q=x');
    expect(result.current.rc.columns).toEqual([...DEFAULT_RESULT_COLUMNS]);
    expect(url(result)).toBe('/search?q=x');
    expect(stored()).toBeNull();
  });

  it('the URL layout wins over the store, and is NOT stored (rule 4)', () => {
    window.localStorage.setItem(
      RESULT_COLUMNS_STORAGE_KEY,
      serializeStoredColumns(['status'])
    );
    const { result } = setup('/search?columns[]=owners,type&q=x');
    expect(result.current.rc.columns).toEqual(['owners', 'type']);
    expect(url(result)).toBe('/search?columns[]=owners,type&q=x');
    expect(stored()).toBe(serializeStoredColumns(['status']));
  });

  it('a stored non-default layout on a plain URL applies AND is normalised into the URL with replace (rule 2)', () => {
    window.localStorage.setItem(
      RESULT_COLUMNS_STORAGE_KEY,
      serializeStoredColumns(['status', 'query'])
    );
    const { result } = setup('/search?q=x&sort=name');
    expect(result.current.rc.columns).toEqual(['status', 'query']);
    expect(url(result)).toBe('/search?columns[]=status,query&q=x&sort=name');
  });

  it('a stored DEFAULT layout is never written to the URL', () => {
    window.localStorage.setItem(
      RESULT_COLUMNS_STORAGE_KEY,
      serializeStoredColumns([...DEFAULT_RESULT_COLUMNS])
    );
    const { result } = setup('/search?q=x');
    expect(url(result)).toBe('/search?q=x');
  });

  it('a corrupted store falls back to the default', () => {
    window.localStorage.setItem(RESULT_COLUMNS_STORAGE_KEY, '{"v":2,"columns":["type"]}');
    const { result } = setup('/search?q=x');
    expect(result.current.rc.columns).toEqual([...DEFAULT_RESULT_COLUMNS]);
    expect(url(result)).toBe('/search?q=x');
  });

  it('toggle / move / reset write the store AND the URL through the one serialiser; reset REMOVES the param (rule 3)', () => {
    const { result } = setup('/search?q=x');
    act(() => result.current.rc.toggle('datasource'));
    expect(result.current.rc.columns).toEqual([...DEFAULT_RESULT_COLUMNS, 'datasource']);
    expect(url(result)).toBe(
      '/search?columns[]=type,namespace,owners,status,updated_at,datasource&q=x'
    );
    expect(stored()).toBe(
      serializeStoredColumns([...DEFAULT_RESULT_COLUMNS, 'datasource'])
    );

    act(() => result.current.rc.move('datasource', 'up'));
    expect(result.current.rc.columns).toEqual([
      'type',
      'namespace',
      'owners',
      'status',
      'datasource',
      'updated_at',
    ]);
    act(() => result.current.rc.move('type', 'up')); // already first: a no-op
    expect(result.current.rc.columns[0]).toBe('type');
    act(() => result.current.rc.toggle('type'));
    expect(result.current.rc.columns).toEqual([
      'namespace',
      'owners',
      'status',
      'datasource',
      'updated_at',
    ]);

    act(() => result.current.rc.reset());
    expect(result.current.rc.columns).toEqual([...DEFAULT_RESULT_COLUMNS]);
    expect(url(result)).toBe('/search?q=x');
    expect(stored()).toBe(serializeStoredColumns([...DEFAULT_RESULT_COLUMNS]));
  });

  it('unticking every optional column is the valid anchors-only layout: columns[] in the URL, [] in the store', () => {
    const { result } = setup('/search?q=x');
    // one act per toggle: each reads the layout of the render it came from (the picker works the same way)
    DEFAULT_RESULT_COLUMNS.forEach(id => act(() => result.current.rc.toggle(id)));
    expect(result.current.rc.columns).toEqual([]);
    expect(url(result)).toBe('/search?columns[]&q=x');
    expect(stored()).toBe(serializeStoredColumns([]));
  });

  it("two picker actions inside one render each start from the other's result — never from a stale layout", () => {
    // A fast double click (or a burst of unticks) must not lose a change: the actions read the LATEST layout
    // through a ref, not the one the render closed over. Measured on the stand before the fix: a burst of five
    // unticks left four columns on.
    const { result } = setup('/search?q=x');
    act(() => {
      result.current.rc.toggle('type');
      result.current.rc.toggle('namespace');
      result.current.rc.move('owners', 'down');
    });
    // default minus type / namespace = [owners, status, updated_at]; owners moved down = [status, owners, updated_at]
    expect(result.current.rc.columns).toEqual(['status', 'owners', 'updated_at']);
    expect(url(result)).toBe('/search?columns[]=status,owners,updated_at&q=x');
    expect(stored()).toBe(serializeStoredColumns(['status', 'owners', 'updated_at']));
  });

  it('reset right after a re-order lands on the plain URL and STAYS there (the stale-store race)', () => {
    const { result } = setup('/search?q=x');
    act(() => result.current.rc.move('status', 'up'));
    expect(url(result)).toBe(
      '/search?columns[]=type,namespace,status,owners,updated_at&q=x'
    );
    act(() => result.current.rc.reset());
    expect(url(result)).toBe('/search?q=x');
    expect(result.current.rc.columns).toEqual([...DEFAULT_RESULT_COLUMNS]);
  });

  it('the first picker action on a shared link starts from the shared layout and stores the result (rule 4)', () => {
    window.localStorage.setItem(
      RESULT_COLUMNS_STORAGE_KEY,
      serializeStoredColumns(['status'])
    );
    const { result } = setup('/search?columns[]=owners,type&q=x');
    act(() => result.current.rc.toggle('rows_count'));
    expect(result.current.rc.columns).toEqual(['owners', 'type', 'rows_count']);
    expect(stored()).toBe(serializeStoredColumns(['owners', 'type', 'rows_count']));
  });

  it('on a legacy /search/{sessionId} view a picker action writes the store only — the location never changes', () => {
    const { result } = setup('/search/abc-123');
    expect(result.current.rc.columns).toEqual([...DEFAULT_RESULT_COLUMNS]);
    act(() => result.current.rc.toggle('datasource'));
    expect(result.current.rc.columns).toEqual([...DEFAULT_RESULT_COLUMNS, 'datasource']);
    expect(url(result)).toBe('/search/abc-123');
    expect(stored()).toBe(
      serializeStoredColumns([...DEFAULT_RESULT_COLUMNS, 'datasource'])
    );
  });
});
