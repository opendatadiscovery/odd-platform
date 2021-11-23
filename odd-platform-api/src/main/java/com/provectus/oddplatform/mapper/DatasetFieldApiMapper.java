package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.DataSetField;
import com.provectus.oddplatform.dto.DatasetFieldDto;

public interface DatasetFieldApiMapper {
    DataSetField mapDto(final DatasetFieldDto dto);
}
