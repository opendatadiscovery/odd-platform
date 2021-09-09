package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.CountableSearchFilter;
import com.provectus.oddplatform.api.contract.model.FacetState;
import com.provectus.oddplatform.api.contract.model.SearchFacetsData;
import com.provectus.oddplatform.api.contract.model.SearchFilter;
import com.provectus.oddplatform.dto.SearchFilterDto;
import com.provectus.oddplatform.dto.SearchFilterId;
import java.util.UUID;

public interface SearchMapper {
    SearchFacetsData mapDto(final UUID searchId, final String query, final FacetState facetState);

    SearchFilter mapDto(final SearchFilterDto dto);

    CountableSearchFilter mapCountableSearchFilter(final SearchFilterId filterId, final long count);
}
