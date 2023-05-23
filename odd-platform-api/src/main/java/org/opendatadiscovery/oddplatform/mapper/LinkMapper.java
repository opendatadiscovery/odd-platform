package org.opendatadiscovery.oddplatform.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLink;
import org.opendatadiscovery.oddplatform.api.contract.model.DataEntityLinkFormData;
import org.opendatadiscovery.oddplatform.model.tables.pojos.LinkPojo;

@Mapper(config = MapperConfig.class)
public interface LinkMapper {
    DataEntityLink mapToDto(final LinkPojo pojo);

    LinkPojo mapToPojo(final DataEntityLinkFormData formData, final long dataEntityId);

    LinkPojo applyToPojo(final DataEntityLinkFormData formData,
                       @MappingTarget final LinkPojo pojo);
}
