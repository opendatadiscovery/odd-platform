package org.opendatadiscovery.oddplatform.mapper.ingestion;

import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSource;

public interface DataSourceIngestionMapper {

    DataSourceDto mapIngestionModel(final DataSource ds);

    DataSource mapDtoToIngestionModel(final DataSourceDto dto);
}
