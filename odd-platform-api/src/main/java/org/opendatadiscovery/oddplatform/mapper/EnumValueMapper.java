package org.opendatadiscovery.oddplatform.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValueCheckStrategy;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValue;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueFormData;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;

@Mapper(config = MapperConfig.class)
public interface EnumValueMapper {

    @Mapping(target = "name", source = "form.name", qualifiedByName = "mapToTrimmedStringNamed")
    @Mapping(target = "description", source = "form.description", qualifiedByName = "mapToTrimmedStringNamed",
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
    EnumValuePojo mapToPojo(final EnumValueFormData form, final long datasetFieldId);

    EnumValue mapToEnum(final EnumValuePojo pojo);

    @Named("mapToTrimmedStringNamed")
    default String mapToTrimmedString(final String name) {
        return name.trim();
    }
}
