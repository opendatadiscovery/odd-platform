package org.opendatadiscovery.oddplatform.service;

import java.util.List;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueFormData;
import org.opendatadiscovery.oddplatform.api.contract.model.EnumValueList;
import reactor.core.publisher.Mono;

public interface EnumValueService {
    Mono<EnumValueList> createEnumValues(final Long datasetFieldId, final List<EnumValueFormData> formData);

    Mono<EnumValueList> getEnumValues(final Long datasetFieldId);
}
