package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.Owner;
import com.provectus.oddplatform.api.contract.model.OwnerFormData;
import com.provectus.oddplatform.api.contract.model.OwnerList;
import com.provectus.oddplatform.model.tables.pojos.OwnerPojo;

public interface OwnerMapper extends CRUDMapper<Owner, OwnerList, OwnerFormData, OwnerFormData, OwnerPojo> {
}
