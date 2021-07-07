package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.CountableSearchFilter;
import com.provectus.oddplatform.api.contract.model.FacetState;
import com.provectus.oddplatform.api.contract.model.SearchFormData;
import com.provectus.oddplatform.dto.FacetStateDto;
import com.provectus.oddplatform.model.tables.pojos.SearchFacetsPojo;

import java.util.List;
import java.util.UUID;

public interface FacetStateMapper {
    FacetStateDto mapForm(final SearchFormData formData);

    SearchFacetsPojo mapStateToPojo(final FacetStateDto state);

    SearchFacetsPojo mapStateToPojo(final UUID searchId, final FacetStateDto state);

    FacetStateDto pojoToState(final SearchFacetsPojo facetsRecord);

    FacetState mapDto(final List<CountableSearchFilter> types, final FacetStateDto state);
}
