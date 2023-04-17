package org.opendatadiscovery.oddplatform.mapper;

import java.util.ArrayList;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
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

    @Mapping(target = "id", ignore = true)
    EnumValuePojo copyNewWithoutId(final EnumValuePojo old);

    default EnumValue mapToEnum(final EnumValuePojo pojo) {
        if (pojo == null) {
            return null;
        }

        final EnumValueOrigin origin = EnumValueOrigin
            .fromCode(pojo.getOrigin())
            .orElseThrow(() -> new IllegalStateException("Unknown origin code: %d".formatted(pojo.getOrigin())));

        final boolean modifiable = switch (origin) {
            case EXTERNAL -> StringUtils.isEmpty(pojo.getExternalDescription());
            case INTERNAL -> true;
        };

        final String description = modifiable ? pojo.getInternalDescription() : pojo.getExternalDescription();

        return new EnumValue()
            .id(pojo.getId())
            .name(pojo.getName())
            .modifiable(modifiable)
            .description(description);
    }

    default EnumValueList mapToEnum(final List<EnumValuePojo> pojos) {
        final List<EnumValue> items = new ArrayList<>();
        boolean external = false;

        for (final EnumValuePojo pojo : pojos) {
            if (pojo == null) {
                continue;
            }

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
