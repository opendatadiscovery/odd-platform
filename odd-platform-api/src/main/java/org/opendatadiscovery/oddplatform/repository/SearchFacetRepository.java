package org.opendatadiscovery.oddplatform.repository;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.dto.SearchFilterId;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;

public interface SearchFacetRepository {
    Optional<SearchFacetsPojo> getFacetState(final UUID id);

    SearchFacetsPojo persistFacetState(final SearchFacetsPojo pojo);

    SearchFacetsPojo updateFacetState(final SearchFacetsPojo pojo);

    Map<SearchFilterId, Long> getEntityClassFacet(final FacetStateDto state);

    Map<SearchFilterId, Long> getTypeFacet(final String facetQuery,
                                           final int page,
                                           final int size,
                                           final FacetStateDto state);

    Map<SearchFilterId, Long> getOwnerFacet(final String facetQuery,
                                            final int page,
                                            final int size,
                                            final FacetStateDto state);

    Map<SearchFilterId, Long> getTagFacet(final String facetQuery,
                                          final int page,
                                          final int size,
                                          final FacetStateDto state);
}
