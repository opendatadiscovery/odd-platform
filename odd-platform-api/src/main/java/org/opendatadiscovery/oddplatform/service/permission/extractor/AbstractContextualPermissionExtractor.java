package org.opendatadiscovery.oddplatform.service.permission.extractor;

import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.opendatadiscovery.oddplatform.api.contract.model.Permission;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto;
import org.opendatadiscovery.oddplatform.mapper.PolicyMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.PolicyPojo;
import org.opendatadiscovery.oddplatform.service.PolicyService;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import static reactor.function.TupleUtils.function;

@RequiredArgsConstructor
public abstract class AbstractContextualPermissionExtractor<T> implements ContextualPermissionExtractor {
    private final PolicyService policyService;
    private final PolicyMapper policyMapper;

    @Override
    public Flux<Permission> getContextualResourcePermissions(final long resourceId) {
        final Mono<T> contextMono = getContext(resourceId);
        final Mono<List<PolicyPojo>> policiesMono = policyService.getCurrentUserPolicies();
        return Mono.zip(contextMono, policiesMono).flatMapIterable(function((context, policies) -> {
            final List<PolicyDto> policyDtos = policyMapper.mapToPolicyDtos(policies);
            final Set<PolicyPermissionDto> permission = policyDtos.stream()
                .flatMap(p -> getPermissions(p, context).stream())
                .collect(Collectors.toSet());
            return permission.stream().map(p -> Permission.fromValue(p.name())).collect(Collectors.toList());
        }));
    }

    protected abstract Mono<T> getContext(long resourceId);

    protected abstract Collection<PolicyPermissionDto> getPermissions(final PolicyDto policyDto, final T context);
}
