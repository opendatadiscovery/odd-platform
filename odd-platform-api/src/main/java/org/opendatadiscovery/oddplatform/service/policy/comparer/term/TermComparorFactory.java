package org.opendatadiscovery.oddplatform.service.policy.comparer.term;

import java.util.function.Function;
import org.opendatadiscovery.oddplatform.dto.policy.TermPolicyResolverContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.service.policy.comparer.Comparer;

public final class TermComparorFactory {
    private TermComparorFactory() {
    }

    public static Comparer<TermPolicyResolverContext> term(final Function<TermPojo, String> fieldExtractor) {
        return new TermFieldComparer(fieldExtractor);
    }

    public static Comparer<TermPolicyResolverContext> termOwner() {
        return new TermOwnerFieldComparer();
    }

    public static Comparer<TermPolicyResolverContext> termNamespace(
        final Function<NamespacePojo, String> fieldExtractor) {
        return new TermNamespaceFieldComparer(fieldExtractor);
    }

    public static Comparer<TermPolicyResolverContext> termTag() {
        return new TermTagFieldComparer();
    }

    public static Comparer<TermPolicyResolverContext> termOwnerTitle() {
        return new TermOwnerTitleFieldComparer();
    }
}
