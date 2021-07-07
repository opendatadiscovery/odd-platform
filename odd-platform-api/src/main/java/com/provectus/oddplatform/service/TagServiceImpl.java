package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.Tag;
import com.provectus.oddplatform.api.contract.model.TagFormData;
import com.provectus.oddplatform.api.contract.model.TagsResponse;
import com.provectus.oddplatform.mapper.TagMapper;
import com.provectus.oddplatform.model.tables.pojos.TagPojo;
import com.provectus.oddplatform.repository.TagRepository;
import org.springframework.stereotype.Service;

@Service
public class TagServiceImpl
    extends AbstractCRUDService<Tag, TagsResponse, TagFormData, TagFormData, TagPojo, TagMapper, TagRepository>
    implements TagService {

    public TagServiceImpl(final TagMapper entityMapper, final TagRepository entityRepository) {
        super(entityMapper, entityRepository);
    }
}
