package org.opendatadiscovery.oddplatform.mapper.ingestion;

import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;

public interface DataSourceIngestionMapper {
    DataSourcePojo mapIngestionModel(final DataSource ds, final Long namespaceId, final Long tokenId);

    DataSourceDto mapIngestionModel(final DataSource ds);

    DataSource mapDtoToIngestionModel(final DataSourceDto dto);
}
