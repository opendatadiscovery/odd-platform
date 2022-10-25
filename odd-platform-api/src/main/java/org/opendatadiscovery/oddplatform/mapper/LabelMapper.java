package org.opendatadiscovery.oddplatform.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelsResponse;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.dto.LabelDto;
import org.opendatadiscovery.oddplatform.dto.LabelOrigin;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(config = MapperConfig.class)
public interface LabelMapper {
    @Mapping(source = "dto.pojo", target = ".")
    @Mapping(source = "dto.origin", target = "external")
    Label mapToLabel(final LabelDto dto);

    Label mapToLabel(final LabelPojo pojo);

    LabelPojo mapToPojo(final String name);

    LabelPojo applyToPojo(@MappingTarget final LabelPojo pojo, final LabelFormData form);

    default Boolean isExternal(final LabelOrigin origin) {
        return !LabelOrigin.INTERNAL.equals(origin);
    }

    default LabelsResponse mapToLabelResponse(final Page<LabelDto> page) {
        return new LabelsResponse()
            .items(page.getData().stream().map(this::mapToLabel).toList())
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()));
    }
}
