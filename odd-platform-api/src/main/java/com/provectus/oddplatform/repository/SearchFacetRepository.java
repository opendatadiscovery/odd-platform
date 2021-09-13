package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.model.tables.pojos.SearchFacetsPojo;
import java.util.Optional;
import java.util.UUID;

public interface SearchFacetRepository {
    Optional<SearchFacetsPojo> getFacetState(final UUID id);

    SearchFacetsPojo persistFacetState(final SearchFacetsPojo pojo);

    SearchFacetsPojo updateFacetState(final SearchFacetsPojo pojo);
}
