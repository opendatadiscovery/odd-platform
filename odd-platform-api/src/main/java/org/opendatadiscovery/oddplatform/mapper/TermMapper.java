package org.opendatadiscovery.oddplatform.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.opendatadiscovery.oddplatform.api.contract.model.TermDetails;
import org.opendatadiscovery.oddplatform.api.contract.model.TermFormData;
import org.opendatadiscovery.oddplatform.dto.term.TermDetailsDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;

@Mapper(config = MapperConfig.class,
    uses = {
        NamespaceMapper.class,
        OffsetDateTimeMapper.class
    })
public interface TermMapper {

    TermPojo mapToPojo(final TermFormData formData);

    default TermPojo mapToPojo(final TermFormData formData, final NamespacePojo namespacePojo) {
        return mapToPojo(formData)
            .setNamespaceId(namespacePojo.getId());
    }

    TermPojo applyToPojo(final TermFormData formData, @MappingTarget final TermPojo pojo);

    default TermPojo applyToPojo(final TermFormData formData,
                                 final NamespacePojo namespacePojo,
                                 final TermPojo pojo) {
        return applyToPojo(formData, pojo)
            .setNamespaceId(namespacePojo.getId());
    }

    @Mapping(source = "dto.termDto.termRefDto", target = ".")
    @Mapping(source = "dto.termDto.ownerships", target = "ownership")
    @Mapping(source = "dto.termDto.entitiesUsingCount", target = "entitiesUsingCount")
    TermDetails mapToDetails(final TermDetailsDto dto);
}
