package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.CountableSearchFilter;
import com.provectus.oddplatform.api.contract.model.FacetState;
import com.provectus.oddplatform.api.contract.model.SearchFacetsData;
import com.provectus.oddplatform.api.contract.model.SearchFilter;
import com.provectus.oddplatform.dto.SearchFilterDto;
import com.provectus.oddplatform.dto.SearchFilterId;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class SearchMapperImpl implements SearchMapper {
    @Override
    public SearchFacetsData mapDto(final UUID searchId, final String query, final FacetState facetState) {
        return new SearchFacetsData()
                .query(query)
                .facetState(facetState)
                .searchId(searchId);
    }

    @Override
    public SearchFilter mapDto(final SearchFilterDto dto) {
        return new SearchFilter()
                .id(dto.getEntityId())
                .name(dto.getEntityName());
    }

    @Override
    public CountableSearchFilter mapCountableSearchFilter(final SearchFilterId filterId, final long count) {
        return new CountableSearchFilter()
                .id(filterId.getEntityId())
                .name(filterId.getName())
                .count(count);
    }
}
