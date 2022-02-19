package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;

public interface DataSourceMapper
    extends CRUDMapper<DataSource, DataSourceList, DataSourceFormData, DataSourceUpdateFormData, DataSourceDto> {
    DataSourceDto mapForm(final DataSourceFormData form, final TokenDto tokenDto);
}
