package com.provectus.oddplatform.service;

import com.provectus.oddplatform.api.contract.model.Tag;
import com.provectus.oddplatform.api.contract.model.TagFormData;
import com.provectus.oddplatform.api.contract.model.TagsResponse;
import com.provectus.oddplatform.mapper.TagMapper;
import com.provectus.oddplatform.model.tables.pojos.TagPojo;
import com.provectus.oddplatform.repository.TagRepository;
import java.util.List;
import java.util.stream.Collectors;
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
            .map(tags -> {
                final List<Tag> items = tags.stream()
                    .map(entityMapper::mapTag)
                    .collect(Collectors.toList());
                return new TagsResponse()
                    .items(items)
                    .pageInfo(entityMapper.pageInfo(tags.size()));
            });
    }
}
