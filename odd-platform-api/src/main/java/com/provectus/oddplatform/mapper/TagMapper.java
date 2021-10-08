package com.provectus.oddplatform.mapper;

import com.provectus.oddplatform.api.contract.model.Tag;
import com.provectus.oddplatform.api.contract.model.TagFormData;
import com.provectus.oddplatform.api.contract.model.TagsResponse;
import com.provectus.oddplatform.dto.TagDto;
import com.provectus.oddplatform.model.tables.pojos.TagPojo;
import com.provectus.oddplatform.utils.Page;
import java.util.List;

public interface TagMapper extends CRUDMapper<Tag, TagsResponse, TagFormData, TagFormData, TagPojo> {
    TagsResponse mapTags(final List<Tag> tags);

    TagsResponse mapTagDtos(final Page<TagDto> tags);

    Tag mapTag(final TagDto dto);
}
