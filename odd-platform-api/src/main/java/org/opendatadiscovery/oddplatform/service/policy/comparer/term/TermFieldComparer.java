package org.opendatadiscovery.oddplatform.service.policy.comparer.term;

import java.util.function.Function;
import org.opendatadiscovery.oddplatform.dto.policy.TermPolicyResolverContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.service.policy.comparer.SimpleFieldComparer;

public class TermFieldComparer extends SimpleFieldComparer<TermPolicyResolverContext> {
    public TermFieldComparer(final Function<TermPojo, String> fieldExtractor) {
        super(context -> fieldExtractor.apply(getTerm(context)));
    }

    private static TermPojo getTerm(final TermPolicyResolverContext context) {
        return context.detailsDto().getTermDto().getTermRefDto().getTerm();
    }
}
