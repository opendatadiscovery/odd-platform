package org.opendatadiscovery.oddplatform.service.policy;

import java.util.Collection;
import java.util.List;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.dto.policy.DataEntityPolicyResolverContext;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyStatementDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyTypeDto;
import org.opendatadiscovery.oddplatform.dto.policy.TermPolicyResolverContext;
import org.opendatadiscovery.oddplatform.service.policy.resolver.ConditionResolver;
import org.opendatadiscovery.oddplatform.service.policy.resolver.DataEntityConditionResolver;
import org.opendatadiscovery.oddplatform.service.policy.resolver.NoContextConditionResolver;
import org.opendatadiscovery.oddplatform.service.policy.resolver.TermConditionResolver;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PolicyPermissionExtractor {
    private final DataEntityConditionResolver dataEntityResolver;
    private final TermConditionResolver termResolver;
    private final NoContextConditionResolver noContextConditionResolver;

    public Collection<PolicyPermissionDto> extractDataEntityPermissions(final List<PolicyStatementDto> statements,
                                                                        final DataEntityPolicyResolverContext context) {
        return permissions(statements, dataEntityResolver, PolicyTypeDto.DATA_ENTITY, context);
    }

    public Collection<PolicyPermissionDto> extractTermPermissions(final List<PolicyStatementDto> statements,
                                                                  final TermPolicyResolverContext context) {
        return permissions(statements, termResolver, PolicyTypeDto.TERM, context);
    }

    public Collection<PolicyPermissionDto> extractManagementPermissions(final List<PolicyStatementDto> statements) {
        return permissions(statements, noContextConditionResolver, PolicyTypeDto.MANAGEMENT, null);
    }

    private <T> Collection<PolicyPermissionDto> permissions(final List<PolicyStatementDto> statements,
                                                            final ConditionResolver<T> resolver,
                                                            final PolicyTypeDto type,
                                                            final T context) {
        return statements.stream()
            .filter(s -> s.getResource().getType().equals(type))
            .filter(s -> resolver.resolve(s.getResource().getConditions(), context))
            .flatMap(s -> {
                if (allPermissions(s)) {
                    return getPermissionsByType(type);
                }
                return s.getPermissions().stream();
            })
            .toList();
    }

    private boolean allPermissions(final PolicyStatementDto statementDto) {
        return statementDto.getPermissions().stream().anyMatch(p -> p == PolicyPermissionDto.ALL);
    }

    private Stream<PolicyPermissionDto> getPermissionsByType(final PolicyTypeDto policyTypeDto) {
        return Stream.of(PolicyPermissionDto.values()).filter(p -> p.getType() == policyTypeDto);
    }
}
