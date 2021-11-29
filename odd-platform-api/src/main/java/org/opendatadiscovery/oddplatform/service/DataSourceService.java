package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceUpdateFormData;
import reactor.core.publisher.Flux;

public interface DataSourceService
    extends CRUDService<DataSource, DataSourceList, DataSourceFormData, DataSourceUpdateFormData> {

    Flux<DataSource> listActive();
}
