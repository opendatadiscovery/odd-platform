package org.opendatadiscovery.oddplatform.service;

import java.util.UUID;
import org.opendatadiscovery.oddplatform.api.contract.model.LookupTableList;
import org.opendatadiscovery.oddplatform.api.contract.model.ReferenceDataSearchFacetsData;
import org.opendatadiscovery.oddplatform.api.contract.model.ReferenceDataSearchFormData;
import reactor.core.publisher.Mono;

public interface LookupDataSearchService {
    Mono<ReferenceDataSearchFacetsData> search(final ReferenceDataSearchFormData referenceDataSearchFormData);

    Mono<ReferenceDataSearchFacetsData> getFacets(final UUID searchId);

    Mono<ReferenceDataSearchFacetsData> updateFacets(final UUID searchId, final ReferenceDataSearchFormData fd);

    Mono<LookupTableList> getSearchResults(final UUID searchId, final Integer page, final Integer size);
}
