import queryStringPackage, {
  type ParseOptions,
  type StringifyOptions,
} from 'query-string';
import type { SearchFacetNames } from 'redux/interfaces';
import type { SearchFormData, SearchFormDataFilters } from 'generated-sources';

/**
 * ST-1 / ADR D10 — the main search's state lives in the URL as parametrised query params, so a search is
 * stateless, shareable, bookmarkable, and back/forward-correct. The canonical param URL replaces the
 * expiring `/search/{sessionId}` share handle (fixing the IT-125 / #1760 "session expired" dead-link class).
 *
 * ST-1a serialised the QUERY dimension. ST-1b (this module) adds the 8 facet dimensions + `myObjects` as
 * id-keyed params, so a **faceted** search is equally shareable/bookmarkable/back-forward-correct. Facet
 * values are catalog-metadata **ids** (matching the redux `facetState`); human-readable names are never in
 * the URL — they backfill from the server response.
 *
 * `page` is intentionally NOT serialised: results are infinite-scroll (`Search/Results/Results.tsx`), so a
 * `?page=N` deep-link would fetch only page N and drop the earlier items — page stays internal scroll state.
 */

/** the free-text query param */
export const SEARCH_QUERY_PARAM = 'q';
/** the My-Objects (owned-by-me) boolean param */
export const SEARCH_MY_OBJECTS_PARAM = 'my';
/** the sort-ordering param (ST-2b / #1836) — a single named ordering, honoured server-side (`SearchFormData.sort`) */
export const SEARCH_SORT_PARAM = 'sort';

/**
 * The 8 facet dimensions carried in the URL as id lists, matching the redux `facetState` keys. `entityClasses`
 * carries the selected class id(s); the `'my'`/`'all'` pseudo-classes are NOT facet ids — `'my'` rides the
 * separate `my` boolean and `'all'` is the absence of a class filter.
 */
export const SEARCH_FACET_PARAMS: SearchFacetNames[] = [
  'entityClasses',
  'types',
  'tags',
  'namespaces',
  'datasources',
  'owners',
  'groups',
  'statuses',
];

export type SearchUrlFacets = Partial<Record<SearchFacetNames, number[]>>;

/**
 * The named orderings the global sort dropdown offers (ST-2b / #1836) — the four the server-side `sort` contract ships
 * (ST-2a / `SearchSortDto`): relevance, status priority, recently updated, name. "Most popular" is intentionally NOT
 * here (deferred to ST-5 — it needs the snapshotted popularity score; the live view-count signal is trivially
 * inflatable). The token is sent verbatim as `SearchFormData.sort` and matched case-insensitively server-side; an
 * unknown/absent value falls back to the per-context default (relevance for a text query, status priority for browse).
 */
export type SearchSortValue = 'relevance' | 'status_priority' | 'updated_at' | 'name';

export interface SearchSortOption {
  value: SearchSortValue;
  /** an en.json translation key, rendered via t() — never a raw label (the i18n-key-parity object-property guard) */
  labelKey: string;
}

export const SEARCH_SORT_OPTIONS: SearchSortOption[] = [
  { value: 'relevance', labelKey: 'Relevance' },
  { value: 'status_priority', labelKey: 'Status priority' },
  { value: 'updated_at', labelKey: 'Recently updated' },
  { value: 'name', labelKey: 'Name' },
];

export const SEARCH_SORT_VALUES: SearchSortValue[] = SEARCH_SORT_OPTIONS.map(
  option => option.value
);

/**
 * The server's per-context DEFAULT ordering, mirrored here ONLY so the dropdown can display the active default when the
 * URL carries no `?sort=`. THE SINGLE SOURCE for this FE re-derivation: a text query defaults to relevance, empty browse
 * to status priority — matching `ReactiveDataEntityRepositoryImpl.getSearchResultOrderFields` / `SearchSortDto`. If the
 * server default ever changes (e.g. the ST-5 hybrid `status_priority → popularity`), update this in lockstep — or,
 * better, resolve PLT-254 (have the server echo the applied sort) so the control reads truth instead of re-deriving it.
 */
export function defaultSortForContext(
  query: string | number | boolean | null | undefined
): SearchSortValue {
  // `query` may arrive as a number or boolean — `useQueryParams` parses `?q=123` → 123 and `?q=true` → true
  // (parseNumbers/parseBooleans). Coerce defensively: a numeric/boolean query must NEVER throw in a caller's render,
  // because there is no error boundary in odd-platform-ui — an uncaught throw white-screens the whole app (IT-006).
  const text = query == null ? '' : String(query);
  return text.trim() ? 'relevance' : 'status_priority';
}

/**
 * The ordering the dropdown should DISPLAY as active: the URL's `sort` when it is one of the known tokens, else the
 * per-context default (fail-closed on an absent OR garbage value — R6). Pure so the display logic is unit-testable
 * without rendering the MUI control.
 */
export function resolveActiveSort(
  rawSort: string | number | boolean | null | undefined,
  query: string | number | boolean | null | undefined
): SearchSortValue {
  // `rawSort` may also arrive coerced (`?sort=2024` → 2024); stringify before the allow-list check — a numeric token
  // is simply not a known sort, so it falls through to the per-context default. Never throws (review B1).
  const token = rawSort == null ? undefined : String(rawSort);
  return SEARCH_SORT_VALUES.includes(token as SearchSortValue)
    ? (token as SearchSortValue)
    : defaultSortForContext(query);
}

export interface SearchUrlState {
  /** the free-text search query (an empty string means browse / no query) */
  query: string;
  /** selected facet option ids per facet dimension (empty/absent = no filter on that facet) */
  facets: SearchUrlFacets;
  /** the My-Objects (owned-by-me) filter */
  myObjects: boolean;
  /** the active ordering (ST-2b); undefined = the server's per-context default (relevance for a query, else status priority) */
  sort?: SearchSortValue;
}

/**
 * Shared with `useQueryParams`: only non-default values are emitted (`skipEmptyString`/`skipNull`), multi-value
 * facet params serialise as a bracket-separated CSV, and keys are stably sorted (query-string default) so a
 * mirror-written URL and a `useQueryParams`-written URL for the same state are byte-identical (the equality
 * loop-guard in `Search.tsx` relies on this).
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
  const params: Record<string, string | number[] | boolean | undefined> = {
    [SEARCH_QUERY_PARAM]: state.query || undefined,
  };
  SEARCH_FACET_PARAMS.forEach(name => {
    const ids = state.facets[name];
    if (ids && ids.length > 0) params[name] = ids;
  });
  if (state.myObjects) params[SEARCH_MY_OBJECTS_PARAM] = true;
  if (state.sort) params[SEARCH_SORT_PARAM] = state.sort;
  return stringify(params, QUERY_STRING_OPTIONS);
}

/**
 * Parse a URL query string (`location.search`, with or without the leading `?`) → search state.
 *
 * FAIL CLOSED (R6 / the security fail-closed constraint): unknown or malformed params are ignored, facet
 * values that are not positive integers are dropped, and it never throws — a garbage URL yields the default
 * (empty) search. The query is always coerced to a string, so a numeric-looking query stays a string.
 */
export function paramsToSearchState(search: string): SearchUrlState {
  const { parse } = queryStringPackage;
  const empty: SearchUrlState = { query: '', facets: {}, myObjects: false };
  try {
    // parseNumbers / parseBooleans stay OFF — the query is free text; facet ids are coerced explicitly below.
    const parsed = parse(search, QUERY_STRING_OPTIONS);

    const rawQuery = parsed[SEARCH_QUERY_PARAM];
    const query =
      typeof rawQuery === 'string'
        ? rawQuery
        : Array.isArray(rawQuery)
          ? String(rawQuery[0] ?? '')
          : '';

    const facets: SearchUrlFacets = {};
    SEARCH_FACET_PARAMS.forEach(name => {
      const raw = parsed[name];
      const rawValues = Array.isArray(raw) ? raw : raw != null ? [raw] : [];
      const ids = rawValues.map(v => Number(v)).filter(n => Number.isInteger(n) && n > 0);
      if (ids.length > 0) facets[name] = ids;
    });

    // `my` is serialised as the string 'true' (parseBooleans stays off), so a strict string compare is
    // enough — and anything else (absent, garbage) fails closed to `false`.
    const myObjects = parsed[SEARCH_MY_OBJECTS_PARAM] === 'true';

    // `sort` fail-closed: keep it only when it is one of the known tokens, else drop it (→ the server's per-context
    // default). Mirrors the facet-id integer filter above — a garbage `?sort=` never reaches the request.
    const rawSort = parsed[SEARCH_SORT_PARAM];
    const sortStr = typeof rawSort === 'string' ? rawSort : undefined;
    const sort = SEARCH_SORT_VALUES.includes(sortStr as SearchSortValue)
      ? (sortStr as SearchSortValue)
      : undefined;

    return { query, facets, myObjects, sort };
  } catch {
    return empty;
  }
}

/**
 * Convert parsed URL state → the `SearchFormData` the create thunk sends. Each selected facet id becomes a
 * `{entityId, selected:true}` filter; the server's `search()` runs `removeUnselected` (a REPLACE), so the URL
 * is the complete, authoritative facet spec (D10). `entityName` is intentionally omitted — it is optional on
 * the wire and backfills from the response.
 */
export function searchUrlStateToFormData(state: SearchUrlState): SearchFormData {
  const filters: SearchFormDataFilters = {};
  SEARCH_FACET_PARAMS.forEach(name => {
    const ids = state.facets[name];
    if (ids && ids.length > 0) {
      filters[name] = ids.map(entityId => ({ entityId, selected: true }));
    }
  });
  return { query: state.query, myObjects: state.myObjects, sort: state.sort, filters };
}
