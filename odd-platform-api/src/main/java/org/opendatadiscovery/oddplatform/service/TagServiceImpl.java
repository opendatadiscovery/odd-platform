package org.opendatadiscovery.oddplatform.service;

import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsResponse;
import org.opendatadiscovery.oddplatform.mapper.TagMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.repository.TagRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class TagServiceImpl
    extends AbstractCRUDService<Tag, TagsResponse, TagFormData, TagFormData, TagPojo, TagMapper, TagRepository>
    implements TagService {

    public TagServiceImpl(final TagMapper entityMapper, final TagRepository entityRepository) {
        super(entityMapper, entityRepository);
    }

    public Mono<TagsResponse> listMostPopular(final String query, final int page, final int size) {
        return Mono
            .fromCallable(() -> entityRepository.listMostPopular(query, page, size))
            .map(entityMapper::mapTagDtos);
    }
}
