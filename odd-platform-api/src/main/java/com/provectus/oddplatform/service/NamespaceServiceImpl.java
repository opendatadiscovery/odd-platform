package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.Namespace;
import com.provectus.oddplatform.api.contract.model.NamespaceFormData;
import com.provectus.oddplatform.api.contract.model.NamespaceList;
import com.provectus.oddplatform.api.contract.model.NamespaceUpdateFormData;
import com.provectus.oddplatform.mapper.NamespaceMapper;
import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import com.provectus.oddplatform.repository.DataSourceRepository;
import com.provectus.oddplatform.repository.NamespaceRepository;
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
