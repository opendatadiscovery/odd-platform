package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.dto.DataEntityDto;
import com.provectus.oddplatform.dto.DataEntityIngestionDto;
import com.provectus.oddplatform.dto.EnrichedDataEntityIngestionDto;
import com.provectus.oddplatform.model.tables.pojos.DataEntityPojo;
import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;

public interface IngestionMapper {
    DataEntityIngestionDto createIngestionDto(final DataEntity dataEntity, final long dataSourceId);

    List<DataEntityIngestionDto> createIngestionDto(final Collection<DataEntity> dataEntities, final long dataSourceId);

    DataEntityPojo dtoToPojo(final EnrichedDataEntityIngestionDto dto);

    DataEntityPojo dtoToPojo(final DataEntityIngestionDto dto);

    List<DataEntityPojo> dtoToPojo(final List<EnrichedDataEntityIngestionDto> dtos);

    DataEntityDto ingestDtoToDto(final DataEntityIngestionDto ingestionDto);

    DataEntityDto ingestDtoToDto(final EnrichedDataEntityIngestionDto ingestionDto);

    List<DataEntityDto> ingestDtoToDto(final Collection<DataEntityIngestionDto> ingestionDtos);
}
