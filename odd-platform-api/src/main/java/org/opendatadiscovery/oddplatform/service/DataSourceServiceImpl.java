package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSource;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceList;
import org.opendatadiscovery.oddplatform.api.contract.model.DataSourceUpdateFormData;
import org.opendatadiscovery.oddplatform.dto.DataSourceDto;
import org.opendatadiscovery.oddplatform.dto.TokenDto;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.DataSourceMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTokenRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataSourceServiceImpl implements DataSourceService {
    private final DataSourceMapper dataSourceMapper;
    private final TokenGenerator tokenGenerator;
    private final ReactiveDataSourceRepository dataSourceRepository;
    private final ReactiveDataEntityRepository dataEntityRepository;
    private final ReactiveTokenRepository tokenRepository;
    private final NamespaceService namespaceService;
    private final ReactiveSearchEntrypointRepository searchEntrypointRepository;

    @Override
    public Mono<DataSourceList> list(final Integer page, final Integer size, final String nameQuery) {
        return dataSourceRepository
            .listDto(page, size, nameQuery)
            .map(dataSourceMapper::mapDtoPage);
    }

    @Override
    @ReactiveTransactional
    public Mono<DataSource> create(final DataSourceFormData form) {
        if (StringUtils.isNotEmpty(form.getConnectionUrl()) && StringUtils.isNotEmpty(form.getOddrn())) {
            return Mono.error(
                new IllegalArgumentException("Can't create data source with both URL and ODDRN defined"));
        }

        final Mono<TokenDto> token = tokenGenerator.generateToken().flatMap(tokenRepository::create);

        if (StringUtils.isNotEmpty(form.getNamespaceName())) {
            return namespaceService.getOrCreate(form.getNamespaceName())
                .zipWith(token)
                .flatMap(t -> createDataSource(form, t.getT2(), t.getT1()))
                .map(dataSourceMapper::mapDto);
        }

        return token
            .flatMap(t -> createDataSource(form, t, null))
            .map(dataSourceMapper::mapDto);
    }

    @Override
    @ReactiveTransactional
    public Mono<DataSource> update(final long id, final DataSourceUpdateFormData form) {
        return dataSourceRepository.getDto(id)
            .switchIfEmpty(Mono.error(new NotFoundException("Data source with id % doesn't exist", id)))
            .flatMap(dataSource -> {
                if (StringUtils.isNotEmpty(form.getNamespaceName())) {
                    return namespaceService.getOrCreate(form.getNamespaceName())
                        .flatMap(namespace -> updateDataSource(dataSource, form, namespace))
                        .flatMap(dto -> updateSearchVectors(dto));
                }
                return updateDataSource(dataSource, form, null)
                    .flatMap(dto -> updateSearchVectors(dto));
            })
            .map(dataSourceMapper::mapDto);
    }

    @Override
    @ReactiveTransactional
    public Mono<Long> delete(final long id) {
        return dataEntityRepository.existsByDataSourceId(id)
            .flatMap(exists -> {
                if (!exists) {
                    return dataSourceRepository.delete(id).map(DataSourcePojo::getId);
                }
                return Mono.error(new IllegalStateException(
                    "Data source with ID %d cannot be deleted: there are still data sources attached".formatted(id)));
            });
    }

    @Override
    public Mono<DataSource> regenerateDataSourceToken(final long id) {
        return dataSourceRepository.getDto(id)
            .switchIfEmpty(Mono.error(new NotFoundException("Data source with id % doesn't exist", id)))
            .flatMap(dto -> tokenGenerator.regenerateToken(dto.token().tokenPojo())
                .flatMap(tokenRepository::updateToken)
                .map(t -> new DataSourceDto(dto.dataSource(), dto.namespace(), t)))
            .map(dataSourceMapper::mapDto);
    }

    private Mono<DataSourceDto> updateDataSource(final DataSourceDto dataSourceDto,
                                                 final DataSourceUpdateFormData form,
                                                 final NamespacePojo namespace) {
        return Mono.just(dataSourceMapper.applyToPojo(dataSourceDto.dataSource(), form, namespace))
            .flatMap(dataSourceRepository::update)
            .map(pojo -> new DataSourceDto(pojo, namespace, dataSourceDto.token()));
    }

    private Mono<DataSourceDto> createDataSource(final DataSourceFormData form,
                                                 final TokenDto token,
                                                 final NamespacePojo namespace) {
        return Mono.just(dataSourceMapper.mapForm(form, namespace, token))
            .flatMap(dataSourceRepository::create)
            .map(ds -> new DataSourceDto(ds, namespace, token));
    }

    private Mono<DataSourceDto> updateSearchVectors(final DataSourceDto dto) {
        final Mono<Integer> namespaceVector = Mono.just(dto)
            .filter(d -> d.namespace() != null)
            .flatMap(d -> searchEntrypointRepository.updateChangedNamespaceVector(d.namespace().getId()))
            .switchIfEmpty(searchEntrypointRepository.clearNamespaceVector(dto.dataSource().getId()));
        return Mono.zip(
            searchEntrypointRepository.updateChangedDataSourceVector(dto.dataSource().getId()),
            namespaceVector
        ).thenReturn(dto);
    }
}