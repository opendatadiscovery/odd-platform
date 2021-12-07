package org.opendatadiscovery.oddplatform.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.mapper.DataSourceMapper;
import org.opendatadiscovery.oddplatform.repository.DataSourceRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

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
    public Mono<DataSource> create(final DataSourceFormData createEntityForm) {
        if (StringUtils.isNotEmpty(createEntityForm.getConnectionUrl())
            && StringUtils.isNotEmpty(createEntityForm.getOddrn())) {
            throw new IllegalArgumentException("Can't create data source with both URL and ODDRN defined");
        }

        return super.create(createEntityForm);
    }

    @Override
    public Flux<DataSource> listActive() {
        return Flux.fromIterable(entityRepository.listActive()).map(entityMapper::mapPojo);
    }
}
