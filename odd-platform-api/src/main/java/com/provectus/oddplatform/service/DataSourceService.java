package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.DataSource;
import com.provectus.oddplatform.api.contract.model.DataSourceFormData;
import com.provectus.oddplatform.api.contract.model.DataSourceList;
import com.provectus.oddplatform.api.contract.model.DataSourceUpdateFormData;
import reactor.core.publisher.Mono;

public interface DataSourceService
    extends CRUDService<DataSource, DataSourceList, DataSourceFormData, DataSourceUpdateFormData> {

    Mono<DataSourceList> listAll();
}
