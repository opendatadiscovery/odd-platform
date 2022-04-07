package org.opendatadiscovery.oddplatform.service;

import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.Namespace;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceList;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceUpdateFormData;
import org.opendatadiscovery.oddplatform.exception.NotFoundException;
import org.opendatadiscovery.oddplatform.mapper.NamespaceMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveDataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveNamespaceRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class NamespaceServiceImpl implements NamespaceService {
    private final ReactiveNamespaceRepository namespaceRepository;
    private final ReactiveDataSourceRepository dataSourceRepository;
    private final NamespaceMapper namespaceMapper;

    @Override
    public Mono<Namespace> get(final long id) {
        return namespaceRepository.get(id).map(namespaceMapper::mapPojo);
    }

    @Override
    public Mono<NamespaceList> list(final int page, final int size, final String query) {
        return namespaceRepository.list(page, size, query).map(namespaceMapper::mapPojos);
    }

    @Override
    public Mono<Namespace> create(final NamespaceFormData createEntityForm) {
        return Mono.defer(() -> Mono.just(namespaceMapper.mapForm(createEntityForm)))
            .flatMap(namespaceRepository::create)
            .map(namespaceMapper::mapPojo);
    }

    @Override
    public Mono<Namespace> update(final long id, final NamespaceUpdateFormData updateEntityForm) {
        // TODO: search entrypoints
        return namespaceRepository.get(id)
            .map(pojo -> namespaceMapper.applyForm(pojo, updateEntityForm))
            .flatMap(namespaceRepository::update)
            .map(namespaceMapper::mapPojo)
            .switchIfEmpty(Mono.error(new NotFoundException("Namespace with id %d hasn't been found".formatted(id))));
    }

    @Override
    public Mono<Long> delete(final long id) {
        return dataSourceRepository.existsByNamespace(id).flatMap(exists -> {
            if (exists) {
                return Mono.error(new IllegalStateException(
                    "Namespace with ID %d cannot be deleted: there are still data sources attached".formatted(id)));
            }

            return namespaceRepository.delete(id).map(NamespacePojo::getId);
        });
    }
}
