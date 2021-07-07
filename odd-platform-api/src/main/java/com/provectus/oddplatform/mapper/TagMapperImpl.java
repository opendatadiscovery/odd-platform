package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.Tag;
import com.provectus.oddplatform.api.contract.model.TagFormData;
import com.provectus.oddplatform.api.contract.model.TagsResponse;
import com.provectus.oddplatform.model.tables.pojos.TagPojo;
import com.provectus.oddplatform.utils.Page;
import org.springframework.stereotype.Component;

import java.util.List;

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
}
