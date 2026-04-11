package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityStatus;
import org.opendatadiscovery.oddplatform.api.contract.model.InternalDescriptionFormData;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import reactor.core.publisher.Mono;

public interface DataEntityInternalStateService {
    Mono<DataEntityPojo> updateDescription(final long dataEntityId,
                                           final InternalDescriptionFormData formData);

    Mono<Void> changeStatusForDataEntities(final List<DataEntityPojo> pojos,
                                           final DataEntityStatus newStatus);

    Mono<Void> restoreDeletedDataEntityRelations(final List<DataEntityPojo> deletedPojos);
}
