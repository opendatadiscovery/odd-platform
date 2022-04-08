package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
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
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class DataSourceServiceImpl implements DataSourceService {
    private final DataSourceMapper dataSourceMapper;

    private final TokenGenerator tokenGenerator;

    private final ReactiveDataSourceRepository dataSourceRepository;
    private final ReactiveDataEntityRepository dataEntityRepository;
    private final TokenRepository tokenRepository;
    private final ReactiveNamespaceRepository namespaceRepository;

    @Override
    public Mono<DataSourceList> list(final Integer page, final Integer size, final String nameQuery) {
        return dataSourceRepository
            .list(page, size, nameQuery)
            .map(dataSourceMapper::mapDtoPage);
    }

    @Override
    public Flux<DataSource> listActive() {
        return dataSourceRepository.listActive().map(dataSourceMapper::mapDto);
    }

    @Override
    @ReactiveTransactional
    public Mono<DataSource> create(final DataSourceFormData form) {
        if (StringUtils.isAllEmpty(form.getConnectionUrl(), form.getOddrn())) {
            return Mono.error(
                new IllegalArgumentException("Can't create data source with both URL and ODDRN defined"));
        }

        final Mono<TokenDto> token = tokenGenerator.generateToken().flatMap(tokenRepository::create);

        if (StringUtils.isNotEmpty(form.getNamespaceName())) {
            return namespaceRepository.getByName(form.getNamespaceName())
                .switchIfEmpty(namespaceRepository.createByName(form.getNamespaceName()))
                .zipWith(token)
                .flatMap(t -> create(form, t.getT2(), t.getT1()));
        }

        return token.flatMap(t -> create(form, t, null));
    }

    @Override
    @ReactiveTransactional
    public Mono<DataSource> update(final long id, final DataSourceUpdateFormData form) {
        return dataSourceRepository.get(id)
            .flatMap(dataSource -> {
                if (StringUtils.isNotEmpty(form.getNamespaceName())) {
                    return namespaceRepository.getByName(form.getNamespaceName())
                        .switchIfEmpty(namespaceRepository.createByName(form.getNamespaceName()))
                        .flatMap(namespace -> update(dataSource.dataSource(), form, namespace));
                }

                return update(dataSource.dataSource(), form, null);
            });
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
        return dataSourceRepository.get(id)
            .switchIfEmpty(Mono.error(new NotFoundException("Data source with id % doesn't exist", id)))
            .flatMap(dto -> tokenGenerator.regenerateToken(dto.token().tokenPojo())
                .flatMap(tokenRepository::updateToken)
                .map(t -> new DataSourceDto(dto.dataSource(), dto.namespace(), t)))
            .map(dataSourceMapper::mapDto);
    }

    private Mono<DataSource> update(final DataSourcePojo dataSource,
                                    final DataSourceUpdateFormData form,
                                    final NamespacePojo namespace) {
        return dataSourceRepository.update(dataSourceMapper.applyForm(dataSource, form, namespace))
            .switchIfEmpty(Mono.error(new NotFoundException("Data source with id % doesn't exist", dataSource.getId())))
            .zipWith(tokenRepository.getByDataSourceId(dataSource.getId()))
            .map(t -> new DataSourceDto(t.getT1(), t.getT2()))
            .map(dataSourceMapper::mapDto);
    }

    private Mono<DataSource> create(final DataSourceFormData form,
                                    final TokenDto token,
                                    final NamespacePojo namespace) {
        return Mono.just(dataSourceMapper.mapForm(form, namespace, token.tokenPojo()))
            .flatMap(dataSourceRepository::create)
            .map(ds -> new DataSourceDto(ds, namespace, token))
            .map(dataSourceMapper::mapDto);
    }
}