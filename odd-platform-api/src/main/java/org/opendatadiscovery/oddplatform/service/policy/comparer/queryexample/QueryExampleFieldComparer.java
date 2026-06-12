package org.opendatadiscovery.oddplatform.service.policy.comparer.queryexample;

import java.util.function.Function;
import org.opendatadiscovery.oddplatform.dto.QueryExampleDto;
import org.opendatadiscovery.oddplatform.dto.policy.QueryExamplePolicyResolverContext;
import org.opendatadiscovery.oddplatform.service.policy.comparer.SimpleFieldComparer;

public class QueryExampleFieldComparer extends SimpleFieldComparer<QueryExamplePolicyResolverContext> {
    public QueryExampleFieldComparer(final Function<QueryExampleDto, String> fieldExtractor) {
        super(context -> fieldExtractor.apply(getQueryExample(context)));
    }

    private static QueryExampleDto getQueryExample(final QueryExamplePolicyResolverContext context) {
        return context.detailsDto();
    }
}
