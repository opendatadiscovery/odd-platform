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
import org.opendatadiscovery.oddplatform.repository.TokenRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataEntityRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
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
    private final TokenRepository tokenRepository;
    private final NamespaceService namespaceService;
    private final ReactiveSearchEntrypointRepository searchEntrypointRepository;

    @Override
    public Mono<DataSourceList> list(final Integer page, final Integer size, final String nameQuery) {
        return dataSourceRepository
            .listDto(page, size, nameQuery)
            .map(dataSourceMapper::mapDtoPage);
    }

    @Override
    public Flux<DataSource> listActive() {
        return dataSourceRepository.listActive().map(dataSourceMapper::mapDto);
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
                .flatMap(t -> create(form, t.getT2(), t.getT1()))
                .flatMap(this::updateSearchVectors)
                .map(dataSourceMapper::mapDto);
        }

        return token
            .flatMap(t -> create(form, t, null))
            .flatMap(dsDto -> searchEntrypointRepository
                .updateDataSourceVector(dsDto.dataSource().getId())
                .thenReturn(dsDto))
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
                        .flatMap(namespace -> update(dataSource, form, namespace))
                        .flatMap(this::updateSearchVectors);
                }
                return update(dataSource, form, null)
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

    private Mono<DataSourceDto> update(final DataSourceDto dataSourceDto,
                                       final DataSourceUpdateFormData form,
                                       final NamespacePojo namespace) {
        return Mono.just(dataSourceMapper.applyToPojo(dataSourceDto.dataSource(), form, namespace))
            .flatMap(dataSourceRepository::update)
            .zipWith(Mono.just(dataSourceDto.token()))
            .map(t -> new DataSourceDto(t.getT1(), namespace, t.getT2()));
    }

    private Mono<DataSourceDto> create(final DataSourceFormData form,
                                       final TokenDto token,
                                       final NamespacePojo namespace) {
        return Mono.just(dataSourceMapper.mapForm(form, namespace, token))
            .flatMap(dataSourceRepository::create)
            .map(ds -> new DataSourceDto(ds, namespace, token));
    }

    private Mono<DataSourceDto> updateSearchVectors(final DataSourceDto dto) {
        return Mono.zip(
                searchEntrypointRepository.updateDataSourceVector(dto.dataSource().getId()),
                searchEntrypointRepository.updateNamespaceVector(dto.namespace().getId()))
            .map(a -> dto);
    }
}