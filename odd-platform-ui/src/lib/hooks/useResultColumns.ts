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
export default function useResultColumns(): ResultColumnsState {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchId: legacySessionId } = useSearchRouteParams();
  const isParamRoute = !legacySessionId;

  // The store is read once, then re-read after every write of ours (`storeVersion` bumps); it is never read on
  // a URL change, which is what keeps a URL-carried layout from leaking into it.
  const [storeVersion, setStoreVersion] = React.useState(0);
  const stored = React.useMemo(() => readStoredColumns(), [storeVersion]);

  const urlState = React.useMemo(
    () => paramsToSearchState(location.search),
    [location.search]
  );
  const urlColumns = isParamRoute ? urlState.columns : undefined;

  const columns = React.useMemo<ResultColumnId[]>(
    () => urlColumns ?? stored ?? [...DEFAULT_RESULT_COLUMNS],
    [urlColumns, stored]
  );

  // Rule 2 — the normalise effect. `replace` so back/forward never stops on the un-normalised URL; the equality
  // guard (`nextParams !== current`) means a URL that already says it is left alone.
  React.useEffect(() => {
    if (!isParamRoute || urlColumns !== undefined || !stored || isDefaultLayout(stored))
      return;
    const nextParams = searchStateToParams({ ...urlState, columns: stored });
    if (nextParams !== location.search.replace(/^\?/, '')) {
      navigate(`${searchPath()}${nextParams ? `?${nextParams}` : ''}`, { replace: true });
    }
  }, [isParamRoute, urlColumns, stored, urlState, location.search, navigate]);

  // Rule 3 — a picker action.
  const apply = React.useCallback(
    (next: ResultColumnId[]) => {
      writeStoredColumns(next);
      setStoreVersion(version => version + 1);
      if (!isParamRoute) return;
      const nextParams = searchStateToParams({ ...urlState, columns: next });
      if (nextParams !== location.search.replace(/^\?/, '')) {
        navigate(`${searchPath()}${nextParams ? `?${nextParams}` : ''}`);
      }
    },
    [isParamRoute, urlState, location.search, navigate]
  );

  const toggle = React.useCallback(
    (id: ResultColumnId) =>
      apply(
        columns.includes(id) ? columns.filter(column => column !== id) : [...columns, id]
      ),
    [apply, columns]
  );

  const move = React.useCallback(
    (id: ResultColumnId, direction: 'up' | 'down') => {
      const index = columns.indexOf(id);
      const target = direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || target < 0 || target >= columns.length) return;
      const next = [...columns];
      [next[index], next[target]] = [next[target], next[index]];
      apply(next);
    },
    [apply, columns]
  );

  const reset = React.useCallback(() => apply([...DEFAULT_RESULT_COLUMNS]), [apply]);

  return { columns, toggle, move, reset };
}
