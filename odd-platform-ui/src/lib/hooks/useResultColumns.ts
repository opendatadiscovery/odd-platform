import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchPath, useSearchRouteParams } from 'routes';
import {
  DEFAULT_RESULT_COLUMNS,
  isDefaultLayout,
  type ResultColumnId,
} from 'lib/search/resultColumns';
import { readStoredColumns, writeStoredColumns } from 'lib/search/resultColumnsStore';
import { paramsToSearchState, searchStateToParams } from 'lib/search/searchUrlState';

export interface ResultColumnsState {
  /** the ACTIVE layout — the optional column ids in order (the anchors are implicit) */
  columns: ResultColumnId[];
  /** add or remove an optional column */
  toggle: (id: ResultColumnId) => void;
  /** move an optional column one step */
  move: (id: ResultColumnId, direction: 'up' | 'down') => void;
  /** back to the default layout */
  reset: () => void;
}

/**
 * ST-13a (#1847, ADR unified-asset-search D7 + D12; the maintainer's GATE-1 decision that the layout rides the
 * URL and a saved search) — the ONE owner of the result-column layout's state machine. `Results.tsx` calls it once
 * and passes the layout down; the header, rows, skeleton and picker never read the store or the URL themselves.
 *
 * The rules (CTRIB-073 R13), in the order they apply:
 *  1. The active layout is derived LIVE, on every render: the URL's `columns[]` when present, else the browser's
 *     stored layout, else the default. So a shared link or a reapplied saved search shows ITS layout, and a plain
 *     `/search?q=` shows the reader's own.
 *  2. The URL is the single truth for Save / Copy-link / the facet mirror: on the param route, a URL with no
 *     `columns` while the stored layout differs from the default is NORMALISED to carry it, with `replace` (no
 *     history entry — the ST-8 `?my=true` precedent), and only when the URL would actually change.
 *  3. A picker action writes the STORE and — on the param route — the URL, through the ONE serialiser
 *     (`searchStateToParams` over the live state), as a `push` (the `sort` idiom); the serialiser omits `columns`
 *     when the layout is the default, so `Reset to default` REMOVES the param rather than writing an explicit
 *     default. On the legacy `/search/{sessionId}` route (no param URL) a picker action writes the store only —
 *     never a navigation away from the session.
 *  4. Opening a link that carries `columns` does NOT overwrite the reader's stored layout: the store is written by
 *     the picker alone, so the first picker action on a shared view starts from the layout on screen and stores
 *     the result — "until you change a column yourself".
 */
const sameLayout = (
  a: readonly ResultColumnId[],
  b: readonly ResultColumnId[]
): boolean => a.length === b.length && a.every((id, index) => id === b[index]);

export default function useResultColumns(): ResultColumnsState {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchId: legacySessionId } = useSearchRouteParams();
  const isParamRoute = !legacySessionId;

  // The store is read ONCE at mount and then mirrored in a ref that every write of ours updates synchronously —
  // never re-read on a URL change (that is what keeps a URL-carried layout out of it), and never a step behind a
  // navigation: a reset that navigated to a plain URL while the render still held the pre-reset store would let
  // the normalise effect below write the old layout straight back (measured on the stand — the "stale store"
  // race). A version counter re-renders the readers after a write.
  const storedRef = React.useRef<ResultColumnId[] | undefined | null>(null);
  if (storedRef.current === null) storedRef.current = readStoredColumns();
  const stored = storedRef.current ?? undefined;
  const [, bump] = React.useReducer((version: number) => version + 1, 0);

  const urlState = React.useMemo(
    () => paramsToSearchState(location.search),
    [location.search]
  );
  const urlColumns = isParamRoute ? urlState.columns : undefined;

  // A picker action's layout is PENDING until the URL reflects it (or, on the legacy route, until the next
  // render — the store already holds it). Reading the active layout from the URL alone let a burst of clicks
  // lose changes: react-router renders one navigation behind a fast second click, and a render that recomputed
  // the layout from a stale URL overwrote the layout the previous click had just applied (measured on the
  // stand: six unticks left four columns on). The pending layout wins until the URL catches up.
  const pendingRef = React.useRef<ResultColumnId[] | null>(null);
  if (pendingRef.current) {
    const pending = pendingRef.current;
    const urlSaysIt =
      urlColumns !== undefined
        ? sameLayout(urlColumns, pending)
        : isDefaultLayout(pending);
    if (!isParamRoute || urlSaysIt) pendingRef.current = null;
  }

  const columns = React.useMemo<ResultColumnId[]>(
    () => pendingRef.current ?? urlColumns ?? stored ?? [...DEFAULT_RESULT_COLUMNS],
    [pendingRef.current, urlColumns, stored]
  );
  // The LATEST active layout, for the actions: two picker clicks inside one render (a fast user, a test) must
  // each start from the other's result, not from the layout the render closed over.
  const columnsRef = React.useRef(columns);
  columnsRef.current = columns;
  // The last params THIS hook navigated to — the guard for a burst, where the render's location is a step behind.
  // Re-synced to the rendered location once it caught up, so a facet toggle or a back navigation in between is
  // never compared against a stale target.
  const lastNavigatedRef = React.useRef<string | null>(null);
  if (!pendingRef.current) lastNavigatedRef.current = null;

  // Rule 2 — the normalise effect. `replace` so back/forward never stops on the un-normalised URL; the equality
  // guard (`nextParams !== current`) means a URL that already says it is left alone.
  React.useEffect(() => {
    if (!isParamRoute || urlColumns !== undefined || !stored || isDefaultLayout(stored))
      return;
    if (pendingRef.current) return; // an action is in flight — its own navigation is the truth
    const nextParams = searchStateToParams({ ...urlState, columns: stored });
    if (nextParams !== location.search.replace(/^\?/, '')) {
      lastNavigatedRef.current = nextParams;
      navigate(`${searchPath()}${nextParams ? `?${nextParams}` : ''}`, { replace: true });
    }
  }, [isParamRoute, urlColumns, stored, urlState, location.search, navigate]);

  // Rule 3 — a picker action.
  const apply = React.useCallback(
    (next: ResultColumnId[]) => {
      writeStoredColumns(next);
      storedRef.current = next;
      columnsRef.current = next;
      pendingRef.current = next;
      bump();
      if (!isParamRoute) return;
      const nextParams = searchStateToParams({ ...urlState, columns: next });
      const current = lastNavigatedRef.current ?? location.search.replace(/^\?/, '');
      if (nextParams !== current) {
        lastNavigatedRef.current = nextParams;
        navigate(`${searchPath()}${nextParams ? `?${nextParams}` : ''}`);
      }
    },
    [isParamRoute, urlState, location.search, navigate]
  );

  const toggle = React.useCallback(
    (id: ResultColumnId) => {
      const current = columnsRef.current;
      apply(
        current.includes(id) ? current.filter(column => column !== id) : [...current, id]
      );
    },
    [apply]
  );

  const move = React.useCallback(
    (id: ResultColumnId, direction: 'up' | 'down') => {
      const current = columnsRef.current;
      const index = current.indexOf(id);
      const target = direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || target < 0 || target >= current.length) return;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      apply(next);
    },
    [apply]
  );

  const reset = React.useCallback(() => apply([...DEFAULT_RESULT_COLUMNS]), [apply]);

  return { columns, toggle, move, reset };
}
