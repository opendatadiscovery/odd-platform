package org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity;

import java.util.function.Function;
import org.opendatadiscovery.oddplatform.dto.policy.DataEntityPolicyResolverContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataEntityPojo;
import org.opendatadiscovery.oddplatform.service.policy.comparer.SimpleFieldComparer;

public class DataEntityFieldComparer extends SimpleFieldComparer<DataEntityPolicyResolverContext> {
    public DataEntityFieldComparer(final Function<DataEntityPojo, String> fieldExtractor) {
        super(context -> fieldExtractor.apply(getDataEntity(context)));
    }

    private static DataEntityPojo getDataEntity(final DataEntityPolicyResolverContext context) {
        return context.dataEntity().getDataEntity();
    }
}
