package org.opendatadiscovery.oddplatform.service.policy.comparer.queryexample;

import java.util.function.Function;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.dto.policy.QueryExamplePolicyResolverContext;
import org.opendatadiscovery.oddplatform.service.policy.comparer.Comparer;

public final class QueryExampleComparorFactory {
    private QueryExampleComparorFactory() {}

    public static Comparer<QueryExamplePolicyResolverContext>
        queryExample(final Function<QueryExampleDto, String> fieldExtractor) {
        return new QueryExampleFieldComparer(fieldExtractor);
    }
}
