package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.DataSource;
import com.provectus.oddplatform.api.contract.model.DataSourceFormData;
import com.provectus.oddplatform.api.contract.model.DataSourceList;
import com.provectus.oddplatform.api.contract.model.DataSourceUpdateFormData;
import com.provectus.oddplatform.dto.DataSourceDto;
import com.provectus.oddplatform.mapper.DataSourceMapper;
import com.provectus.oddplatform.repository.DataSourceRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
public class DataSourceServiceImpl
    extends AbstractCRUDService<DataSource, DataSourceList, DataSourceFormData, DataSourceUpdateFormData, DataSourceDto, DataSourceMapper, DataSourceRepository>
    implements DataSourceService {

    public DataSourceServiceImpl(final DataSourceMapper entityMapper,
                                 final DataSourceRepository entityRepository) {
        super(entityMapper, entityRepository);
    }

    @Override
    public Flux<DataSource> listActive() {
        return Flux.fromIterable(entityRepository.listActive()).map(entityMapper::mapPojo);
    }
}
