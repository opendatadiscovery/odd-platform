package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.DataSetField;
import org.opendatadiscovery.oddplatform.dto.DatasetFieldDto;

public interface DatasetFieldApiMapper {
    DataSetField mapDto(final DatasetFieldDto dto);
}
