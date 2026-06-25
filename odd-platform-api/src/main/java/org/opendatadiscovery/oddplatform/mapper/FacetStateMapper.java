package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.UUID;
import org.opendatadiscovery.oddplatform.api.contract.model.CountableSearchFilter;
import org.opendatadiscovery.oddplatform.api.contract.model.FacetState;
import org.opendatadiscovery.oddplatform.api.contract.model.QueryExampleSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.ReferenceDataSearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.SearchFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TermFacetState;
import org.opendatadiscovery.oddplatform.api.contract.model.TermSearchFormData;
import org.opendatadiscovery.oddplatform.dto.FacetStateDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.SearchFacetsPojo;

public interface FacetStateMapper {
    FacetStateDto mapForm(final SearchFormData formData);

    FacetStateDto mapForm(final TermSearchFormData formData);

    FacetStateDto mapForm(final QueryExampleSearchFormData formData);

    FacetStateDto mapForm(final ReferenceDataSearchFormData formData);

    SearchFacetsPojo mapStateToPojo(final FacetStateDto state);

    SearchFacetsPojo mapStateToPojo(final UUID searchId, final FacetStateDto state);

    FacetStateDto pojoToState(final SearchFacetsPojo facetsRecord);

    TermFacetState mapDto(final FacetStateDto state);

    FacetState mapDto(final List<CountableSearchFilter> entityClasses, final FacetStateDto state);

    SearchFormData mapToFormData(final List<Long> namespaceIds,
                                 final List<Long> datasourceIds,
                                 final List<Long> ownerIds,
                                 final List<Long> tagIds,
                                 final List<Integer> entityClasses,
                                 final List<Integer> types);
}
