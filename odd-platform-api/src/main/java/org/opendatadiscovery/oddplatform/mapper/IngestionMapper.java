package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;

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
