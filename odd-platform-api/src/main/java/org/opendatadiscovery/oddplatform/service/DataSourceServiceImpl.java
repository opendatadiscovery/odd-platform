package org.opendatadiscovery.oddplatform.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceUpdateFormData;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataSourceMapper;
import org.opendatadiscovery.oddplatform.repository.DataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.TokenRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Optional;

@Service
@Slf4j
public class DataSourceServiceImpl
    extends
    AbstractCRUDService<DataSource, DataSourceList, DataSourceFormData, DataSourceUpdateFormData,
        DataSourceDto, DataSourceMapper, DataSourceRepository>
    implements DataSourceService {

    private final TokenService tokenService;
    private final AuthIdentityProvider authIdentityProvider;
    private final TokenRepository tokenRepository;

    public DataSourceServiceImpl(final DataSourceMapper entityMapper,
                                 final DataSourceRepository entityRepository,
                                 final TokenService tokenService,
                                 final AuthIdentityProvider authIdentityProvider,
                                 final TokenRepository tokenRepository) {
        super(entityMapper, entityRepository);
        this.tokenService = tokenService;
        this.authIdentityProvider = authIdentityProvider;
        this.tokenRepository = tokenRepository;
    }

    @Override
    public Mono<DataSource> create(final DataSourceFormData createEntityForm) {
        if (StringUtils.isNotEmpty(createEntityForm.getConnectionUrl())
            && StringUtils.isNotEmpty(createEntityForm.getOddrn())) {
            throw new IllegalArgumentException("Can't create data source with both URL and ODDRN defined");
        }

        return authIdentityProvider.getUsername()
                .map(tokenService::generateToken)
                .switchIfEmpty(Mono.fromCallable(() -> tokenService.generateToken(null)))
                .map(tokenPojo -> {
                    DataSourceDto dataSourceDto = entityMapper.mapForm(createEntityForm, tokenPojo);
                    DataSourceDto dto = entityRepository.create(dataSourceDto);
                    return entityMapper.mapPojo(dto);
                });
    }

    @Override
    public Flux<DataSource> listActive() {
        return Flux.fromIterable(entityRepository.listActive()).map(entityMapper::mapPojo);
    }

    @Override
    public Mono<DataSource> regenerateDataSourceToken(final Long dataSourceId) {
        return Mono.fromCallable(() -> entityRepository.get(dataSourceId))
                .flatMap(optional -> optional.isEmpty()
                        ? Mono.error(new NotFoundException())
                        : Mono.just(optional.get()))
                .flatMap(dto -> authIdentityProvider.getUsername()
                        .map(username -> tokenService.regenerateToken(dto.token(), username))
                        .switchIfEmpty(Mono.fromCallable(() -> tokenService.regenerateToken(dto.token(), null)))
                        .map(tokenPojo -> {
                            tokenRepository.regenerateToken(tokenPojo);
                            return entityMapper.mapPojo(dto);
                        }));
    }
}
