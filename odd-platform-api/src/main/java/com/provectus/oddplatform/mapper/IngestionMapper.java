package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.dto.DataEntityDto;
import com.provectus.oddplatform.dto.DataEntityIngestionDto;
import com.provectus.oddplatform.ingestion.contract.model.DataEntity;
import com.provectus.oddplatform.model.tables.pojos.DataEntityPojo;

import java.util.List;

public interface IngestionMapper {
    DataEntityIngestionDto createIngestionDto(final DataEntity dataEntity, final long dataSourceId);

    List<DataEntityIngestionDto> createIngestionDto(final List<DataEntity> dataEntities, final long dataSourceId);

    DataEntityPojo dtoToPojo(final DataEntityIngestionDto dto);

    List<DataEntityPojo> dtoToPojo(final List<DataEntityIngestionDto> dtos);

    DataEntityDto ingestDtoToDto(final DataEntityIngestionDto ingestionDto);

    List<DataEntityDto> ingestDtoToDto(final List<DataEntityIngestionDto> ingestionDtos);
}
