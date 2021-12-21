package org.opendatadiscovery.oddplatform.mapper.ingestion;

import java.util.Collection;
import java.util.List;
import org.opendatadiscovery.oddplatform.dto.ingestion.DataEntityIngestionDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataEntity;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;

public interface IngestionMapper {
    DataEntityIngestionDto createIngestionDto(final DataEntity dataEntity, final long dataSourceId);

    <T extends DataEntityIngestionDto> DataEntityPojo dtoToPojo(final T dto);

    <T extends DataEntityIngestionDto> List<DataEntityPojo> dtoToPojo(final Collection<T> dto);
}
