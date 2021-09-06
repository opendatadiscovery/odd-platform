package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.MetadataField;
import com.provectus.oddplatform.api.contract.model.MetadataFieldFormData;
import com.provectus.oddplatform.api.contract.model.MetadataFieldList;
import com.provectus.oddplatform.api.contract.model.MetadataUpdateCustomFieldFormData;
import com.provectus.oddplatform.mapper.MetadataFieldMapper;
import com.provectus.oddplatform.model.tables.pojos.MetadataFieldPojo;
import com.provectus.oddplatform.repository.MetadataFieldRepository;
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
