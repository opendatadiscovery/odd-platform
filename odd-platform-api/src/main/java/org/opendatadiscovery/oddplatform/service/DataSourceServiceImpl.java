package org.opendatadiscovery.oddplatform.service;

import lombok.extern.slf4j.Slf4j;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.mapper.DataSourceMapper;
import org.opendatadiscovery.oddplatform.repository.DataSourceRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@Slf4j
public class DataSourceServiceImpl
    extends
    AbstractCRUDService<DataSource, DataSourceList, DataSourceFormData, DataSourceUpdateFormData,
        DataSourceDto, DataSourceMapper, DataSourceRepository>
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
