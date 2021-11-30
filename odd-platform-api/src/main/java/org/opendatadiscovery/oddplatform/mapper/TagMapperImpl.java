package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import java.util.stream.Collectors;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsResponse;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.utils.Page;
import org.springframework.stereotype.Component;

@Component
public class TagMapperImpl implements TagMapper {
    @Override
    public TagPojo mapForm(final TagFormData form) {
        return new TagPojo()
            .setName(form.getName())
            .setImportant(form.getImportant());
    }

    @Override
    public TagPojo applyForm(final TagPojo pojo, final TagFormData form) {
        pojo.setName(form.getName());
        pojo.setImportant(form.getImportant());
        return pojo;
    }

    @Override
    public Tag mapPojo(final TagPojo pojo) {
        return new Tag()
            .id(pojo.getId())
            .name(pojo.getName())
            .important(pojo.getImportant());
    }

    @Override
    public TagsResponse mapPojos(final List<TagPojo> pojos) {
        return new TagsResponse()
            .items(mapPojoList(pojos))
            .pageInfo(pageInfo(pojos.size()));
    }

    @Override
    public TagsResponse mapPojos(final Page<TagPojo> pojos) {
        return new TagsResponse()
            .items(mapPojoList(pojos.getData()))
            .pageInfo(pageInfo(pojos));
    }

    @Override
    public TagsResponse mapTags(final List<Tag> tags) {
        return new TagsResponse()
            .items(tags)
            .pageInfo(pageInfo(tags.size()));
    }

    public TagsResponse mapTagDtos(final Page<TagDto> tags) {
        final List<Tag> items = tags.getData().stream()
            .map(this::mapTag)
            .collect(Collectors.toList());
        return new TagsResponse()
            .items(items)
            .pageInfo(this.pageInfo(tags));
    }

    public Tag mapTag(final TagDto dto) {
        return new Tag()
            .id(dto.getTagPojo().getId())
            .name(dto.getTagPojo().getName())
            .important(dto.getTagPojo().getImportant())
            .usedCount(dto.getUsedCount());
    }
}
