package org.opendatadiscovery.oddplatform.service.policy.resolver;

import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto;
import org.opendatadiscovery.oddplatform.dto.policy.QueryExamplePolicyResolverContext;
import org.opendatadiscovery.oddplatform.service.policy.comparer.Comparer;
import org.springframework.stereotype.Component;

import static java.util.Map.entry;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto.QUERY_EXAMPLE_NAME;
import static org.opendatadiscovery.oddplatform.service.policy.comparer.queryexample.QueryExampleComparorFactory.queryExample;

@Component
public class QueryExampleConditionResolver extends AbstractConditionResolver<QueryExamplePolicyResolverContext> {

    private static final Map<PolicyConditionKeyDto, Comparer<QueryExamplePolicyResolverContext>> FIELDS = Map.ofEntries(
        entry(QUERY_EXAMPLE_NAME, queryExample(item -> item.queryExamplePojo().getDefinition()))
    );

    @Override
    protected Map<PolicyConditionKeyDto, Comparer<QueryExamplePolicyResolverContext>> getFieldExtractorMap() {
        return FIELDS;
    }
}
