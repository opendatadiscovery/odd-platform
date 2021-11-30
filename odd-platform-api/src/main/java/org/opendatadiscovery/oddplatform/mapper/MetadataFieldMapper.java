package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataField;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldList;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldValue;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataUpdateCustomFieldFormData;
import org.opendatadiscovery.oddplatform.dto.MetadataDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;

public interface MetadataFieldMapper
    extends
    CRUDMapper<MetadataField, MetadataFieldList, MetadataFieldFormData,
        MetadataUpdateCustomFieldFormData, MetadataFieldPojo> {
    MetadataFieldValue mapDto(final MetadataDto dto);

    List<MetadataFieldValue> mapDtos(final Collection<MetadataDto> dto);
}
