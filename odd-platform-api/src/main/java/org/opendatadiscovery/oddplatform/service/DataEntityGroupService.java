package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityGroupFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityRef;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.CompactDataEntityList;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import reactor.core.publisher.Mono;

public interface DataEntityGroupService {
    Mono<DataEntityRef> createDataEntityGroup(final DataEntityGroupFormData formData);

    Mono<DataEntityRef> updateDataEntityGroup(final Long id, final DataEntityGroupFormData formData);

    Mono<DataEntityPojo> deleteDataEntityGroup(final Long id);

    Mono<CompactDataEntityList> listEntitiesWithinDEG(final String degOddrn);
}
