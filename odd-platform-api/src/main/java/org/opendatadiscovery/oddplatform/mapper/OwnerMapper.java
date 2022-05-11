package org.opendatadiscovery.oddplatform.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.Owner;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.OwnerList;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.Tag;
import org.opendatadiscovery.oddplatform.api.contract.model.TagFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.TagsResponse;
import org.opendatadiscovery.oddplatform.dto.TagDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(config = MapperConfig.class)
public interface OwnerMapper {

    OwnerPojo mapToPojo(final OwnerFormData formData);

    OwnerPojo applyToPojo(final OwnerFormData formData, @MappingTarget final OwnerPojo pojo);

    Owner mapToOwner(final OwnerPojo pojo);

    default OwnerList mapToOwnerList(final Page<OwnerPojo> page) {
        return new OwnerList()
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()))
            .items(page.getData().stream().map(this::mapToOwner).toList());
    }
}
