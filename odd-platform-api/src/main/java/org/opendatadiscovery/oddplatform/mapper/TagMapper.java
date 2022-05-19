package org.opendatadiscovery.oddplatform.mapper;

import java.util.Collection;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsResponse;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(config = MapperConfig.class)
public interface TagMapper {

    TagPojo mapToPojo(final TagFormData formData);

    TagPojo applyToPojo(final TagFormData formData, @MappingTarget final TagPojo pojo);

    @Mapping(source = "dto.tagPojo", target = ".")
    Tag mapToTag(final TagDto dto);

    Tag mapToTag(final TagPojo pojo);

    List<Tag> mapToTagList(final Collection<TagPojo> pojos);

    default TagsResponse mapToTagsResponse(final Page<TagDto> page) {
        return new TagsResponse()
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()))
            .items(page.getData().stream().map(this::mapToTag).toList());
    }
}
