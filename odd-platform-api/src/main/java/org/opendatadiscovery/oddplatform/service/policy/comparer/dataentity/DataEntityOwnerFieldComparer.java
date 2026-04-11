package org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity;

import java.util.List;
import java.util.stream.Collectors;
import org.opendatadiscovery.oddplatform.dto.OwnershipDto;
import org.opendatadiscovery.oddplatform.dto.policy.DataEntityPolicyResolverContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.service.policy.comparer.ArrayFieldComparer;

public class DataEntityOwnerFieldComparer extends ArrayFieldComparer<DataEntityPolicyResolverContext> {
    public DataEntityOwnerFieldComparer() {
        super(DataEntityOwnerFieldComparer::extract, DataEntityOwnerFieldComparer::evaluate);
    }

    public static List<String> extract(final DataEntityPolicyResolverContext context) {
        return context
            .dataEntity()
            .getOwnership()
            .stream()
            .map(OwnershipDto::getOwner)
            .map(OwnerPojo::getName)
            .collect(Collectors.toList());
    }

    public static Boolean evaluate(final DataEntityPolicyResolverContext context) {
        if (context.currentOwner() == null) {
            return false;
        }
        return context.dataEntity().getOwnership().stream()
            .map(OwnershipDto::getOwner)
            .anyMatch(ownerPojo -> ownerPojo.getId().equals(context.currentOwner().getId()));
    }
}
