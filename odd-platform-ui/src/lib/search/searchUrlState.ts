import queryStringPackage, {
  type ParseOptions,
  type StringifyOptions,
} from 'query-string';

/**
 * ST-1 / ADR D10 — the main search's state lives in the URL as parametrised query params, so a search is
 * stateless, shareable, bookmarkable, and back/forward-correct. The canonical param URL replaces the
 * expiring `/search/{sessionId}` share handle (fixing the IT-125 / #1760 "session expired" dead-link class).
 *
 * ST-1a serialises the QUERY dimension only. The facet params (namespace, datasource, owner, tag, group,
 * status, type) are layered on **additively** in ST-1b, so this module is intentionally facet-extension-ready
 * (same `query-string` options as {@link useQueryParams}).
 *
 * `page` is intentionally NOT serialised: results are infinite-scroll (`Search/Results/Results.tsx`), so a
 * `?page=N` deep-link would fetch only page N and drop the earlier items — page stays internal scroll state.
 */
export interface SearchUrlState {
  /** the free-text search query (an empty string means browse / no query) */
  query: string;
}

/** the canonical URL param name for the search query */
export const SEARCH_QUERY_PARAM = 'q';

/**
 * Shared with `useQueryParams`: only non-default values are emitted (`skipEmptyString`/`skipNull`), and
 * multi-value params (the ST-1b facets) serialise as a bracket-separated CSV.
 */
const QUERY_STRING_OPTIONS: StringifyOptions & ParseOptions = {
  arrayFormat: 'bracket-separator',
  arrayFormatSeparator: ',',
  skipEmptyString: true,
  skipNull: true,
};

/**
 * Serialise search state → a URL query string (no leading `?`). Empty values are omitted, so the
 * default/empty state yields `''` (a clean `/search` URL).
 */
export function searchStateToParams(state: SearchUrlState): string {
  const { stringify } = queryStringPackage;
  return stringify({ [SEARCH_QUERY_PARAM]: state.query }, QUERY_STRING_OPTIONS);
}

/**
 * Parse a URL query string (`location.search`, with or without the leading `?`) → search state.
 *
 * FAIL CLOSED (R5 / the security fail-closed constraint): unknown or malformed params are ignored and the
 * query defaults to `''` — it never throws and never crashes the page. The query is always coerced to a
 * string, so a numeric-looking query such as `2024` stays the string `"2024"` (never a number).
 */
export function paramsToSearchState(search: string): SearchUrlState {
  const { parse } = queryStringPackage;
  try {
    // parseNumbers / parseBooleans are intentionally OFF — the query is free text and must stay a string.
    const parsed = parse(search, QUERY_STRING_OPTIONS);
    const raw = parsed[SEARCH_QUERY_PARAM];
    const query =
      typeof raw === 'string' ? raw : Array.isArray(raw) ? String(raw[0] ?? '') : '';
    return { query };
  } catch {
    return { query: '' };
  }
}
