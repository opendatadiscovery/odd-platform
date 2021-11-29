package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.MetadataField;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldList;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataUpdateCustomFieldFormData;

public interface MetadataService
    extends
    CRUDService<MetadataField, MetadataFieldList, MetadataFieldFormData, MetadataUpdateCustomFieldFormData> {
}
