package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.Namespace;
import com.provectus.oddplatform.api.contract.model.NamespaceFormData;
import com.provectus.oddplatform.api.contract.model.NamespaceList;
import com.provectus.oddplatform.api.contract.model.NamespaceUpdateFormData;
import com.provectus.oddplatform.mapper.NamespaceMapper;
import com.provectus.oddplatform.model.tables.pojos.NamespacePojo;
import com.provectus.oddplatform.repository.NamespaceRepository;
import org.springframework.stereotype.Service;

@Service
public class NamespaceServiceImpl
        extends
        AbstractCRUDService<Namespace, NamespaceList, NamespaceFormData, NamespaceUpdateFormData,
                NamespacePojo, NamespaceMapper, NamespaceRepository>
        implements NamespaceService {

    public NamespaceServiceImpl(final NamespaceMapper entityMapper,
                                final NamespaceRepository entityRepository) {
        super(entityMapper, entityRepository);
    }
}
