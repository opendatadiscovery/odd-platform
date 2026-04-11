package org.opendatadiscovery.oddplatform.mapper;

import java.util.UUID;
import org.opendatadiscovery.oddplatform.api.contract.model.CountableSearchFilter;
import org.opendatadiscovery.oddplatform.api.contract.model.FacetState;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFilter;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;
import org.opendatadiscovery.oddplatform.dto.SearchFilterId;

public interface SearchMapper {
    SearchFacetsData mapDto(final UUID searchId, final String query, final FacetState facetState);

    SearchFilter mapDto(final SearchFilterDto dto);

    CountableSearchFilter mapCountableSearchFilter(final SearchFilterId filterId, final long count);
}
