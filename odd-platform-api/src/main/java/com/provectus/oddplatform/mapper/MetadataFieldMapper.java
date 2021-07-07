package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.MetadataField;
import com.provectus.oddplatform.api.contract.model.MetadataFieldFormData;
import com.provectus.oddplatform.api.contract.model.MetadataFieldList;
import com.provectus.oddplatform.api.contract.model.MetadataFieldValue;
import com.provectus.oddplatform.api.contract.model.MetadataUpdateCustomFieldFormData;
import com.provectus.oddplatform.dto.MetadataDto;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldPojo;

import java.util.Collection;
import java.util.List;

public interface MetadataFieldMapper
    extends CRUDMapper<MetadataField, MetadataFieldList, MetadataFieldFormData, MetadataUpdateCustomFieldFormData, MetadataFieldPojo> {
    MetadataFieldValue mapDto(final MetadataDto dto);

    List<MetadataFieldValue> mapDtos(final Collection<MetadataDto> dto);
}
