package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.MetadataField;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataFieldList;
import org.opendatadiscovery.oddplatform.api.contract.model.MetadataUpdateCustomFieldFormData;
import org.opendatadiscovery.oddplatform.mapper.MetadataFieldMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.MetadataFieldPojo;
import org.opendatadiscovery.oddplatform.repository.MetadataFieldRepository;
import org.springframework.stereotype.Service;

@Service
public class MetadataServiceImpl
    extends AbstractCRUDService<MetadataField, MetadataFieldList, MetadataFieldFormData,
    MetadataUpdateCustomFieldFormData, MetadataFieldPojo, MetadataFieldMapper, MetadataFieldRepository>
    implements MetadataService {

    public MetadataServiceImpl(final MetadataFieldMapper entityMapper,
                               final MetadataFieldRepository entityRepository) {
        super(entityMapper, entityRepository);
    }
}
