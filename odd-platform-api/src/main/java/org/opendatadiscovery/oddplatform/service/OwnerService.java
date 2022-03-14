package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerList;

public interface OwnerService extends CRUDService<Owner, OwnerList, OwnerFormData, OwnerFormData> {
    Owner createOrGet(final OwnerFormData formData);
}
