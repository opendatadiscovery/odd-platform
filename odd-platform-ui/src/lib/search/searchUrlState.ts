import queryStringPackage, {
  type ParseOptions,
  type StringifyOptions,
} from 'query-string';
import type { SearchFacetNames } from 'redux/interfaces';
import { AssetKind } from 'generated-sources';
import type {
  AssetSearchFormData,
  SearchFormData,
  SearchFormDataFilters,
} from 'generated-sources';

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
/**
 * The LEGACY My-Objects boolean param. Still PARSED (an old bookmark, a shared link, or a saved search from
 * before ST-8 must keep working — ADR D9) but no longer written: it round-trips forward into `my_data`.
 */
export const SEARCH_MY_OBJECTS_PARAM = 'my';
/**
 * ST-8 (#1842) — the My-data scope group param. A list of {@link MyDataScope} tokens; empty / absent = no
 * scope narrowing (the "All" state). Multiple scopes are UNIONed server-side.
 */
export const SEARCH_MY_DATA_PARAM = 'my_data';
/** ST-8 — how many lineage hops upstream the UPSTREAM scope walks. 1..3, default 1 (ADR D4). */
export const SEARCH_UPSTREAM_DEPTH_PARAM = 'upstream_depth';
/** ST-8 — how many lineage hops downstream the DOWNSTREAM scope walks. 1..3, default 1, independent of upstream. */
export const SEARCH_DOWNSTREAM_DEPTH_PARAM = 'downstream_depth';

/**
 * The My-data scopes (ST-8 / #1842, ADR unified-asset-search D4). `MY_OBJECTS` is what the caller owns;
 * `UPSTREAM` / `DOWNSTREAM` are its depth-bounded lineage neighbours, excluding the owned anchors themselves.
 */
export type MyDataScope = 'MY_OBJECTS' | 'UPSTREAM' | 'DOWNSTREAM';

export const MY_DATA_SCOPES: MyDataScope[] = ['MY_OBJECTS', 'UPSTREAM', 'DOWNSTREAM'];

/** Parse-time allow-list, so an unknown scope token fails closed (dropped) exactly like an unknown asset kind. */
const VALID_MY_DATA_SCOPES = new Set<string>(MY_DATA_SCOPES);

/** The per-direction lineage depth ceiling (ADR D4). Mirrors MyDataScopeResolverImpl.MAX_DEPTH server-side. */
export const MY_DATA_MAX_DEPTH = 3;
export const MY_DATA_DEFAULT_DEPTH = 1;
export const MY_DATA_DEPTH_OPTIONS: number[] = [1, 2, 3];
/** the sort-ordering param (ST-2b / #1836) — a single named ordering, honoured server-side (`SearchFormData.sort`) */
export const SEARCH_SORT_PARAM = 'sort';
/**
 * The Asset-type-kind param (ST-4 / #1838) — the cross-kind narrowing dimension. A list of `AssetKind`
 * tokens ({@link AssetKind}); empty / absent = all kinds. Unlike the DE entity-class facet (which rides the
 * redux `entityClasses` facet + `?entityClasses=`), the Term / Query-Example kinds have no facet today, so the
 * kind selection is a URL-only param (like `sort`) carried verbatim into `AssetSearchFormData.asset_kinds`.
 */
export const SEARCH_ASSET_KINDS_PARAM = 'asset_kinds';
/**
 * The Favorites-scope param (ST-7 / #1841) — narrows the cross-kind results to the caller's own starred
 * assets. A URL-only param like {@link SEARCH_SORT_PARAM} and {@link SEARCH_ASSET_KINDS_PARAM}, NOT a redux
 * facet: favorites has no server-aggregated counts and no `SearchFacetNames` key, and it rides
 * `AssetSearchFormData` (the unified path) rather than the shared `SearchFormData`.
 *
 * Spelled `yes` / `no` in the URL (human-readable, and what the Catalog Overview panel deep-links to);
 * absent = no narrowing. It maps to the wire's optional boolean in
 * {@link searchUrlStateToAssetSearchFormData}.
 *
 * BEING URL-ONLY IS LOAD-BEARING: `Search.tsx`'s facet→URL mirror rebuilds the URL from the redux facet
 * state, which carries none of these params, so `favorites` MUST be merged back there alongside `sort` and
 * `assetKinds` — otherwise any sidebar facet toggle silently drops an active Favorites filter (the #1858
 * dropped-selection class).
 */
export const SEARCH_FAVORITES_PARAM = 'favorites';

/** The two meaningful values of {@link SEARCH_FAVORITES_PARAM}; absent is the third (no narrowing) state. */
export type SearchFavoritesValue = 'yes' | 'no';

const SEARCH_FAVORITES_VALUES: SearchFavoritesValue[] = ['yes', 'no'];

/**
 * The Popularity range params (ST-9 / #1843, ADR unified-asset-search D5) — a closed, inclusive range over the
 * snapshotted popularity SCORE of a data entity: the 15-minute bucketed view-count band on the unified index,
 * 0..20 (score s = views in [2^s − 1, 2^(s+1) − 2]; the server's facet response carries every band's exact view
 * boundaries, which is what the user is shown — never the score). Two scalar URL-only params like the My-data
 * depths (`?popularity_min=4&popularity_max=9`); an absent bound is open; absent both = no range. URL-only for the
 * same reason `favorites` is: no server-aggregated facet in the legacy session, and it rides `AssetSearchFormData`.
 *
 * FAIL CLOSED, mirroring the server's `PopularityRangeDto`: a non-integer bound drops the WHOLE range (no filter —
 * the junk is ignored on load and normalises away on the next mirror write, like `asset_kinds` junk); an
 * out-of-range integer is CLAMPED into [0, 20] (the depth precedent — the chip then names the clamped band the
 * request actually runs); an inverted range (min > max after clamping) is dropped whole. The UI never SENDS an
 * inverted range, so the server's contradictory-⇒-empty rule is reachable by direct API clients only.
 *
 * BEING URL-ONLY IS LOAD-BEARING: `Search.tsx`'s facet→URL mirror MUST merge these two params back (the #1858
 * dropped-selection class — see the comment there).
 */
export const SEARCH_POPULARITY_MIN_PARAM = 'popularity_min';
export const SEARCH_POPULARITY_MAX_PARAM = 'popularity_max';
/** The score domain — mirrors `PopularityBands.MIN_SCORE/MAX_SCORE` server-side. */
export const POPULARITY_MIN_SCORE = 0;
export const POPULARITY_MAX_SCORE = 20;

/** A popularity range in scores; at least one bound is set (a range with neither is represented as `undefined`). */
export interface SearchPopularityRange {
  min?: number;
  max?: number;
}

/** The set of valid `asset_kinds` tokens — a parse-time allow-list so an unknown kind fails closed (dropped). */
const VALID_ASSET_KINDS = new Set<string>(Object.values(AssetKind));

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
 * The named orderings the global sort dropdown offers (ST-2b / #1836) — the server-side `sort` contract's tokens
 * (ST-2a / `SearchSortDto`): relevance, status priority, recently updated, name, and — since ST-9 (#1843), on the
 * ST-5c popularity snapshot — most popular (it was deliberately absent until that snapshot existed, because the
 * live view-count signal is trivially inflatable and a write hotspot). The token is sent verbatim as
 * `SearchFormData.sort` and matched case-insensitively server-side; an unknown/absent value falls back to the
 * per-context default (relevance for a text query, status priority for browse). `popularity` is honoured by the
 * cross-kind `/api/search/assets`; the legacy `/api/search` session resolves it to that same default.
 */
export type SearchSortValue =
  | 'relevance'
  | 'status_priority'
  | 'updated_at'
  | 'name'
  | 'popularity';

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
  { value: 'popularity', labelKey: 'Most popular' },
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
  /**
   * The selected My-data scopes (ST-8); undefined / empty = no scope narrowing. A legacy `?my=true` URL parses
   * into `['MY_OBJECTS']`, so old links keep working while the state has a single representation.
   */
  myData?: MyDataScope[];
  /** hops walked by the UPSTREAM scope; undefined = the default of 1 */
  upstreamDepth?: number;
  /** hops walked by the DOWNSTREAM scope; undefined = the default of 1 */
  downstreamDepth?: number;
  /** the active ordering (ST-2b); undefined = the server's per-context default (relevance for a query, else status priority) */
  sort?: SearchSortValue;
  /** the selected asset-type kinds (ST-4); undefined / empty = all kinds */
  assetKinds?: AssetKind[];
  /** the Favorites scope (ST-7); undefined = no favorites narrowing */
  favorites?: SearchFavoritesValue;
  /** the Popularity range in scores (ST-9); undefined = no popularity narrowing */
  popularity?: SearchPopularityRange;
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
  const params: Record<
    string,
    string | number | number[] | string[] | boolean | undefined
  > = {
    [SEARCH_QUERY_PARAM]: state.query || undefined,
  };
  SEARCH_FACET_PARAMS.forEach(name => {
    const ids = state.facets[name];
    if (ids && ids.length > 0) params[name] = ids;
  });
  // ST-8: only `my_data` is WRITTEN — a legacy `?my=true` read earlier round-trips forward into it, so the
  // canonical URL has exactly one representation of the scope and old links normalise on first write.
  if (state.myData && state.myData.length > 0)
    params[SEARCH_MY_DATA_PARAM] = state.myData;
  // Depths are emitted only when they differ from the default AND their direction is actually selected, so a
  // default search stays a clean URL and the round-trip is byte-identical.
  if (
    state.myData?.includes('UPSTREAM') &&
    state.upstreamDepth &&
    state.upstreamDepth !== MY_DATA_DEFAULT_DEPTH
  ) {
    params[SEARCH_UPSTREAM_DEPTH_PARAM] = state.upstreamDepth;
  }
  if (
    state.myData?.includes('DOWNSTREAM') &&
    state.downstreamDepth &&
    state.downstreamDepth !== MY_DATA_DEFAULT_DEPTH
  ) {
    params[SEARCH_DOWNSTREAM_DEPTH_PARAM] = state.downstreamDepth;
  }
  if (state.sort) params[SEARCH_SORT_PARAM] = state.sort;
  // Serialise the asset-type kinds only when a narrowing is active (like `sort`): an empty selection is
  // "all kinds" → omitted, so the default state stays a clean URL and the round-trip is byte-identical.
  if (state.assetKinds && state.assetKinds.length > 0) {
    params[SEARCH_ASSET_KINDS_PARAM] = state.assetKinds;
  }
  // Serialised only when a narrowing is active (like `sort`): absent = no favorites filter, so the default
  // state stays a clean URL and the round-trip is byte-identical.
  if (state.favorites) params[SEARCH_FAVORITES_PARAM] = state.favorites;
  // ST-9 — each bound only when set. `!== undefined`, not truthiness: a bound of 0 ("never viewed") is a real value.
  if (state.popularity?.min !== undefined)
    params[SEARCH_POPULARITY_MIN_PARAM] = state.popularity.min;
  if (state.popularity?.max !== undefined)
    params[SEARCH_POPULARITY_MAX_PARAM] = state.popularity.max;
  return stringify(params, QUERY_STRING_OPTIONS);
}

/**
 * Parse a URL query string (`location.search`, with or without the leading `?`) → search state.
 *
 * FAIL CLOSED (R6 / the security fail-closed constraint): unknown or malformed params are ignored, facet
 * values that are not positive integers are dropped, and it never throws — a garbage URL yields the default
 * (empty) search. The query is always coerced to a string, so a numeric-looking query stays a string.
 */
/**
 * A per-direction lineage depth from the URL, FAIL CLOSED: anything that is not an integer inside
 * [1, {@link MY_DATA_MAX_DEPTH}] becomes `undefined` (i.e. the server's default of 1). It never throws and
 * never produces an out-of-range value, so a hand-edited or stale shareable link degrades instead of erroring
 * — the same contract `sort` has, and the reason the wire type carries no `minimum`/`maximum`.
 */
function parseDepth(raw: unknown): number | undefined {
  const depth = Number(raw);
  return Number.isInteger(depth) && depth >= 1 && depth <= MY_DATA_MAX_DEPTH
    ? depth
    : undefined;
}

/**
 * One popularity bound, FAIL CLOSED: `undefined` = absent (open); `null` = invalid (the caller drops the whole
 * range); otherwise an integer clamped into [0, 20]. Only a string (the URL) or a number (a stored spec) can be a
 * bound — an array (a repeated param) or an object is junk.
 */
function parsePopularityBound(raw: unknown): number | null | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;
  const score = Number(raw);
  if (!Number.isInteger(score)) return null;
  return Math.max(POPULARITY_MIN_SCORE, Math.min(POPULARITY_MAX_SCORE, score));
}

/**
 * The popularity range from two raw bounds (URL params or a stored spec's fields) — the ONE fail-closed reading
 * both surfaces share, so a URL and a saved search can never disagree about what a range means (ADR D11). Junk in
 * either bound, or an inverted range, yields `undefined` (no range) rather than a partial or contradictory filter.
 * Never throws (IT-006: no error boundary in odd-platform-ui).
 */
export function parsePopularity(
  rawMin: unknown,
  rawMax: unknown
): SearchPopularityRange | undefined {
  const min = parsePopularityBound(rawMin);
  const max = parsePopularityBound(rawMax);
  if (min === null || max === null) return undefined;
  if (min === undefined && max === undefined) return undefined;
  if (min !== undefined && max !== undefined && min > max) return undefined;
  return {
    ...(min !== undefined ? { min } : {}),
    ...(max !== undefined ? { max } : {}),
  };
}

export function paramsToSearchState(search: string): SearchUrlState {
  const { parse } = queryStringPackage;
  const empty: SearchUrlState = { query: '', facets: {} };
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

    // ST-8 — the My-data scopes, fail-closed on the same allow-list pattern as `asset_kinds`: unknown tokens
    // are dropped and an empty result collapses to `undefined` (the All state), so a garbage or stale URL
    // narrows nothing rather than erroring.
    const rawScopes = parsed[SEARCH_MY_DATA_PARAM];
    const rawScopeValues = Array.isArray(rawScopes)
      ? rawScopes
      : rawScopes != null
        ? [rawScopes]
        : [];
    const scopeList = rawScopeValues.filter(
      (v): v is MyDataScope => typeof v === 'string' && VALID_MY_DATA_SCOPES.has(v)
    );
    // BACK-COMPAT (ADR D9): a pre-ST-8 `?my=true` link or saved search means the owned scope. `my` is
    // serialised as the string 'true' (parseBooleans stays off), so a strict compare is enough — anything
    // else (absent, garbage) contributes nothing.
    const legacyMyObjects = parsed[SEARCH_MY_OBJECTS_PARAM] === 'true';
    const myData =
      scopeList.length > 0
        ? scopeList
        : legacyMyObjects
          ? (['MY_OBJECTS'] as MyDataScope[])
          : undefined;

    const upstreamDepth = parseDepth(parsed[SEARCH_UPSTREAM_DEPTH_PARAM]);
    const downstreamDepth = parseDepth(parsed[SEARCH_DOWNSTREAM_DEPTH_PARAM]);

    // `sort` fail-closed: keep it only when it is one of the known tokens, else drop it (→ the server's per-context
    // default). Mirrors the facet-id integer filter above — a garbage `?sort=` never reaches the request.
    const rawSort = parsed[SEARCH_SORT_PARAM];
    const sortStr = typeof rawSort === 'string' ? rawSort : undefined;
    const sort = SEARCH_SORT_VALUES.includes(sortStr as SearchSortValue)
      ? (sortStr as SearchSortValue)
      : undefined;

    // `asset_kinds` fail-closed (mirrors the facet-id filter): keep only tokens in the AssetKind allow-list,
    // drop garbage, and collapse an empty result to `undefined` (→ all kinds) so the state round-trips exactly.
    const rawKinds = parsed[SEARCH_ASSET_KINDS_PARAM];
    const rawKindValues = Array.isArray(rawKinds)
      ? rawKinds
      : rawKinds != null
        ? [rawKinds]
        : [];
    const kindList = rawKindValues.filter(
      (v): v is AssetKind => typeof v === 'string' && VALID_ASSET_KINDS.has(v)
    );
    const assetKinds = kindList.length > 0 ? kindList : undefined;

    // `favorites` fail-closed (mirrors `sort`): keep only the two known tokens, drop anything else to
    // undefined (→ no narrowing). A garbage `?favorites=` never reaches the request.
    const rawFavorites = parsed[SEARCH_FAVORITES_PARAM];
    const favoritesStr = typeof rawFavorites === 'string' ? rawFavorites : undefined;
    const favorites = SEARCH_FAVORITES_VALUES.includes(
      favoritesStr as SearchFavoritesValue
    )
      ? (favoritesStr as SearchFavoritesValue)
      : undefined;

    // ST-9 — the popularity range, fail-closed (see parsePopularity): junk or an inverted pair → no range.
    const popularity = parsePopularity(
      parsed[SEARCH_POPULARITY_MIN_PARAM],
      parsed[SEARCH_POPULARITY_MAX_PARAM]
    );

    return {
      query,
      facets,
      myData,
      upstreamDepth,
      downstreamDepth,
      sort,
      assetKinds,
      favorites,
      popularity,
    };
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
  return {
    query: state.query,
    // ST-8: `my_objects` is STILL emitted whenever MY_OBJECTS is selected. The legacy /api/search session
    // reads only this field, and it drives the facet sidebar's Type-filter visibility (getSearchEntityClass
    // returns 'my' iff search.myObjects) — so dropping it would silently change a shipped surface. The session
    // simply ignores `my_data` and the depths; only the cross-kind /api/search/assets path honours them.
    myObjects: state.myData?.includes('MY_OBJECTS') ?? false,
    myData: state.myData,
    upstreamDepth: state.upstreamDepth,
    downstreamDepth: state.downstreamDepth,
    sort: state.sort,
    filters,
  };
}

/**
 * ST-4 (#1838) — the cross-kind counterpart of {@link searchUrlStateToFormData}: the URL state → the
 * `AssetSearchFormData` the stateless `POST /api/search/assets` fetch sends. It reuses the shared
 * `SearchFormData` projection (query + filters + sort + myObjects, all round-tripped exactly as today) and
 * layers the `asset_kinds` narrowing on top. `searchUrlStateToFormData` is left untouched so the existing
 * `createDataEntitiesSearch` (`/api/search`) path keeps its non-breaking `SearchFormData` contract (D9); an
 * empty kind selection is omitted (→ all kinds) so it never over-constrains the request.
 */
export function searchUrlStateToAssetSearchFormData(
  state: SearchUrlState
): AssetSearchFormData {
  return {
    ...searchUrlStateToFormData(state),
    assetKinds:
      state.assetKinds && state.assetKinds.length > 0 ? state.assetKinds : undefined,
    // `yes`/`no` → the wire's optional boolean. Absent stays absent: `favorites: false` is a REAL filter
    // (only assets the caller has NOT starred), so an absent scope must never be sent as `false`.
    favorites: state.favorites === undefined ? undefined : state.favorites === 'yes',
    // ST-9 — the range rides the wire as the same {min, max} scores; absent stays absent (no key, so the
    // server never sees an empty object it would have to treat as "no range").
    popularity: state.popularity,
  };
}

/**
 * The inverse of {@link searchUrlStateToFormData}: rebuild the shareable URL state from the shared
 * `SearchFormData` half of a persisted spec (ST-3 / ADR D11). Since #1878 a saved search stores the FULL
 * `AssetSearchFormData`; callers that reapply or share a saved search use {@link assetSearchFormDataToUrlState},
 * which layers the two URL-only dimensions on top of this. A caller rebuilds the canonical param URL with
 * `searchStateToParams(...)`, so a saved search REAPPLIES by navigating to that URL and the Search page
 * re-queries itself off it (D10).
 *
 * FAIL CLOSED, and NEVER throws — there is no error boundary in odd-platform-ui, so an uncaught throw in a
 * caller's render white-screens the whole app (IT-006). A `sort` outside the known tokens is dropped to
 * `undefined` (→ the server's per-context default, mirroring `paramsToSearchState`); only facet ids that are
 * positive integers with `selected !== false` survive; and a missing / undefined `filters` (a defensively
 * empty or malformed stored spec) yields no facets instead of throwing.
 */
export function searchFormDataToUrlState(formData: SearchFormData): SearchUrlState {
  const filters: SearchFormDataFilters = formData.filters ?? {};
  const facets: SearchUrlFacets = {};
  SEARCH_FACET_PARAMS.forEach(name => {
    const ids = (filters[name] ?? [])
      .filter(state => state?.selected !== false)
      .map(state => Number(state?.entityId))
      .filter(id => Number.isInteger(id) && id > 0);
    if (ids.length > 0) facets[name] = ids;
  });
  const sort = SEARCH_SORT_VALUES.includes(formData.sort as SearchSortValue)
    ? (formData.sort as SearchSortValue)
    : undefined;
  // ST-8 — REAPPLY: a spec saved before ST-8 carries only `my_objects`, so it maps forward to [MY_OBJECTS];
  // a spec saved after carries `my_data`, which wins. Same allow-list + clamp as the URL parse, because a
  // stored spec is just as untrusted as a URL and must never throw in a caller's render (IT-006).
  const storedScopes = (formData.myData ?? []).filter((scope): scope is MyDataScope =>
    VALID_MY_DATA_SCOPES.has(scope)
  );
  const myData =
    storedScopes.length > 0
      ? storedScopes
      : formData.myObjects
        ? (['MY_OBJECTS'] as MyDataScope[])
        : undefined;
  return {
    query: formData.query ?? '',
    facets,
    myData,
    upstreamDepth: parseDepth(formData.upstreamDepth),
    downstreamDepth: parseDepth(formData.downstreamDepth),
    sort,
  };
}

/**
 * #1878 (ADR D11 — one canonical spec, two surfaces): the inverse of {@link searchUrlStateToAssetSearchFormData},
 * for a persisted saved-search spec. Rebuilds the complete URL state — the shared half via
 * {@link searchFormDataToUrlState}, then the two dimensions that live only on `AssetSearchFormData`:
 * `assetKinds` (filtered through the same `AssetKind` allow-list the URL parse uses, so a stale stored token is
 * dropped rather than sent) and `favorites` (`true` → `'yes'`, `false` → `'no'` — a REAL filter, only un-starred
 * assets — and anything else, including the `null` a row saved before #1878 reads back with, → no narrowing).
 *
 * FAIL CLOSED and NEVER throws, like its sibling: this runs in a caller's render (IT-006). A row saved before
 * the widening reapplies exactly as it did — the same URL, no new params.
 */
export function assetSearchFormDataToUrlState(
  formData: AssetSearchFormData
): SearchUrlState {
  // A missing spec object (never produced by the API, which always returns at least `{}`) still must not throw.
  const base = searchFormDataToUrlState(formData ?? ({} as AssetSearchFormData));
  const rawKinds: unknown = formData?.assetKinds;
  const assetKinds = (Array.isArray(rawKinds) ? rawKinds : []).filter(
    (kind): kind is AssetKind => typeof kind === 'string' && VALID_ASSET_KINDS.has(kind)
  );
  const rawFavorites: unknown = formData?.favorites;
  const favorites: SearchFavoritesValue | undefined =
    rawFavorites === true ? 'yes' : rawFavorites === false ? 'no' : undefined;
  // ST-9 — the stored range through the SAME fail-closed reading the URL uses (a stored spec is as untrusted as
  // a URL): a non-object, a non-integer bound, or an inverted pair → no range, never a throw. A row saved before
  // ST-9 carries no `popularity` and reapplies exactly as it did.
  const rawRange: unknown = formData?.popularity;
  const range =
    rawRange && typeof rawRange === 'object' && !Array.isArray(rawRange)
      ? (rawRange as { min?: unknown; max?: unknown })
      : undefined;
  const popularity = range ? parsePopularity(range.min, range.max) : undefined;
  return {
    ...base,
    ...(assetKinds.length > 0 ? { assetKinds } : {}),
    ...(favorites ? { favorites } : {}),
    ...(popularity ? { popularity } : {}),
  };
}
