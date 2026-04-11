package org.opendatadiscovery.oddplatform.mapper;

import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.PageInfo;
import org.opendatadiscovery.oddplatform.api.contract.model.Policy;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.PolicyList;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.PolicyPojo;
import org.opendatadiscovery.oddplatform.utils.JSONSerDeUtils;
import org.opendatadiscovery.oddplatform.utils.Page;

@Mapper(config = MapperConfig.class)
public interface PolicyMapper {
    PolicyPojo mapToPojo(final PolicyFormData formData);

    PolicyPojo applyToPojo(final PolicyFormData formData, @MappingTarget final PolicyPojo pojo);

    Policy mapToPolicy(final PolicyPojo pojo);

    PolicyDetails mapToDetails(final PolicyPojo pojo);

    default PolicyList mapToPolicyList(final Page<PolicyPojo> page) {
        return new PolicyList()
            .pageInfo(new PageInfo().total(page.getTotal()).hasNext(page.isHasNext()))
            .items(page.getData().stream().map(this::mapToPolicy).toList());
    }

    List<PolicyDto> mapToPolicyDtos(final List<PolicyPojo> pojos);

    default PolicyDto mapToDto(final PolicyPojo pojo) {
        return JSONSerDeUtils.deserializeJson(pojo.getPolicy(), PolicyDto.class);
    }
}
