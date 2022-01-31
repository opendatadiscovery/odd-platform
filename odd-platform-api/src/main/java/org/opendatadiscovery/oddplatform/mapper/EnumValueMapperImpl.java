package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.EnumValue;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueFormData;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;
import org.springframework.stereotype.Component;

@Component
public class EnumValueMapperImpl implements EnumValueMapper {

    @Override
    public EnumValuePojo mapForm(final EnumValueFormData form, final Long datasetFieldId) {
        final EnumValuePojo pojo = new EnumValuePojo();
        pojo.setId(form.getId());
        pojo.setName(form.getName());
        pojo.setDescription(form.getDescription());
        pojo.setDatasetFieldId(datasetFieldId);
        return pojo;
    }

    @Override
    public EnumValue mapPojo(final EnumValuePojo pojo) {
        final EnumValue enumValue = new EnumValue();
        enumValue.setId(pojo.getId());
        enumValue.setName(pojo.getName());
        enumValue.setDescription(pojo.getDescription());
        return enumValue;
    }
}
