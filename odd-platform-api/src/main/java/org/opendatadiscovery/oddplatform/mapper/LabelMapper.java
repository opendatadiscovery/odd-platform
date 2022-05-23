package org.opendatadiscovery.oddplatform.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.Label;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.LabelsResponse;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LabelPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(config = MapperConfig.class)
public interface LabelMapper {
    Label mapToLabel(final LabelPojo label);

    LabelPojo mapToPojo(final LabelFormData form);

    LabelPojo applyToPojo(@MappingTarget final LabelPojo pojo, final LabelFormData form);

    default LabelsResponse mapToLabelResponse(final Page<LabelPojo> page) {
        return new LabelsResponse()
            .items(page.getData().stream().map(this::mapToLabel).toList())
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()));
    }
}
