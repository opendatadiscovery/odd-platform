package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupItemList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.CompactDataEntityList;
import reactor.core.publisher.Mono;

public interface DataEntityGroupService {
    Mono<DataEntityRef> createDataEntityGroup(final DataEntityGroupFormData formData);

    Mono<DataEntityRef> updateDataEntityGroup(final Long id, final DataEntityGroupFormData formData);

    Mono<CompactDataEntityList> listEntitiesWithinDEG(final String degOddrn);

    Mono<DataEntityGroupItemList> listDEGItems(final Long dataEntityGroupId, final Integer page,
                                               final Integer size, final String query);
}
