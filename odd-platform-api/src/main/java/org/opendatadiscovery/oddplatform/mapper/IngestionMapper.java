package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.DataEntityDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.dto.ingestion.EnrichedDataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;

public interface IngestionMapper {
    DataEntityIngestionDto createIngestionDto(final DataEntity dataEntity, final long dataSourceId);

    <T extends DataEntityIngestionDto> DataEntityPojo dtoToPojo(final T dto);

    <T extends DataEntityIngestionDto> DataEntityDto ingestDtoToDto(final T ingestionDto);

    List<DataEntityDto> ingestDtoToDto(final Collection<DataEntityIngestionDto> ingestionDtos);
}
