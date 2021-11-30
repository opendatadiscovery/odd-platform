package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.UUID;
import org.opendatadiscovery.oddplatform.api.contract.model.CountableSearchFilter;
import org.opendatadiscovery.oddplatform.api.contract.model.FacetState;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;

public interface FacetStateMapper {
    FacetStateDto mapForm(final SearchFormData formData);

    SearchFacetsPojo mapStateToPojo(final FacetStateDto state);

    SearchFacetsPojo mapStateToPojo(final UUID searchId, final FacetStateDto state);

    FacetStateDto pojoToState(final SearchFacetsPojo facetsRecord);

    FacetState mapDto(final List<CountableSearchFilter> types, final FacetStateDto state);
}
