package org.opendatadiscovery.oddplatform.repository;

import java.util.List;
import org.opendatadiscovery.oddplatform.model.tables.pojos.EnumValuePojo;

public interface EnumValueRepository {
    List<EnumValuePojo> getEnumValuesByFieldId(final Long datasetFieldId);

    List<EnumValuePojo> updateFieldEnumValues(final Long datasetFieldId, final List<EnumValuePojo> pojos);
}
