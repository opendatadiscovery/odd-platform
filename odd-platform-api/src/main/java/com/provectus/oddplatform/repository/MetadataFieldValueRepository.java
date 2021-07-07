package com.provectus.oddplatform.repository;

import com.provectus.oddplatform.dto.MetadataDto;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldValuePojo;

import java.util.List;

public interface MetadataFieldValueRepository extends CRUDRepository<MetadataFieldValuePojo> {
    List<MetadataDto> getDtosByDataEntityId(final long dataEntityId);

    List<MetadataFieldValuePojo> listByDataEntityIds(final List<Long> dataEntityIds);

    void delete(final long dataEntityId, final long metadataFieldId);
}
