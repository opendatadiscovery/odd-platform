package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerList;
import reactor.core.publisher.Mono;

public interface OwnerService extends CRUDService<Owner, OwnerList, OwnerFormData, OwnerFormData> {
    Mono<Owner> createOrGet(final OwnerFormData formData);
    Owner createOrGetModel(final OwnerFormData formData);
}
