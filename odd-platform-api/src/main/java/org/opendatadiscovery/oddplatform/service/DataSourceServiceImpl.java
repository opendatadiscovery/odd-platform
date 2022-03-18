package org.opendatadiscovery.oddplatform.service;

import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataSourceMapper;
import org.opendatadiscovery.oddplatform.repository.DataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.TokenRepository;
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

    private final TokenService tokenService;
    private final TokenRepository tokenRepository;

    public DataSourceServiceImpl(final DataSourceMapper entityMapper,
                                 final DataSourceRepository entityRepository,
                                 final TokenService tokenService,
                                 final TokenRepository tokenRepository) {
        super(entityMapper, entityRepository);
        this.tokenService = tokenService;
        this.tokenRepository = tokenRepository;
    }

    @Override
    public Mono<DataSource> create(final DataSourceFormData createEntityForm) {
        if (StringUtils.isNotEmpty(createEntityForm.getConnectionUrl())
            && StringUtils.isNotEmpty(createEntityForm.getOddrn())) {
            throw new IllegalArgumentException("Can't create data source with both URL and ODDRN defined");
        }

        return tokenService.generateToken().map(tokenPojo -> {
            final DataSourceDto dataSourceDto = entityMapper.mapForm(createEntityForm, new TokenDto(tokenPojo));
            final DataSourceDto createdDto = entityRepository.create(dataSourceDto);
            return entityMapper.mapPojo(createdDto);
        });
    }

    @Override
    public Flux<DataSource> listActive() {
        return Flux.fromIterable(entityRepository.listActive()).map(entityMapper::mapPojo);
    }

    @Override
    public Mono<DataSource> regenerateDataSourceToken(final Long dataSourceId) {
        return Mono.fromCallable(() -> entityRepository.get(dataSourceId))
            .filter(Optional::isPresent)
            .switchIfEmpty(Mono.error(new NotFoundException()))
            .map(Optional::get)
            .flatMap(dto -> tokenService.regenerateToken(dto.token().tokenPojo()).map(tokenPojo -> {
                final TokenDto updatedTokenDto = tokenRepository.updateToken(tokenPojo);
                return entityMapper.mapPojo(new DataSourceDto(dto.dataSource(), dto.namespace(), updatedTokenDto));
            }));
    }
}
