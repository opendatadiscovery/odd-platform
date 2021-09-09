package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.MetadataField;
import com.provectus.oddplatform.api.contract.model.MetadataFieldFormData;
import com.provectus.oddplatform.api.contract.model.MetadataFieldList;
import com.provectus.oddplatform.api.contract.model.MetadataUpdateCustomFieldFormData;

public interface MetadataService
    extends
    CRUDService<MetadataField, MetadataFieldList, MetadataFieldFormData, MetadataUpdateCustomFieldFormData> {
}
