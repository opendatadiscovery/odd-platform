package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;

public interface DataSourceMapper
    extends CRUDMapper<DataSource, DataSourceList, DataSourceFormData, DataSourceUpdateFormData, DataSourceDto> {

    DataSourceDto mapIngestionModel(final org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSource ds);

    org.opendatadiscovery.oddplatform.ingestion.contract.model.DataSource mapDtoToIngestionModel(
        final DataSourceDto dto);
}
