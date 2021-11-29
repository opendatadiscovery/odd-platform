package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsResponse;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

public interface TagMapper extends CRUDMapper<Tag, TagsResponse, TagFormData, TagFormData, TagPojo> {
    TagsResponse mapTags(final List<Tag> tags);

    TagsResponse mapTagDtos(final Page<TagDto> tags);

    Tag mapTag(final TagDto dto);
}
