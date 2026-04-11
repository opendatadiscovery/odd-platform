package org.opendatadiscovery.oddplatform.service.policy.comparer.dataentity;

import java.util.function.Function;
import org.opendatadiscovery.oddplatform.dto.policy.DataEntityPolicyResolverContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.service.policy.comparer.SimpleFieldComparer;

public class DataEntityNamespaceFieldComparer extends SimpleFieldComparer<DataEntityPolicyResolverContext> {
    public DataEntityNamespaceFieldComparer(final Function<NamespacePojo, String> fieldExtractor) {
        super(context -> fieldExtractor.apply(getDataEntityNamespace(context)));
    }

    private static NamespacePojo getDataEntityNamespace(final DataEntityPolicyResolverContext context) {
        return context.dataEntity().getNamespace();
    }
}
