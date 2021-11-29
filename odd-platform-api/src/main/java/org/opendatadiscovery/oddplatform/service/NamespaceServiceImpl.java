package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Namespace;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceList;
import org.opendatadiscovery.oddplatform.api.contract.model.NamespaceUpdateFormData;
import org.opendatadiscovery.oddplatform.mapper.NamespaceMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.repository.DataSourceRepository;
import org.opendatadiscovery.oddplatform.repository.NamespaceRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class NamespaceServiceImpl
    extends
    AbstractCRUDService<Namespace, NamespaceList, NamespaceFormData, NamespaceUpdateFormData,
        NamespacePojo, NamespaceMapper, NamespaceRepository>
    implements NamespaceService {

    private final DataSourceRepository dataSourceRepository;

    public NamespaceServiceImpl(final NamespaceMapper entityMapper,
                                final NamespaceRepository entityRepository,
                                final DataSourceRepository dataSourceRepository) {
        super(entityMapper, entityRepository);

        this.dataSourceRepository = dataSourceRepository;
    }

    @Override
    public Mono<Long> delete(final long id) {
        return Mono
            .fromCallable(() -> dataSourceRepository.existByNamespace(id))
            .flatMap(e -> e
                ? Mono.error(new RuntimeException("Namespace contains dependent data sources"))
                : super.delete(id));
    }
}
