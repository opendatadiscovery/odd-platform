package org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity;

import java.util.function.Function;
import org.opendatadiscovery.oddplatform.dto.policy.DataEntityPolicyResolverContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.DataSourcePojo;
import org.opendatadiscovery.oddplatform.service.policy.comparer.SimpleFieldComparer;

public class DataEntityDataSourceFieldComparer extends SimpleFieldComparer<DataEntityPolicyResolverContext> {
    public DataEntityDataSourceFieldComparer(final Function<DataSourcePojo, String> fieldExtractor) {
        super(context -> fieldExtractor.apply(getDataEntityDataSource(context)));
    }

    private static DataSourcePojo getDataEntityDataSource(final DataEntityPolicyResolverContext context) {
        return context.dataEntity().getDataSource();
    }
}
