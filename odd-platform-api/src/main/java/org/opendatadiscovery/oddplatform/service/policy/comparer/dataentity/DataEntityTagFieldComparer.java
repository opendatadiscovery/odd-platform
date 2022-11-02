package org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.policy.DataEntityPolicyResolverContext;
import org.opendatadiscovery.oddplatform.service.policy.comparer.ArrayFieldComparer;

public class DataEntityTagFieldComparer extends ArrayFieldComparer<DataEntityPolicyResolverContext> {
    public DataEntityTagFieldComparer() {
        super(DataEntityTagFieldComparer::extract);
    }

    private static List<String> extract(final DataEntityPolicyResolverContext context) {
        return context.dataEntity().getTags().stream()
            .map(tag -> tag.tagPojo().getName())
            .toList();
    }
}
