package org.opendatadiscovery.oddplatform.mapper;

import java.util.UUID;
import org.opendatadiscovery.oddplatform.api.contract.model.CountableSearchFilter;
import org.opendatadiscovery.oddplatform.api.contract.model.FacetState;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFilter;
import org.opendatadiscovery.oddplatform.dto.SearchFilterDto;
import org.opendatadiscovery.oddplatform.dto.SearchFilterId;
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
