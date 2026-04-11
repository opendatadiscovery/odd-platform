package org.opendatadiscovery.oddplatform.service.policy.comparer.term;

import java.util.function.Function;
import org.opendatadiscovery.oddplatform.dto.policy.TermPolicyResolverContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.service.policy.comparer.SimpleFieldComparer;

public class TermNamespaceFieldComparer extends SimpleFieldComparer<TermPolicyResolverContext> {
    public TermNamespaceFieldComparer(final Function<NamespacePojo, String> fieldExtractor) {
        super(context -> fieldExtractor.apply(getTermNamespace(context)));
    }

    private static NamespacePojo getTermNamespace(final TermPolicyResolverContext context) {
        return context.detailsDto().getTermDto().getTermRefDto().getNamespace();
    }
}
