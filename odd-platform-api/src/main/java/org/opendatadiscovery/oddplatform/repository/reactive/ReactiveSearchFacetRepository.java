package org.opendatadiscovery.oddplatform.repository.reactive;

import java.util.Map;
import java.util.UUID;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.FacetType;
import org.opendatadiscovery.oddplatform.dto.SearchFilterId;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;
import reactor.core.publisher.Mono;

public interface ReactiveSearchFacetRepository {

    Mono<SearchFacetsPojo> create(final SearchFacetsPojo pojo);

    Mono<SearchFacetsPojo> update(final SearchFacetsPojo pojo);

    Mono<SearchFacetsPojo> get(final UUID id);

    Mono<Map<SearchFilterId, Long>> getTagFacetForTerms(final String facetQuery,
                                                        final int page,
                                                        final int size,
                                                        final FacetStateDto state);

    Mono<Map<SearchFilterId, Long>> getOwnerFacetForTerms(final String facetQuery,
                                                          final int page,
                                                          final int size,
                                                          final FacetStateDto state);

    Mono<Map<SearchFilterId, Long>> getEntityClassFacetForDataEntity(final FacetStateDto state);

    Mono<Map<SearchFilterId, Long>> getTypeFacetForDataEntity(final String facetQuery,
                                                              final int page,
                                                              final int size,
                                                              final FacetStateDto state);

    Mono<Map<SearchFilterId, Long>> getOwnerFacetForDataEntity(final String facetQuery,
                                                               final int page,
                                                               final int size,
                                                               final FacetStateDto state);

    Mono<Map<SearchFilterId, Long>> getTagFacetForDataEntity(final String facetQuery,
                                                             final int page,
                                                             final int size,
                                                             final FacetStateDto state);

    Mono<Map<SearchFilterId, Long>> getGroupFacetForDataEntity(final String facetQuery,
                                                               final int page,
                                                               final int size,
                                                               final FacetStateDto state);

    Mono<Map<SearchFilterId, Long>> getStatusFacetForDataEntity(final String query,
                                                                final int page,
                                                                final int size,
                                                                final FacetStateDto state);

    /**
     * Resolve the display NAME of every SELECTED facet option in {@code state}, keyed by facet type then option id.
     * A URL-derived search request (ST-1a/ST-1b, #1825) carries facet IDs only — no names — so the facet echo would
     * otherwise render name-less chips on a fresh shared link (and violate {@code SearchFilter.required: [id, name]}).
     * DB-backed facets (owners, tags, namespaces, datasources, groups) are resolved with one batched
     * {@code id IN (…)} lookup each; enum-backed facets (types, statuses) resolve in-process; entity classes are
     * skipped (already echoed as a full named histogram). Runs no query when no facet of a type is selected, and
     * always emits (an empty map when nothing is selected) — never {@code Mono.empty()}.
     */
    Mono<Map<FacetType, Map<Long, String>>> resolveFacetNames(final FacetStateDto state);
}
