package org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import org.opendatadiscovery.oddplatform.dto.DataEntityClassDto;
import org.opendatadiscovery.oddplatform.dto.policy.DataEntityPolicyResolverContext;
import org.opendatadiscovery.oddplatform.service.policy.comparer.ArrayFieldComparer;

public class DataEntityClassFieldComparer extends ArrayFieldComparer<DataEntityPolicyResolverContext> {
    public DataEntityClassFieldComparer() {
        super(DataEntityClassFieldComparer::extract);
    }

    private static List<String> extract(final DataEntityPolicyResolverContext context) {
        return Stream.of(context.dataEntity().getDataEntity().getEntityClassIds())
            .map(DataEntityClassDto::findById)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .map(DataEntityClassDto::resolveName)
            .toList();
    }
}
