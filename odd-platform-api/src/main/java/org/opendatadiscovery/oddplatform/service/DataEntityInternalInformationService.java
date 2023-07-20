package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.InternalDescriptionFormData;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import reactor.core.publisher.Mono;

public interface DataEntityInternalInformationService {
    Mono<DataEntityPojo> updateDescription(final long dataEntityId,
                                           final InternalDescriptionFormData formData);
}
