package org.opendatadiscovery.oddplatform.repository;

import java.util.Optional;
import java.util.UUID;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;

public interface SearchFacetRepository {
    Optional<SearchFacetsPojo> getFacetState(final UUID id);

    SearchFacetsPojo persistFacetState(final SearchFacetsPojo pojo);

    SearchFacetsPojo updateFacetState(final SearchFacetsPojo pojo);
}
