package org.opendatadiscovery.oddplatform.mapper.ingestion;

import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;

public interface DataSourceIngestionMapper {
    DataSourcePojo mapIngestionModel(final DataSource ds, final Long namespaceId, final Long tokenId);

    DataSource mapDtoToIngestionModel(final DataSourceDto dto);
}
