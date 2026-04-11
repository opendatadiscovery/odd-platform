package org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity;

import java.util.List;
import java.util.stream.Collectors;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.dto.policy.DataEntityPolicyResolverContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import org.opendatadiscovery.oddplatform.service.policy.comparer.ArrayFieldComparer;

public class DataEntityOwnerTitleFieldComparer extends ArrayFieldComparer<DataEntityPolicyResolverContext> {
    public DataEntityOwnerTitleFieldComparer() {
        super(DataEntityOwnerTitleFieldComparer::extract);
    }

    public static List<String> extract(final DataEntityPolicyResolverContext context) {
        return context
            .dataEntity()
            .getOwnership()
            .stream()
            .map(OwnershipDto::getTitle)
            .map(TitlePojo::getName)
            .collect(Collectors.toList());
    }
}
