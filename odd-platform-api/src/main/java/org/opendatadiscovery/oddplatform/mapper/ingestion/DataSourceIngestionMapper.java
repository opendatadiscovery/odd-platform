package org.opendatadiscovery.oddplatform.mapper.ingestion;

import org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;

public interface DataSourceIngestionMapper {
    DataSourcePojo mapIngestionModel(final DataSource ds, final Long namespaceId, final Long collectorId);

    DataSource mapPojoToIngestionModel(final DataSourcePojo pojo);
}
