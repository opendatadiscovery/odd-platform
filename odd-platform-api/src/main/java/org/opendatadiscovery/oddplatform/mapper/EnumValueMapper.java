package org.opendatadiscovery.oddplatform.mapper;

import java.util.ArrayList;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValue;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueList;
import org.opendatadiscovery.oddplatform.dto.EnumValueOrigin;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;

import static org.mapstruct.NullValueCheckStrategy.ALWAYS;

@Mapper(config = MapperConfig.class)
public interface EnumValueMapper {
    @Mapping(target = "name", source = "form.name")
    @Mapping(target = "internalDescription", source = "form.description", nullValueCheckStrategy = ALWAYS)
    @Mapping(
        target = "origin",
        expression = "java( org.opendatadiscovery.oddplatform.dto.EnumValueOrigin.INTERNAL.getCode() )"
    )
    EnumValuePojo mapInternalToPojo(final EnumValueFormData form, final long datasetFieldId);

    EnumValue mapToEnum(final EnumValuePojo pojo);

    default EnumValueList mapToEnum(final List<EnumValuePojo> pojos) {
        final List<EnumValue> items = new ArrayList<>();
        boolean external = false;

        for (final EnumValuePojo pojo : pojos) {
            if (!external && EnumValueOrigin.EXTERNAL.getCode() == pojo.getOrigin()) {
                external = true;
            }

            items.add(mapToEnum(pojo));
        }

        return new EnumValueList()
            .items(items)
            .external(external);
    }
}
