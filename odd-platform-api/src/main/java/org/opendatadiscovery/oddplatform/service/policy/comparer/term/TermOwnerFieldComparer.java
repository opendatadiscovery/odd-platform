package org.opendatadiscovery.oddplatform.service.policy.comparer.term;

import java.util.List;
import java.util.stream.Collectors;
import org.opendatadiscovery.oddplatform.dto.policy.TermPolicyResolverContext;
import org.opendatadiscovery.oddplatform.dto.term.TermOwnershipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.service.policy.comparer.ArrayFieldComparer;

public class TermOwnerFieldComparer extends ArrayFieldComparer<TermPolicyResolverContext> {
    public TermOwnerFieldComparer() {
        super(TermOwnerFieldComparer::extract, TermOwnerFieldComparer::evaluate);
    }

    public static List<String> extract(final TermPolicyResolverContext context) {
        return context
            .detailsDto()
            .getTermDto()
            .getOwnerships()
            .stream()
            .map(TermOwnershipDto::owner)
            .map(OwnerPojo::getName)
            .collect(Collectors.toList());
    }

    public static Boolean evaluate(final TermPolicyResolverContext context) {
        if (context.currentOwner() == null) {
            return false;
        }
        return context.detailsDto().getTermDto().getOwnerships().stream()
            .map(TermOwnershipDto::owner)
            .anyMatch(ownerPojo -> ownerPojo.getId().equals(context.currentOwner().getId()));
    }
}
