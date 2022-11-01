package org.opendatadiscovery.oddplatform.service.permission.extractor;

import java.util.Collection;
import org.opendatadiscovery.oddplatform.auth.AuthIdentityProvider;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyPermissionDto;
import org.opendatadiscovery.oddplatform.dto.policy.PolicyTypeDto;
import org.opendatadiscovery.oddplatform.dto.policy.TermPolicyResolverContext;
import org.opendatadiscovery.oddplatform.dto.term.TermDetailsDto;
import org.opendatadiscovery.oddplatform.mapper.PolicyMapper;
import org.opendatadiscovery.oddplatform.model.tables.pojos.OwnerPojo;
import org.opendatadiscovery.oddplatform.repository.reactive.ReactiveTermRepository;
import org.opendatadiscovery.oddplatform.service.PolicyService;
import org.opendatadiscovery.oddplatform.service.policy.PolicyPermissionExtractor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class TermPermissionExtractor extends AbstractContextualPermissionExtractor<TermPolicyResolverContext> {
    private final PolicyPermissionExtractor policyPermissionExtractor;
    private final ReactiveTermRepository termRepository;
    private final AuthIdentityProvider authIdentityProvider;

    public TermPermissionExtractor(final PolicyService policyService,
                                   final PolicyMapper policyMapper,
                                   final PolicyPermissionExtractor extractor,
                                   final ReactiveTermRepository termRepository,
                                   final AuthIdentityProvider authIdentityProvider) {
        super(policyService, policyMapper);
        this.policyPermissionExtractor = extractor;
        this.termRepository = termRepository;
        this.authIdentityProvider = authIdentityProvider;
    }

    @Override
    public PolicyTypeDto getResourceType() {
        return PolicyTypeDto.TERM;
    }

    @Override
    protected Mono<TermPolicyResolverContext> getContext(final long resourceId) {
        final Mono<TermDetailsDto> dtoMono = termRepository.getTermDetailsDto(resourceId)
            .switchIfEmpty(Mono.error(
                () -> new IllegalArgumentException("Term with id %s is not present".formatted(resourceId))));
        final Mono<OwnerPojo> ownerPojoMono = authIdentityProvider.fetchAssociatedOwner();
        return ownerPojoMono
            .zipWith(dtoMono)
            .map(tuple -> new TermPolicyResolverContext(tuple.getT2(), tuple.getT1()))
            .switchIfEmpty(Mono.defer(() -> dtoMono.map(dto -> new TermPolicyResolverContext(dto, null))));
    }

    @Override
    protected Collection<PolicyPermissionDto> getPermissions(final PolicyDto policyDto,
                                                             final TermPolicyResolverContext context) {
        return policyPermissionExtractor.extractTermPermissions(policyDto.getStatements(), context);
    }
}
