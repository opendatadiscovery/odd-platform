package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerList;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;

public interface OwnerMapper extends CRUDMapper<Owner, OwnerList, OwnerFormData, OwnerFormData, OwnerPojo> {
}
