package org.opendatadiscovery.oddplatform.service.policy.comparer.term;

import java.util.List;
import java.util.stream.Collectors;
import org.opendatadiscovery.oddplatform.dto.policy.TermPolicyResolverContext;
import org.opendatadiscovery.oddplatform.dto.term.TermOwnershipDto;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TitlePojo;
import org.opendatadiscovery.oddplatform.service.policy.comparer.ArrayFieldComparer;

public class TermOwnerTitleFieldComparer extends ArrayFieldComparer<TermPolicyResolverContext> {
    public TermOwnerTitleFieldComparer() {
        super(TermOwnerTitleFieldComparer::extract);
    }

    public static List<String> extract(final TermPolicyResolverContext context) {
        return context
            .detailsDto()
            .getTermDto()
            .getOwnerships()
            .stream()
            .map(TermOwnershipDto::title)
            .map(TitlePojo::getName)
            .collect(Collectors.toList());
    }
}
