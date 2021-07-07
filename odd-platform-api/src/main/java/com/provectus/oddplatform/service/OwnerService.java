package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.Owner;
import com.provectus.oddplatform.api.contract.model.OwnerFormData;
import com.provectus.oddplatform.api.contract.model.OwnerList;
import reactor.core.publisher.Mono;

public interface OwnerService extends CRUDService<Owner, OwnerList, OwnerFormData, OwnerFormData> {
    Mono<Owner> createOrGet(final OwnerFormData formData);
}
