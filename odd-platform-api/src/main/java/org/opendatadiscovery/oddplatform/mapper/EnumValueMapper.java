package org.opendatadiscovery.oddplatform.mapper;

import org.opendatadiscovery.oddplatform.api.contract.model.EnumValue;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueFormData;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;

public interface EnumValueMapper {

    EnumValuePojo mapForm(final EnumValueFormData form, final Long datasetFieldId);

    EnumValue mapPojo(final EnumValuePojo pojo);
}
