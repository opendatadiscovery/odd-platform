package org.opendatadiscovery.oddplatform.service.policy.comparer.term;

import java.util.List;
import org.opendatadiscovery.oddplatform.dto.policy.TermPolicyResolverContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TagPojo;
import org.opendatadiscovery.oddplatform.service.policy.comparer.ArrayFieldComparer;

public class TermTagFieldComparer extends ArrayFieldComparer<TermPolicyResolverContext> {
    public TermTagFieldComparer() {
        super(TermTagFieldComparer::extract);
    }

    private static List<String> extract(final TermPolicyResolverContext context) {
        return context.detailsDto().getTags().stream()
            .map(TagPojo::getName)
            .toList();
    }
}
