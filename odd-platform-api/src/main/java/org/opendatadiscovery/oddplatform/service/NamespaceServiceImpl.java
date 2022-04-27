package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.BooleanUtils;
import org.opendatadiscovery.oddplatform.annotation.ReactiveTransactional;
import org.opendatadiscovery.oddplatform.api.contract.model.Namespace;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceList;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceUpdateFormData;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.NamespaceMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveCollectorRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveSearchEntrypointRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class NamespaceServiceImpl implements NamespaceService {
    private final ReactiveNamespaceRepository namespaceRepository;
    private final ReactiveDataSourceRepository dataSourceRepository;
    private final ReactiveCollectorRepository collectorRepository;
    private final ReactiveSearchEntrypointRepository searchEntrypointRepository;
    private final NamespaceMapper namespaceMapper;

    @Override
    public Mono<NamespacePojo> getOrCreate(final String name) {
        return namespaceRepository.getByName(name)
            .switchIfEmpty(namespaceRepository.createByName(name));
    }

    @Override
    public Mono<Namespace> get(final long id) {
        return namespaceRepository.get(id)
            .switchIfEmpty(Mono.error(new NotFoundException("Namespace with id %d hasn't been found".formatted(id))))
            .map(namespaceMapper::mapPojo);
    }

    @Override
    public Mono<NamespaceList> list(final int page, final int size, final String query) {
        return namespaceRepository.list(page, size, query).map(namespaceMapper::mapPojoPage);
    }

    @Override
    public Mono<Namespace> create(final NamespaceFormData createEntityForm) {
        return Mono.just(createEntityForm)
            .map(namespaceMapper::mapForm)
            .flatMap(namespaceRepository::create)
            .map(namespaceMapper::mapPojo);
    }

    @Override
    @ReactiveTransactional
    public Mono<Namespace> update(final long id, final NamespaceUpdateFormData updateEntityForm) {
        return namespaceRepository.get(id)
            .switchIfEmpty(Mono.error(new NotFoundException("Namespace with id %d hasn't been found".formatted(id))))
            .map(pojo -> namespaceMapper.applyToPojo(pojo, updateEntityForm))
            .flatMap(namespaceRepository::update)
            .flatMap(ns -> searchEntrypointRepository.updateNamespaceVector(ns.getId()).thenReturn(ns))
            .map(namespaceMapper::mapPojo);
    }

    @Override
    public Mono<Long> delete(final long id) {
        return Mono.zip(dataSourceRepository.existsByNamespace(id), collectorRepository.existsByNamespace(id))
            .map(t -> BooleanUtils.toBoolean(t.getT1()) || BooleanUtils.toBoolean(t.getT2()))
            .filter(exists -> !exists)
            .switchIfEmpty(Mono.error(new IllegalStateException(
                "Namespace with ID %d cannot be deleted: there are still data sources attached".formatted(id))))
            .flatMap(ign -> namespaceRepository.delete(id).map(NamespacePojo::getId));
    }
}
