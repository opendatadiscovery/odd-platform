package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.DataSource;
import com.provectus.oddplatform.api.contract.model.DataSourceFormData;
import com.provectus.oddplatform.api.contract.model.DataSourceList;
import com.provectus.oddplatform.api.contract.model.DataSourceUpdateFormData;
import com.provectus.oddplatform.mapper.DataSourceMapper;
import com.provectus.oddplatform.model.tables.pojos.DataSourcePojo;
import com.provectus.oddplatform.repository.DataSourceRepository;
import org.springframework.stereotype.Service;

@Service
public class DataSourceServiceImpl
    extends AbstractCRUDService<DataSource, DataSourceList, DataSourceFormData, DataSourceUpdateFormData, DataSourcePojo, DataSourceMapper, DataSourceRepository>
    implements DataSourceService {

    public DataSourceServiceImpl(final DataSourceMapper entityMapper,
                                 final DataSourceRepository entityRepository) {
        super(entityMapper, entityRepository);
    }
}
