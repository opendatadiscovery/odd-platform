package org.opendatadiscovery.oddplatform.service.policy.resolver;

import java.util.Map;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto;
import org.opendatadiscovery.oddplatform.dto.policy.TermPolicyResolverContext;
import org.opendatadiscovery.oddplatform.model.tables.pojos.NamespacePojo;
import org.opendatadiscovery.oddplatform.model.tables.pojos.TermPojo;
import org.opendatadiscovery.oddplatform.service.policy.comparer.Comparer;
import org.springframework.stereotype.Component;

import static java.util.Map.entry;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto.TERM_NAME;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto.TERM_NAMESPACE_NAME;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto.TERM_OWNER;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto.TERM_OWNER_TITLE;
import static org.opendatadiscovery.oddplatform.dto.policy.PolicyConditionKeyDto.TERM_TAG_NAME;
import static org.opendatadiscovery.oddplatform.service.policy.comparer.term.TermComparorFactory.term;
import static org.opendatadiscovery.oddplatform.service.policy.comparer.term.TermComparorFactory.termNamespace;
import static org.opendatadiscovery.oddplatform.service.policy.comparer.term.TermComparorFactory.termOwner;
import static org.opendatadiscovery.oddplatform.service.policy.comparer.term.TermComparorFactory.termOwnerTitle;
import static org.opendatadiscovery.oddplatform.service.policy.comparer.term.TermComparorFactory.termTag;

@Component
public class TermConditionResolver extends AbstractConditionResolver<TermPolicyResolverContext> {
    private static final Map<PolicyConditionKeyDto, Comparer<TermPolicyResolverContext>> FIELDS = Map.ofEntries(
        entry(TERM_NAME, term(TermPojo::getName)),
        entry(TERM_OWNER, termOwner()),
        entry(TERM_NAMESPACE_NAME, termNamespace(NamespacePojo::getName)),
        entry(TERM_TAG_NAME, termTag()),
        entry(TERM_OWNER_TITLE, termOwnerTitle())
    );

    @Override
    protected Map<PolicyConditionKeyDto, Comparer<TermPolicyResolverContext>> getFieldExtractorMap() {
        return FIELDS;
    }
}
