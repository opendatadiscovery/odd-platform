import { useQuery } from '@tanstack/react-query';
import { assetSearchApi } from 'lib/api';
import type { AssetSearchFormData, PopularityFacet } from 'generated-sources';

/**
 * ST-9 (#1843) — the popularity distribution behind the Popularity range facet: `POST /api/search/assets/facets/
 * popularity` for the same request the results run, returning the 21 bands (scores 0..20) with their exact view
 * boundaries and the count of data entities of the current result set in each.
 *
 * Two things are stripped from the request before it is sent and before it is keyed, because neither changes the
 * counted set: the request's OWN `popularity` range (the exclude-own-facet rule — the bars must show what the user
 * can still slide back to, and the server ignores it anyway) and `sort` (an aggregate has no order). So a slider
 * drag or a re-sort re-fetches nothing, while any facet / query / kind / scope change does — the client-side
 * "cached per filter state" the issue asked for, without a server cache (measured unnecessary at 126k assets:
 * the aggregate costs about the same as the result count and runs alongside it).
 *
 * `retry: 0` + a caller-side `isError` branch: the results never wait for this request, and the control degrades
 * to a bar-less slider over the full 0..20 rail if it fails (the range predicate itself does not depend on it).
 */
export function usePopularityFacet(formData: AssetSearchFormData) {
  const { popularity: _popularity, sort: _sort, ...counted } = formData;
  const key = stableKey(counted);
  return useQuery<PopularityFacet>({
    queryKey: ['popularityFacet', key],
    queryFn: () =>
      assetSearchApi.getAssetSearchPopularityFacet({ assetSearchFormData: counted }),
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });
}

/** A key-sorted JSON string, so two structurally equal requests (whatever the property order) share one cache entry. */
function stableKey(value: unknown): string {
  return JSON.stringify(value, (_k, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.keys(v as Record<string, unknown>)
          .sort()
          .reduce<Record<string, unknown>>((acc, k) => {
            acc[k] = (v as Record<string, unknown>)[k];
            return acc;
          }, {})
      : v
  );
}
