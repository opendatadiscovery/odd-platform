package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.MetadataDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldValuePojo;

public interface MetadataFieldValueRepository extends CRUDRepository<MetadataFieldValuePojo> {
    List<MetadataDto> getDtosByDataEntityId(final long dataEntityId);

    List<MetadataFieldValuePojo> listByDataEntityIds(final List<Long> dataEntityIds);

    void delete(final long dataEntityId, final long metadataFieldId);
}
