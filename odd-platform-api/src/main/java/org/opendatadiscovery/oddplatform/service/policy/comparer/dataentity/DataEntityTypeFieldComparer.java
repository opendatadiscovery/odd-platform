package org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity;

import org.opendatadiscovery.oddplatform.dto.DataEntityTypeDto;
import org.opendatadiscovery.oddplatform.dto.policy.DataEntityPolicyResolverContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.service.policy.comparer.SimpleFieldComparer;

public class DataEntityTypeFieldComparer extends SimpleFieldComparer<DataEntityPolicyResolverContext> {
    public DataEntityTypeFieldComparer() {
        super(DataEntityTypeFieldComparer::extractType);
    }

    private static String extractType(final DataEntityPolicyResolverContext context) {
        final DataEntityPojo pojo = context.dataEntity().getDataEntity();
        return DataEntityTypeDto
            .findById(pojo.getTypeId())
            .map(DataEntityTypeDto::name)
            .orElseThrow(() -> new IllegalArgumentException("Unknown data entity type: " + pojo.getTypeId()));
    }
}
